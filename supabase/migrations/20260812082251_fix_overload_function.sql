-- Drop all overloaded versions
DROP FUNCTION IF EXISTS public.stripe_confirm_payment(UUID, TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.stripe_confirm_payment(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.stripe_confirm_payment(UUID, TEXT);

-- Recreate the correct version (from migration 20260830000003)
CREATE OR REPLACE FUNCTION public.stripe_confirm_payment(
  p_session_id UUID,
  p_transaction_id TEXT,
  p_currency TEXT DEFAULT 'npr'
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
  RAISE LOG '[stripe_confirm_payment] Function called: session_id=%, transaction_id=%, currency=%', p_session_id, p_transaction_id, p_currency;
  
  IF v_caller_role <> 'service_role' THEN
    RAISE LOG '[stripe_confirm_payment] Unauthorized access attempt: role=%', v_caller_role;
    RAISE EXCEPTION 'Unauthorized: only the Stripe webhook can confirm payments' USING ERRCODE = '42501';
  END IF;
  
  IF p_transaction_id IS NULL OR length(trim(p_transaction_id)) = 0 THEN
    RAISE LOG '[stripe_confirm_payment] Validation failed: missing transaction_id';
    RAISE EXCEPTION 'Transaction id is required';
  END IF;
  
  SELECT
    amount, gateway, status, donor_id, frequency, student_id, message
  INTO
    v_amount, v_gateway, v_session_status, v_donor_id, v_frequency, v_student_id, v_message
  FROM payment_sessions
  WHERE id = p_session_id;
  
  RAISE LOG '[stripe_confirm_payment] Session retrieved: amount=%, gateway=%, status=%, donor_id=%', v_amount, v_gateway, v_session_status, v_donor_id;
  
  IF v_donor_id IS NULL THEN
    RAISE LOG '[stripe_confirm_payment] Session not found: session_id=%', p_session_id;
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  
  IF v_session_status = 'completed' THEN
    RAISE LOG '[stripe_confirm_payment] Already completed: session_id=%', p_session_id;
    RETURN true;
  END IF;
  
  IF v_session_status NOT IN ('pending', 'processing') THEN
    RAISE LOG '[stripe_confirm_payment] Invalid state: status=%', v_session_status;
    RAISE EXCEPTION 'Payment session cannot be confirmed from state %', v_session_status;
  END IF;

  v_receipt_number := generate_receipt_number();
  INSERT INTO donations (
    donor_id, amount, frequency, student_id, message, payment_method,
    status, verification_status, transaction_id, payment_session_id,
    verified_by, verified_at, approved_by, approved_at
  )
  VALUES (
    v_donor_id, v_amount, COALESCE(v_frequency, 'one-time'), v_student_id, v_message,
    v_gateway, 'completed', 'verified', p_transaction_id, p_session_id,
    auth.uid(), now(), auth.uid(), now()
  )
  RETURNING id INTO v_donation_id;

  UPDATE payment_sessions
  SET status = 'completed',
      donation_id = v_donation_id,
      transaction_id = p_transaction_id,
      verification_status = 'verified',
      verified_by = auth.uid(),
      verified_at = now(),
      verification_notes = 'Auto-verified via Stripe webhook',
      approved_by = auth.uid(),
      approved_at = now(),
      approval_notes = 'Auto-approved via Stripe webhook',
      updated_at = now()
  WHERE id = p_session_id;

  INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
  VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
    'generated_at', now(),
    'amount', v_amount,
    'gateway', v_gateway,
    'transaction_id', p_transaction_id,
    'currency', upper(p_currency)
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
  VALUES (p_session_id, auth.uid(), 'verified', 'Auto-verified via Stripe webhook');

  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id, 'payment_completed', NULL, 'service_role',
    jsonb_build_object('donation_id', v_donation_id, 'transaction_id', p_transaction_id)
  );

  RAISE LOG '[stripe_confirm_payment] Payment confirmed successfully: donation_id=%', v_donation_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.stripe_confirm_payment(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stripe_confirm_payment(UUID, TEXT, TEXT) TO service_role;