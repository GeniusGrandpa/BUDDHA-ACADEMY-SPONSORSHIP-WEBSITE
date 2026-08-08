-- Remove the manual "proof of payment" (screenshot) system.
--
-- Only server-verified gateway confirmations can mark a payment as paid:
--   - Stripe  -> payment_intent.succeeded webhook -> stripe_confirm_payment
--   - eSewa   -> signed callback + status lookup  -> esewa_confirm_payment
--   - Khalti  -> lookup API (status = Completed)  -> khalti_confirm_payment
--
-- The manual mobile_banking gateway (bank transfer / Fonepay) had no webhook
-- and relied on donor-submitted screenshots + admin review, so it is removed as
-- a public payment option. Historical payment_sessions/donations rows are kept.

-- 1. Drop proof-only columns from payment_sessions.
ALTER TABLE public.payment_sessions DROP COLUMN IF EXISTS screenshots;
ALTER TABLE public.payment_sessions DROP COLUMN IF EXISTS payment_reference;

-- 2. Drop the donor screenshot-submission RPC (all historical signatures).
DROP FUNCTION IF EXISTS public.submit_payment_confirmation(uuid, text[], text);
DROP FUNCTION IF EXISTS public.submit_payment_confirmation(uuid, text[]);

-- 3. Drop the admin manual-review RPC (the screenshot verification workflow).
DROP FUNCTION IF EXISTS public.verify_payment(uuid, text, text);

-- 4. Restrict checkout to server-verified gateways only (no mobile_banking).
CREATE OR REPLACE FUNCTION public.initiate_payment_checkout(
  p_amount numeric,
  p_frequency text,
  p_gateway text,
  p_idempotency_key text,
  p_message text,
  p_student_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_transaction_id TEXT;
  v_existing_session payment_sessions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Authentication required'
    );
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid donation amount'
    );
  END IF;
  IF p_gateway NOT IN ('khalti', 'esewa', 'stripe') THEN
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid payment gateway'
    );
  END IF;
  IF p_frequency NOT IN ('one-time', 'monthly', 'annual') THEN
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid donation frequency'
    );
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing_session
    FROM payment_sessions
    WHERE idempotency_key = p_idempotency_key
      AND donor_id = auth.uid()
    LIMIT 1;
    IF FOUND THEN
      IF v_existing_session.status IN ('pending', 'processing') THEN
        RETURN json_build_object(
          'success', true,
          'payment_id', v_existing_session.id,
          'checkout_url', '/donate/checkout/' || v_existing_session.id,
          'message', 'Payment session retrieved from idempotency key',
          'session_id', v_existing_session.id,
          'transaction_id', v_existing_session.transaction_id
        );
      ELSE
        RETURN json_build_object(
          'success', false,
          'payment_id', null,
          'checkout_url', null,
          'message', 'Payment session with this idempotency key already finalized'
        );
      END IF;
    END IF;
  END IF;
  v_transaction_id := generate_transaction_id();
  INSERT INTO payment_sessions (
    donor_id,
    gateway,
    amount,
    frequency,
    student_id,
    message,
    transaction_id,
    status,
    idempotency_key
  )
  VALUES (
    auth.uid(),
    p_gateway,
    p_amount,
    p_frequency,
    p_student_id,
    p_message,
    v_transaction_id,
    'pending',
    p_idempotency_key
  )
  RETURNING id INTO v_session_id;
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (v_session_id, 'submitted', 'Payment checkout initiated');
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, details)
  VALUES (
    v_session_id,
    'checkout_initiated',
    auth.uid(),
    jsonb_build_object('gateway', p_gateway, 'amount', p_amount, 'frequency', p_frequency)
  );
  RETURN json_build_object(
    'success', true,
    'payment_id', v_session_id,
    'checkout_url', '/donate/checkout/' || v_session_id,
    'message', 'Payment checkout initiated successfully',
    'session_id', v_session_id,
    'transaction_id', v_transaction_id
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid) TO authenticated;

