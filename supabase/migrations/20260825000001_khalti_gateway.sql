-- Khalti ePayment gateway: server-side confirmation functions.
-- Mirrors the Stripe/eSewa pattern: the Khalti callback Edge Function runs with
-- service_role and finalizes the payment session without manual admin review.

-- ---------------------------------------------------------------------------
-- 1. Mark automated gateways so existing manual settings don't conflict.
--    Khalti now redirects to Khalti's hosted payment page instead of the old
--    "send money to this Khalti ID + upload screenshot" flow, so the stale
--    manual data on the existing Khalti row is cleaned up below.
-- ---------------------------------------------------------------------------
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS is_automated BOOLEAN NOT NULL DEFAULT false;

UPDATE public.payment_settings
SET is_automated = true
WHERE gateway_name IN ('khalti', 'stripe');

-- Refresh the existing Khalti payment setting row so the old manual
-- account/QR/instruction data does not surface anywhere in checkout.
UPDATE public.payment_settings
SET gateway_display_name = 'Khalti',
    gateway_description = 'Pay securely with your Khalti digital wallet',
    account_name = '',
    account_number = '',
    qr_image_url = NULL,
    instructions = 'You will be redirected to Khalti to complete your donation securely.',
    updated_at = now()
WHERE gateway_name = 'khalti';

-- ---------------------------------------------------------------------------
-- 2. Confirmation / failure functions (service_role only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.khalti_confirm_payment(
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
    RAISE EXCEPTION 'Unauthorized: only the Khalti callback can confirm payments' USING ERRCODE = '42501';
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
      verification_notes = 'Auto-verified via Khalti callback',
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
  VALUES (p_session_id, NULL, 'verified', 'Auto-verified via Khalti callback');

  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id, 'payment_verified', NULL, 'service_role',
    jsonb_build_object('donation_id', v_donation_id, 'transaction_id', p_transaction_id)
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.khalti_fail_payment(
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
    RAISE EXCEPTION 'Unauthorized: only the Khalti callback can update payments' USING ERRCODE = '42501';
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
  VALUES (p_session_id, NULL, p_status, 'Khalti callback: ' || p_status);
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (p_session_id, 'payment_' || p_status, NULL, 'service_role', jsonb_build_object('khalti_status', p_status));
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.khalti_confirm_payment FROM PUBLIC;
REVOKE ALL ON FUNCTION public.khalti_fail_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.khalti_confirm_payment TO service_role;
GRANT EXECUTE ON FUNCTION public.khalti_fail_payment TO service_role;

NOTIFY pgrst, 'reload schema';