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
  IF p_gateway NOT IN ('khalti', 'esewa', 'mobile_banking') THEN
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