CREATE OR REPLACE FUNCTION verify_payment(
  p_session_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donation_id UUID;
  v_receipt_number TEXT;
  v_actor_role TEXT;
  v_amount NUMERIC;
  v_gateway TEXT;
  v_transaction_id TEXT;
  v_session_status TEXT;
  v_donor_id UUID;
  v_frequency TEXT;
  v_student_id UUID;
  v_message TEXT;
  v_payment_reference TEXT;
BEGIN
  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can verify payments';
  END IF;
  IF p_status NOT IN ('verified', 'rejected', 'failed') THEN
    RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or failed';
  END IF;
  SELECT
    donation_id,
    amount,
    gateway,
    transaction_id,
    status,
    donor_id,
    frequency,
    student_id,
    message,
    payment_reference
  INTO
    v_donation_id,
    v_amount,
    v_gateway,
    v_transaction_id,
    v_session_status,
    v_donor_id,
    v_frequency,
    v_student_id,
    v_message,
    v_payment_reference
  FROM payment_sessions
  WHERE id = p_session_id;
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  IF v_session_status = 'completed' AND v_donation_id IS NOT NULL AND p_status = 'verified' THEN
    RETURN true;
  END IF;
  IF v_session_status NOT IN ('processing') THEN
    RAISE EXCEPTION 'Only submitted payments awaiting verification can be reviewed';
  END IF;
  IF p_status = 'verified' THEN
    IF v_transaction_id IS NULL OR length(trim(v_transaction_id)) = 0 THEN
      RAISE EXCEPTION 'Payment reference / transaction_id is required before verification';
    END IF;
    v_receipt_number := generate_receipt_number();
    INSERT INTO donations (
      donor_id,
      amount,
      frequency,
      student_id,
      message,
      payment_method,
      status,
      transaction_id,
      payment_session_id,
      verified_at,
      verified_by
    )
    VALUES (
      v_donor_id,
      v_amount,
      COALESCE(v_frequency, 'one-time'),
      v_student_id,
      v_message,
      v_gateway,
      'completed',
      COALESCE(v_payment_reference, v_transaction_id),
      p_session_id,
      now(),
      auth.uid()
    )
    RETURNING id INTO v_donation_id;
    UPDATE payment_sessions
    SET status = 'completed',
        donation_id = v_donation_id,
        verified_by = auth.uid(),
        verified_at = now(),
        verification_notes = p_notes,
        updated_at = now()
    WHERE id = p_session_id;
    INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
    VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
      'generated_at', now(),
      'amount', v_amount,
      'gateway', v_gateway,
      'transaction_id', COALESCE(v_payment_reference, v_transaction_id),
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
  ELSE
    UPDATE payment_sessions
    SET status = CASE WHEN p_status = 'rejected' THEN 'failed' ELSE 'failed' END,
        verified_by = auth.uid(),
        verified_at = now(),
        verification_notes = p_notes,
        updated_at = now()
    WHERE id = p_session_id;
  END IF;
  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (
    p_session_id,
    auth.uid(),
    CASE WHEN p_status = 'verified' THEN 'verified' ELSE p_status END,
    p_notes
  );
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, actor_role, details)
  VALUES (
    p_session_id,
    CASE WHEN p_status = 'verified' THEN 'payment_verified' ELSE 'payment_' || p_status END,
    auth.uid(),
    v_actor_role,
    jsonb_build_object('donation_id', v_donation_id, 'notes', p_notes)
  );
  RETURN true;
END;
$$;
