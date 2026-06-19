ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

CREATE TABLE IF NOT EXISTS donation_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'Educational Materials',
    'Student Meals',
    'School Supplies',
    'Uniform Support',
    'Events & Activities',
    'Operations'
  )),
  allocation_percentage NUMERIC(5,2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donation_allocations_donation_id ON donation_allocations(donation_id);

ALTER TABLE donation_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donation_allocations_donor_select" ON donation_allocations;
CREATE POLICY "donation_allocations_donor_select"
  ON donation_allocations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = donation_allocations.donation_id AND d.donor_id = auth.uid()
  ));

DROP POLICY IF EXISTS "donation_allocations_finance_all" ON donation_allocations;
CREATE POLICY "donation_allocations_finance_all"
  ON donation_allocations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "donations_donor_select_verified_by" ON donations;
CREATE POLICY "donations_donor_select_verified_by"
  ON donations FOR SELECT
  USING (donor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

CREATE OR REPLACE FUNCTION verify_payment(
  p_session_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation_id UUID;
  v_receipt_number TEXT;
  v_actor_role TEXT;
  v_amount NUMERIC;
  v_gateway TEXT;
  v_transaction_id TEXT;
BEGIN

  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can verify payments';
  END IF;

  IF p_status NOT IN ('verified', 'rejected', 'failed') THEN
    RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or failed';
  END IF;

  SELECT donation_id, amount, gateway, transaction_id
  INTO v_donation_id, v_amount, v_gateway, v_transaction_id
  FROM payment_sessions WHERE id = p_session_id;

  IF v_donation_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;

  UPDATE payment_sessions
  SET status = CASE WHEN p_status = 'verified' THEN 'completed' ELSE p_status END,
      verified_by = auth.uid(),
      verified_at = now(),
      verification_notes = p_notes,
      updated_at = now()
  WHERE id = p_session_id;

  IF p_status = 'verified' THEN
    v_receipt_number := generate_receipt_number();

    UPDATE donations
    SET status = 'completed',
        transaction_id = v_transaction_id,
        verified_at = now(),
        verified_by = auth.uid(),
        updated_at = now()
    WHERE id = v_donation_id;

    INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
    VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
      'generated_at', now(),
      'amount', v_amount,
      'gateway', v_gateway,
      'transaction_id', v_transaction_id,
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
  END IF;

  IF p_status = 'rejected' THEN
    UPDATE donations SET status = 'rejected', updated_at = now() WHERE id = v_donation_id;
  END IF;

  IF p_status = 'failed' THEN
    UPDATE donations SET status = 'failed', updated_at = now() WHERE id = v_donation_id;
  END IF;

  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, auth.uid(), p_status, p_notes);

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION assign_donation_allocations(
  p_donation_id UUID,
  p_allocations JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_role TEXT;
  v_allocation RECORD;
  v_total_percentage NUMERIC;
  v_donation_amount NUMERIC;
BEGIN

  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can assign allocations';
  END IF;

  SELECT amount INTO v_donation_amount FROM donations WHERE id = p_donation_id;
  IF v_donation_amount IS NULL THEN
    RAISE EXCEPTION 'Donation not found';
  END IF;

  SELECT SUM((value->>'percentage')::NUMERIC) INTO v_total_percentage
  FROM jsonb_array_elements(p_allocations) AS value;

  IF v_total_percentage != 100 THEN
    RAISE EXCEPTION 'Allocation percentages must total 100%%';
  END IF;

  DELETE FROM donation_allocations WHERE donation_id = p_donation_id;

  FOR v_allocation IN
    SELECT
      (value->>'category')::TEXT AS category,
      (value->>'percentage')::NUMERIC AS percentage
    FROM jsonb_array_elements(p_allocations) AS value
  LOOP
    INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
    VALUES (
      p_donation_id,
      v_allocation.category,
      v_allocation.percentage,
      v_donation_amount * (v_allocation.percentage / 100)
    );
  END LOOP;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION get_donor_allocations(p_donor_id UUID)
RETURNS TABLE (
  donation_id UUID,
  category TEXT,
  allocation_percentage NUMERIC,
  amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  IF p_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you can only view your own allocations';
  END IF;

  RETURN QUERY
  SELECT da.donation_id, da.category, da.allocation_percentage, da.amount, da.created_at
  FROM donation_allocations da
  JOIN donations d ON d.id = da.donation_id
  WHERE d.donor_id = p_donor_id
  ORDER BY da.created_at DESC;
END;
$$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'donation_allocations') THEN ALTER PUBLICATION supabase_realtime ADD TABLE donation_allocations; END IF; END $$;