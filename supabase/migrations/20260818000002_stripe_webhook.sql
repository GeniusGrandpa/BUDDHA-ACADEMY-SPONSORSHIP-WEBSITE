CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  details jsonb,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.stripe_confirm_payment(
  p_session_id UUID,
  p_transaction_id TEXT
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

CREATE OR REPLACE FUNCTION public.stripe_fail_payment(
  p_session_id UUID,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_status TEXT;
BEGIN
  SELECT coalesce(auth.role(), '') INTO v_caller_role;
  IF v_caller_role <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: only the Stripe webhook can update payments' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('failed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status. Must be failed or cancelled';
  END IF;
  SELECT status INTO v_status FROM payment_sessions WHERE id = p_session_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  IF v_status = 'completed' THEN
    RETURN true;
  END IF;
  IF v_status NOT IN ('pending', 'processing') THEN
    RETURN true;
  END IF;
  UPDATE payment_sessions
  SET status = p_status, updated_at = now()
  WHERE id = p_session_id;
  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, NULL, p_status, 'Stripe webhook: ' || p_status);
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (p_session_id, 'payment_' || p_status, NULL, 'service_role', jsonb_build_object('stripe_status', p_status));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION submit_payment_confirmation(
  p_session_id UUID,
  p_screenshots TEXT[] DEFAULT '{}',
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donor_id UUID;
  v_status TEXT;
BEGIN
  SELECT donor_id, status INTO v_donor_id, v_status
  FROM payment_sessions
  WHERE id = p_session_id;
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this payment session';
  END IF;
  IF v_status IN ('processing', 'completed') THEN
    RETURN true;
  END IF;
  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Payment session is not in pending state';
  END IF;
  UPDATE payment_sessions
  SET status = 'processing',
      screenshots = array_cat(COALESCE(screenshots, '{}'), COALESCE(p_screenshots, '{}')),
      payment_reference = COALESCE(p_payment_reference, payment_reference),
      updated_at = now()
  WHERE id = p_session_id;
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (p_session_id, 'processing', 'Donor submitted payment confirmation');
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, details)
  VALUES (
    p_session_id,
    'payment_submitted',
    auth.uid(),
    jsonb_build_object('screenshots_count', COALESCE(array_length(p_screenshots, 1), 0))
  );
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.stripe_confirm_payment FROM PUBLIC;
REVOKE ALL ON FUNCTION public.stripe_fail_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stripe_confirm_payment TO service_role;
GRANT EXECUTE ON FUNCTION public.stripe_fail_payment TO service_role;

DROP FUNCTION IF EXISTS public.initiate_payment_checkout(text, numeric, text, uuid, text, text);
DROP FUNCTION IF EXISTS public.initiate_payment_checkout(numeric, text, text, text, text, uuid);
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
  IF p_gateway NOT IN ('khalti', 'esewa', 'mobile_banking', 'stripe') THEN
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
NOTIFY pgrst, 'reload schema';
