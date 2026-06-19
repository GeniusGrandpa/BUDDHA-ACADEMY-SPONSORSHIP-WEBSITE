ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'processing', 'verified', 'completed', 'failed', 'rejected', 'cancelled'));

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_session_id UUID;

CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL,
  gateway_display_name TEXT NOT NULL DEFAULT '',
  gateway_description TEXT,
  qr_image_url TEXT,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_id TEXT UNIQUE,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'verified', 'completed', 'failed', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES profiles(id),
  action TEXT NOT NULL
    CHECK (action IN ('submitted', 'processing', 'verified', 'rejected', 'failed', 'expired', 'cancelled')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  receipt_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID REFERENCES payment_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_settings_select_active" ON payment_settings;
CREATE POLICY "payment_settings_select_active"
  ON payment_settings FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

DROP POLICY IF EXISTS "payment_settings_admin_all" ON payment_settings;
CREATE POLICY "payment_settings_admin_all"
  ON payment_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

DROP POLICY IF EXISTS "payment_sessions_donor_select" ON payment_sessions;
CREATE POLICY "payment_sessions_donor_select"
  ON payment_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = payment_sessions.donation_id AND d.donor_id = auth.uid()
  ));

DROP POLICY IF EXISTS "payment_sessions_finance_select" ON payment_sessions;
CREATE POLICY "payment_sessions_finance_select"
  ON payment_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_sessions_donor_insert" ON payment_sessions;
CREATE POLICY "payment_sessions_donor_insert"
  ON payment_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = donation_id AND d.donor_id = auth.uid()
  ));

DROP POLICY IF EXISTS "payment_sessions_finance_update" ON payment_sessions;
CREATE POLICY "payment_sessions_finance_update"
  ON payment_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_verifications_finance_all" ON payment_verifications;
CREATE POLICY "payment_verifications_finance_all"
  ON payment_verifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_verifications_donor_select" ON payment_verifications;
CREATE POLICY "payment_verifications_donor_select"
  ON payment_verifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM payment_sessions ps
    JOIN donations d ON d.id = ps.donation_id
    WHERE ps.id = payment_verifications.payment_session_id AND d.donor_id = auth.uid()
  ));

DROP POLICY IF EXISTS "payment_receipts_donor_select" ON payment_receipts;
CREATE POLICY "payment_receipts_donor_select"
  ON payment_receipts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = payment_receipts.donation_id AND d.donor_id = auth.uid()
  ));

DROP POLICY IF EXISTS "payment_receipts_finance_select" ON payment_receipts;
CREATE POLICY "payment_receipts_finance_select"
  ON payment_receipts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_receipts_finance_insert" ON payment_receipts;
CREATE POLICY "payment_receipts_finance_insert"
  ON payment_receipts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_audit_logs_select" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_select"
  ON payment_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));

DROP POLICY IF EXISTS "payment_audit_logs_insert" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_insert"
  ON payment_audit_logs FOR INSERT
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "payment_screenshots_insert" ON storage.objects;
CREATE POLICY "payment_screenshots_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "payment_screenshots_select_own" ON storage.objects;
CREATE POLICY "payment_screenshots_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-screenshots'
    AND auth.role() = 'authenticated'
    AND ((storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
      ))
  );

CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 8));
    new_id := 'BA-' || year_part || '-' || random_part;

    IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE transaction_id = new_id) THEN
      RETURN new_id;
    END IF;

    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique transaction ID';
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 6));
    new_id := 'RCT-' || year_part || '-' || random_part;

    IF NOT EXISTS (SELECT 1 FROM payment_receipts WHERE receipt_number = new_id) THEN
      RETURN new_id;
    END IF;

    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique receipt number';
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION create_payment_session(
  p_donation_id UUID,
  p_gateway TEXT,
  p_amount NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_transaction_id TEXT;
  v_donor_id UUID;
BEGIN

  SELECT donor_id INTO v_donor_id FROM donations WHERE id = p_donation_id;
  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: donation does not belong to you';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM donations WHERE id = p_donation_id AND status IN ('pledged', 'pending')) THEN
    RAISE EXCEPTION 'Donation is not in a payable state';
  END IF;

  v_transaction_id := generate_transaction_id();

  INSERT INTO payment_sessions (donation_id, gateway, amount, transaction_id, status)
  VALUES (p_donation_id, p_gateway, p_amount, v_transaction_id, 'pending')
  RETURNING id INTO v_session_id;

  UPDATE donations
  SET status = 'pending',
      payment_session_id = v_session_id,
      payment_method = p_gateway,
      updated_at = now()
  WHERE id = p_donation_id;

  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (v_session_id, 'submitted', 'Payment session created');

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION submit_payment_confirmation(
  p_session_id UUID,
  p_screenshots TEXT[] DEFAULT '{}'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donor_id UUID;
BEGIN

  SELECT d.donor_id INTO v_donor_id
  FROM payment_sessions ps
  JOIN donations d ON d.id = ps.donation_id
  WHERE ps.id = p_session_id;

  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this payment session';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE id = p_session_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Payment session is not in pending state';
  END IF;

  UPDATE payment_sessions
  SET status = 'processing',
      screenshots = array_cat(screenshots, p_screenshots),
      updated_at = now()
  WHERE id = p_session_id;

  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (p_session_id, 'submitted', 'Donor submitted payment confirmation');

  UPDATE donations SET status = 'processing', updated_at = now()
  WHERE id = (SELECT donation_id FROM payment_sessions WHERE id = p_session_id);

  RETURN true;
END;
$$;

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

INSERT INTO payment_settings (gateway_name, gateway_display_name, gateway_description, account_name, account_number, instructions, is_active, sort_order)
VALUES
  ('khalti', 'Khalti', 'Pay via Khalti digital wallet', 'Buddha Academy', '9800000000', 'Send payment to this Khalti ID. Include your name in the transaction note so we can verify your donation.', true, 1),
  ('esewa', 'eSewa', 'Pay via eSewa online wallet', 'Buddha Academy', '9800000000', 'Send payment to this eSewa ID. Include your name in the transaction note so we can verify your donation.', true, 2),
  ('mobile_banking', 'Mobile Banking / Fonepay', 'Bank transfer or Fonepay', 'Buddha Academy', '1234567890123456', 'Transfer to our bank account. Use "Donation" as reference and include your name.', true, 3)
ON CONFLICT DO NOTHING;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_sessions') THEN ALTER PUBLICATION supabase_realtime ADD TABLE payment_sessions; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_verifications') THEN ALTER PUBLICATION supabase_realtime ADD TABLE payment_verifications; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_settings') THEN ALTER PUBLICATION supabase_realtime ADD TABLE payment_settings; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_receipts') THEN ALTER PUBLICATION supabase_realtime ADD TABLE payment_receipts; END IF; END $$;