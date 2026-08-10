CREATE OR REPLACE FUNCTION public.initiate_payment_checkout(
  p_amount numeric,
  p_frequency text,
  p_gateway text,
  p_idempotency_key text,
  p_message text,
  p_student_id uuid,
  p_currency text DEFAULT 'NPR'
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
  RAISE LOG '[initiate_payment_checkout] Function called: amount=%, frequency=%, gateway=%, currency=%, has_student_id=%', p_amount, p_frequency, p_gateway, p_currency, p_student_id IS NOT NULL;
  
  IF auth.uid() IS NULL THEN
    RAISE LOG '[initiate_payment_checkout] Authentication required';
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Authentication required'
    );
  END IF;
  
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE LOG '[initiate_payment_checkout] Invalid amount: %', p_amount;
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid donation amount'
    );
  END IF;
  
  IF p_gateway NOT IN ('khalti', 'esewa', 'stripe') THEN
    RAISE LOG '[initiate_payment_checkout] Invalid gateway: %', p_gateway;
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid payment gateway'
    );
  END IF;
  
  IF p_frequency NOT IN ('one-time', 'monthly', 'annual') THEN
    RAISE LOG '[initiate_payment_checkout] Invalid frequency: %', p_frequency;
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid donation frequency'
    );
  END IF;
  
  IF p_currency NOT IN ('NPR', 'USD') THEN
    RAISE LOG '[initiate_payment_checkout] Invalid currency: %', p_currency;
    RETURN json_build_object(
      'success', false,
      'payment_id', null,
      'checkout_url', null,
      'message', 'Invalid currency'
    );
  END IF;
  
  IF p_idempotency_key IS NOT NULL THEN
    RAISE LOG '[initiate_payment_checkout] Checking idempotency: key=%', p_idempotency_key;
    SELECT * INTO v_existing_session
    FROM payment_sessions
    WHERE idempotency_key = p_idempotency_key
      AND donor_id = auth.uid()
    LIMIT 1;
    IF FOUND THEN
      IF v_existing_session.status IN ('pending', 'processing') THEN
        RAISE LOG '[initiate_payment_checkout] Returning existing session: session_id=%, status=%', v_existing_session.id, v_existing_session.status;
        RETURN json_build_object(
          'success', true,
          'payment_id', v_existing_session.id,
          'checkout_url', '/donate/checkout/' || v_existing_session.id,
          'message', 'Payment session retrieved from idempotency key',
          'session_id', v_existing_session.id,
          'transaction_id', v_existing_session.transaction_id
        );
      ELSE
        RAISE LOG '[initiate_payment_checkout] Existing session finalized: session_id=%, status=%', v_existing_session.id, v_existing_session.status;
        RETURN json_build_object(
          'success', false,
          'payment_id', null,
          'checkout_url', null,
          'message', 'Payment session with this idempotency key already finalized'
        );
      END IF;
    END IF;
  END IF;
  
  RAISE LOG '[initiate_payment_checkout] Creating new payment session';
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
    idempotency_key,
    currency
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
    p_idempotency_key,
    p_currency
  )
  RETURNING id INTO v_session_id;
  
  RAISE LOG '[initiate_payment_checkout] Payment session created: session_id=%, transaction_id=%', v_session_id, v_transaction_id;
  
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (v_session_id, 'submitted', 'Payment checkout initiated');
  
  INSERT INTO payment_audit_logs (payment_session_id, action, actor_id, details)
  VALUES (
    v_session_id,
    'checkout_initiated',
    auth.uid(),
    jsonb_build_object('gateway', p_gateway, 'amount', p_amount, 'frequency', p_frequency, 'currency', p_currency)
  );
  
  RAISE LOG '[initiate_payment_checkout] Function completed successfully: session_id=%', v_session_id;
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

REVOKE EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.initiate_payment_checkout(numeric, text, text, text, text, uuid, text) TO authenticated;
