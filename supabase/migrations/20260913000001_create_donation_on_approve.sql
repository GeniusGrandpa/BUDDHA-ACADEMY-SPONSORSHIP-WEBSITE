-- Fix: Create donations row when approving Khalti/eSewa payments
--
-- Previously, approve_payment() only UPDATEed existing donations rows.
-- For Khalti/eSewa payments, no donation row was ever created by the
-- callback Edge Functions, so the UPDATE affected zero rows silently.
-- The donor dashboard then showed $0 because it queries the donations table.
--
-- This migration updates approve_payment (and verify_payment) to
-- INSERT a donations row if one doesn't already exist for the session.

CREATE OR REPLACE FUNCTION public.verify_payment(
  p_session_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_role TEXT;
  v_role_level INTEGER;
  v_current_status TEXT;
  v_current_verification TEXT;
  v_session RECORD;
  v_donation_exists BOOLEAN;
  v_donation_id UUID;
BEGIN
  SELECT coalesce(auth.role(), '') INTO v_caller_role;
  v_role_level := public.get_user_role_level();
  RAISE LOG '[verify_payment] Function called: session_id=%, caller_role=%, role_level=%', p_session_id, v_caller_role, v_role_level;

  IF v_role_level < 80 THEN
    RAISE EXCEPTION 'Unauthorized: only finance_manager or above can verify payments' USING ERRCODE = '42501';
  END IF;

  SELECT status, verification_status INTO v_current_status, v_current_verification
  FROM payment_sessions WHERE id = p_session_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;

  IF v_current_status = 'completed' AND v_current_verification = 'verified' THEN
    RAISE LOG '[verify_payment] Already verified: session_id=%', p_session_id;
    RETURN true;
  END IF;

  IF v_current_status != 'payment_received' THEN
    RAISE EXCEPTION 'Payment session must be in payment_received status to verify (automated gateways auto-verify), current status: %', v_current_status;
  END IF;

  IF v_current_verification != 'pending_verification' THEN
    RAISE EXCEPTION 'Payment session must be pending_verification to verify, current verification_status: %', v_current_verification;
  END IF;

  -- Fetch session data for donation creation
  SELECT * INTO v_session FROM payment_sessions WHERE id = p_session_id;

  SELECT EXISTS(SELECT 1 FROM donations WHERE payment_session_id = p_session_id) INTO v_donation_exists;

  IF NOT v_donation_exists THEN
    INSERT INTO donations (
      donor_id, amount, frequency, student_id, message, payment_method,
      status, verification_status, transaction_id, payment_session_id,
      verified_by, verified_at
    )
    VALUES (
      v_session.donor_id, v_session.amount, COALESCE(v_session.frequency, 'one-time'),
      v_session.student_id, v_session.message, v_session.gateway,
      'verified', 'verified', v_session.transaction_id, p_session_id,
      auth.uid(), now()
    )
    RETURNING id INTO v_donation_id;

    UPDATE payment_sessions SET donation_id = v_donation_id WHERE id = p_session_id;

    RAISE LOG '[verify_payment] Created donation row: donation_id=%', v_donation_id;
  ELSE
    UPDATE donations
    SET verification_status = 'verified',
        verified_by = auth.uid(),
        verified_at = now()
    WHERE payment_session_id = p_session_id;
  END IF;

  UPDATE payment_sessions
  SET verification_status = 'verified',
      verified_by = auth.uid(),
      verified_at = now(),
      verification_notes = p_notes,
      updated_at = now()
  WHERE id = p_session_id;

  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id, 'payment_verified', auth.uid(), v_caller_role,
    jsonb_build_object('notes', p_notes)
  );

  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, auth.uid(), 'verified', p_notes);

  RAISE LOG '[verify_payment] Payment verified: session_id=%', p_session_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_payment(
  p_session_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_role TEXT;
  v_role_level INTEGER;
  v_current_status TEXT;
  v_current_verification TEXT;
  v_session RECORD;
  v_donation_exists BOOLEAN;
  v_donation_id UUID;
  v_receipt_number TEXT;
BEGIN
  SELECT coalesce(auth.role(), '') INTO v_caller_role;
  v_role_level := public.get_user_role_level();
  RAISE LOG '[approve_payment] Function called: session_id=%, caller_role=%, role_level=%', p_session_id, v_caller_role, v_role_level;

  IF v_role_level < 90 THEN
    RAISE EXCEPTION 'Unauthorized: only admin or above can approve payments' USING ERRCODE = '42501';
  END IF;

  SELECT status, verification_status INTO v_current_status, v_current_verification
  FROM payment_sessions WHERE id = p_session_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;

  IF v_current_status = 'completed' AND v_current_verification = 'verified' THEN
    RAISE LOG '[approve_payment] Already approved: session_id=%', p_session_id;
    RETURN true;
  END IF;

  IF v_current_status != 'payment_received' THEN
    RAISE EXCEPTION 'Payment session must be in payment_received status to approve, current status: %', v_current_status;
  END IF;

  IF v_current_verification != 'verified' THEN
    RAISE EXCEPTION 'Payment session must be verified before approval, current verification_status: %', v_current_verification;
  END IF;

  -- Fetch session data for donation creation
  SELECT * INTO v_session FROM payment_sessions WHERE id = p_session_id;

  SELECT EXISTS(SELECT 1 FROM donations WHERE payment_session_id = p_session_id) INTO v_donation_exists;

  IF NOT v_donation_exists THEN
    v_receipt_number := generate_receipt_number();

    INSERT INTO donations (
      donor_id, amount, frequency, student_id, message, payment_method,
      status, verification_status, transaction_id, payment_session_id,
      verified_by, verified_at, approved_by, approved_at
    )
    VALUES (
      v_session.donor_id, v_session.amount, COALESCE(v_session.frequency, 'one-time'),
      v_session.student_id, v_session.message, v_session.gateway,
      'completed', 'verified', v_session.transaction_id, p_session_id,
      v_session.verified_by, v_session.verified_at, auth.uid(), now()
    )
    RETURNING id INTO v_donation_id;

    UPDATE payment_sessions SET donation_id = v_donation_id WHERE id = p_session_id;

    INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
    VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
      'generated_at', now(),
      'amount', v_session.amount,
      'gateway', v_session.gateway,
      'transaction_id', v_session.transaction_id,
      'currency', COALESCE(v_session.currency, 'NPR')
    ));

    INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
    VALUES
      (v_donation_id, 'Educational Materials', 30.00, v_session.amount * 0.30),
      (v_donation_id, 'Student Meals', 25.00, v_session.amount * 0.25),
      (v_donation_id, 'School Supplies', 15.00, v_session.amount * 0.15),
      (v_donation_id, 'Uniform Support', 15.00, v_session.amount * 0.15),
      (v_donation_id, 'Events & Activities', 10.00, v_session.amount * 0.10),
      (v_donation_id, 'Operations', 5.00, v_session.amount * 0.05);

    RAISE LOG '[approve_payment] Created donation row: donation_id=%', v_donation_id;
  ELSE
    UPDATE donations
    SET status = 'completed',
        approved_by = auth.uid(),
        approved_at = now()
    WHERE payment_session_id = p_session_id;
  END IF;

  UPDATE payment_sessions
  SET status = 'completed',
      approved_by = auth.uid(),
      approved_at = now(),
      approval_notes = p_notes,
      updated_at = now()
  WHERE id = p_session_id;

  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id, 'payment_approved', auth.uid(), v_caller_role,
    jsonb_build_object('notes', p_notes)
  );

  RAISE LOG '[approve_payment] Payment approved: session_id=%', p_session_id;
  RETURN true;
END;
$$;