-- 5. Strengthen Stripe confirmation: the webhook must now pass the charge
--    amount (in NPR major units) and currency, which are cross-checked against
--    the payment session before the donation is created.
CREATE OR REPLACE FUNCTION public.stripe_confirm_payment(
  p_session_id UUID,
  p_transaction_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_donation_id UUID;
  v_receipt_number TEXT;
  v_amount NUMERIC;
  v_gateway TEXT;
  v_session_status TEXT;
  v_donor_id UUID;
  v_frequency TEXT;
  v_student_id UUID;
  v_message TEXT;
BEGIN
  SELECT coalesce(auth.role(), '') INTO v_caller_role;
  IF v_caller_role <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: only the Stripe webhook can confirm payments' USING ERRCODE = '42501';
  END IF;
  IF p_transaction_id IS NULL OR length(trim(p_transaction_id)) = 0 THEN
    RAISE EXCEPTION 'Transaction id is required';
  END IF;
  SELECT
    amount, gateway, status, donor_id, frequency, student_id, message
  INTO
    v_amount, v_gateway, v_session_status, v_donor_id, v_frequency, v_student_id, v_message
  FROM payment_sessions
  WHERE id = p_session_id;
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  IF v_session_status = 'completed' THEN
    RETURN true;
  END IF;
  IF v_session_status NOT IN ('pending', 'processing') THEN
    RAISE EXCEPTION 'Payment session cannot be confirmed from state %', v_session_status;
  END IF;
  IF p_amount IS NULL OR lower(coalesce(p_currency, '')) <> 'npr' OR abs(p_amount - v_amount) > 0.01 THEN
    RAISE EXCEPTION 'Stripe charge amount/currency does not match the payment session';
  END IF;

  v_receipt_number := generate_receipt_number();
  INSERT INTO donations (
    donor_id, amount, frequency, student_id, message, payment_method,
    status, transaction_id, payment_session_id, verified_at, verified_by
  )
  VALUES (
    v_donor_id, v_amount, COALESCE(v_frequency, 'one-time'), v_student_id, v_message,
    v_gateway, 'completed', p_transaction_id, p_session_id, now(), NULL
  )
  RETURNING id INTO v_donation_id;

  UPDATE payment_sessions
  SET status = 'completed',
      donation_id = v_donation_id,
      transaction_id = p_transaction_id,
      verified_by = NULL,
      verified_at = now(),
      verification_notes = 'Auto-verified via Stripe webhook',
      updated_at = now()
  WHERE id = p_session_id;

  INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
  VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
    'generated_at', now(),
    'amount', v_amount,
    'gateway', v_gateway,
    'transaction_id', p_transaction_id,
    'currency', 'NPR'
  ));

  INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
  VALUES
    (v_donation_id, 'Educational Materials', 30.00, v_amount * 0.30),
    (v_donation_id, 'Student Meals', 25.00, v_amount * 0.25),
    (v_donation_id, 'School Supplies', 15.00, v_amount * 0.15),
    (v_donation_id, 'Uniform Support', 15.00, v_amount * 0.15),
    (v_donation_id, 'Events & Activities', 10.00, v_amount * 0.10),
    (v_donation_id, 'Operations', 5.00, v_amount * 0.05);

  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.sponsorships (donor_id, student_id, amount, status, start_date)
    VALUES (v_donor_id, v_student_id, v_amount::integer, 'active', now())
    ON CONFLICT (donor_id, student_id) DO NOTHING;
    IF FOUND THEN
      UPDATE public.students
      SET
        current_sponsorship = current_sponsorship + v_amount::integer,
        sponsorship_status = CASE
          WHEN current_sponsorship + v_amount::integer >= sponsorship_amount THEN 'fully_sponsored'
          ELSE 'partially_sponsored'
        END,
        updated_at = now()
      WHERE id = v_student_id;
    END IF;
  END IF;

  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, NULL, 'verified', 'Auto-verified via Stripe webhook');

  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id, 'payment_verified', NULL, 'service_role',
    jsonb_build_object('donation_id', v_donation_id, 'transaction_id', p_transaction_id)
  );

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.stripe_confirm_payment(uuid, text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stripe_confirm_payment(uuid, text, numeric, text) TO service_role;

-- 6. Deactivate the manual mobile_banking gateway setting (row kept for history).
UPDATE public.payment_settings
SET is_active = false, updated_at = now()
WHERE gateway_name = 'mobile_banking';

-- 7. eSewa is callback-verified like Khalti/Stripe; reflect that in settings.
UPDATE public.payment_settings
SET is_automated = true, updated_at = now()
WHERE gateway_name = 'esewa';

-- 8. Remove the payment-screenshots policies and the bucket itself if empty.
DROP POLICY IF EXISTS "payment_screenshots_insert" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_select_own" ON storage.objects;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'payment-screenshots') THEN
    DELETE FROM storage.buckets WHERE id = 'payment-screenshots';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
