-- Invoice / receipt IDOR security test
-- =====================================
-- Verifies that payment, receipt, verification and allocation data
-- is strictly isolated between users (User A cannot read User B's data).
--
-- Run against a STAGING Supabase database:
--   supabase db reset --linked   (NOT recommended - wipes data)
--   OR run in the Supabase SQL editor as the postgres role.
--
-- The test creates two throwaway users (A and B), seeds rows owned by each,
-- then simulates each user's session via request.jwt.claims and asserts that
-- RLS / SECURITY DEFINER guards block cross-user access. All seeded rows are
-- removed at the end. Raises an exception (fails loudly) on any leak.
--
-- Requires: postgres superuser (the SQL editor runs as postgres by default).

DO $$
DECLARE
  v_user_a uuid := '11111111-1111-4111-8111-111111111111';
  v_user_b uuid := '22222222-2222-4222-8222-222222222222';
  v_student_a uuid;
  v_donation_a uuid;
  v_donation_b uuid;
  v_session_a uuid;
  v_session_b uuid;
  v_receipt_a uuid;
  v_receipt_b uuid;
  v_count integer;
  v_blocked boolean;
BEGIN
  -- ---------------------------------------------------------------------
  -- 1. Seed two donor users + a student
  -- ---------------------------------------------------------------------
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_user_a, 'authenticated', 'authenticated', 'sec-test-a@example.com', '',
      now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', v_user_b, 'authenticated', 'authenticated', 'sec-test-b@example.com', '',
      now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES
    (v_user_a, 'sec-test-a@example.com', 'Security Test A', '', 'donor', 'active'),
    (v_user_b, 'sec-test-b@example.com', 'Security Test B', '', 'donor', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.students (name, age, grade, bio, sponsorship_status, sponsorship_amount)
  VALUES ('Security Test Student', 10, '4', '', 'available', 50)
  RETURNING id INTO v_student_a;

  INSERT INTO public.donations (donor_id, student_id, amount, frequency, status)
  VALUES (v_user_a, v_student_a, 1000, 'one-time', 'received')
  RETURNING id INTO v_donation_a;
  INSERT INTO public.donations (donor_id, student_id, amount, frequency, status)
  VALUES (v_user_b, v_student_a, 2000, 'one-time', 'received')
  RETURNING id INTO v_donation_b;

  INSERT INTO public.payment_sessions (donation_id, gateway, amount, transaction_id, status)
  VALUES (v_donation_a, 'esewa', 1000, 'SEC-TX-A', 'completed')
  RETURNING id INTO v_session_a;
  INSERT INTO public.payment_sessions (donation_id, gateway, amount, transaction_id, status)
  VALUES (v_donation_b, 'esewa', 2000, 'SEC-TX-B', 'completed')
  RETURNING id INTO v_session_b;

  INSERT INTO public.payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
  VALUES (v_session_a, v_donation_a, 'SEC-RCP-A', '{"donor":"A"}')
  RETURNING id INTO v_receipt_a;
  INSERT INTO public.payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
  VALUES (v_session_b, v_donation_b, 'SEC-RCP-B', '{"donor":"B"}')
  RETURNING id INTO v_receipt_b;

  INSERT INTO public.payment_verifications (payment_session_id, action, notes)
  VALUES (v_session_a, 'verified', 'sec test'), (v_session_b, 'verified', 'sec test');

  INSERT INTO public.donation_allocations (donation_id, category, allocation_percentage, amount)
  VALUES (v_donation_a, 'Student Meals', 100, 1000), (v_donation_b, 'Student Meals', 100, 2000);

  -- ---------------------------------------------------------------------
  -- 2. Simulate User A's session
  -- ---------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_user_a::text, 'role', 'authenticated')::text, true);

  -- A can read A's own donation
  SELECT count(*) INTO v_count FROM public.donations WHERE id = v_donation_a;
  IF v_count != 1 THEN RAISE EXCEPTION 'FAIL: user A cannot read own donation'; END IF;

  -- A must NOT read B's donation by id
  SELECT count(*) INTO v_count FROM public.donations WHERE id = v_donation_b;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user A read user B donation'; END IF;

  -- A must NOT read B's payment session
  SELECT count(*) INTO v_count FROM public.payment_sessions WHERE id = v_session_b;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user A read user B payment session'; END IF;

  -- A must NOT read B's receipt
  SELECT count(*) INTO v_count FROM public.payment_receipts WHERE id = v_receipt_b;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user A read user B receipt'; END IF;

  -- A must NOT read B's verifications
  SELECT count(*) INTO v_count FROM public.payment_verifications WHERE payment_session_id = v_session_b;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user A read user B verifications'; END IF;

  -- A must NOT read B's allocations
  SELECT count(*) INTO v_count FROM public.donation_allocations WHERE donation_id = v_donation_b;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user A read user B allocations'; END IF;

  -- SECURITY DEFINER RPC: get_donor_allocations for another user must be blocked
  v_blocked := false;
  BEGIN
    PERFORM public.get_donor_allocations(v_user_b);
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'FAIL: get_donor_allocations allowed cross-user read'; END IF;

  -- SECURITY DEFINER RPC: cancel_payment_session for another user's session must be blocked
  v_blocked := false;
  BEGIN
    PERFORM public.cancel_payment_session(v_session_b);
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'FAIL: cancel_payment_session allowed cross-user cancel'; END IF;

  -- ---------------------------------------------------------------------
  -- 3. Simulate User B's session (B still sees own, not A's)
  -- ---------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_user_b::text, 'role', 'authenticated')::text, true);

  SELECT count(*) INTO v_count FROM public.donations WHERE id = v_donation_b;
  IF v_count != 1 THEN RAISE EXCEPTION 'FAIL: user B cannot read own donation'; END IF;
  SELECT count(*) INTO v_count FROM public.donations WHERE id = v_donation_a;
  IF v_count != 0 THEN RAISE EXCEPTION 'FAIL: IDOR - user B read user A donation'; END IF;

  -- ---------------------------------------------------------------------
  -- 4. Cleanup seeded rows
  -- ---------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', '{}'::text, true);
  DELETE FROM public.donation_allocations WHERE donation_id IN (v_donation_a, v_donation_b);
  DELETE FROM public.payment_verifications WHERE payment_session_id IN (v_session_a, v_session_b);
  DELETE FROM public.payment_receipts WHERE id IN (v_receipt_a, v_receipt_b);
  DELETE FROM public.payment_sessions WHERE id IN (v_session_a, v_session_b);
  DELETE FROM public.donations WHERE id IN (v_donation_a, v_donation_b);
  DELETE FROM public.students WHERE id = v_student_a;
  DELETE FROM public.profiles WHERE id IN (v_user_a, v_user_b);
  DELETE FROM auth.users WHERE id IN (v_user_a, v_user_b);

  RAISE NOTICE 'PASS: invoice/receipt/payment IDOR isolation verified';
END $$;
