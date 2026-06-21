DROP POLICY IF EXISTS "payment_settings_select_active" ON payment_settings;
DROP POLICY IF EXISTS "payment_settings_admin_all" ON payment_settings;
CREATE POLICY "payment_settings_select_active"
  ON payment_settings FOR SELECT
  USING (is_active = true OR get_user_role_level() >= 80);
CREATE POLICY "payment_settings_insert"
  ON payment_settings FOR INSERT
  WITH CHECK (get_user_role_level() >= 90);
CREATE POLICY "payment_settings_update"
  ON payment_settings FOR UPDATE
  USING (get_user_role_level() >= 80);
CREATE POLICY "payment_settings_delete"
  ON payment_settings FOR DELETE
  USING (get_user_role_level() >= 90);
DROP POLICY IF EXISTS "payment_audit_logs_select" ON payment_audit_logs;
DROP POLICY IF EXISTS "payment_audit_logs_insert" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_select"
  ON payment_audit_logs FOR SELECT
  USING (get_user_role_level() >= 80);
CREATE POLICY "payment_audit_logs_insert"
  ON payment_audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-qr-codes',
  'payment-qr-codes',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "payment_qr_codes_select" ON storage.objects;
CREATE POLICY "payment_qr_codes_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-qr-codes' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "payment_qr_codes_insert" ON storage.objects;
CREATE POLICY "payment_qr_codes_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-qr-codes'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );
DROP POLICY IF EXISTS "payment_qr_codes_update" ON storage.objects;
CREATE POLICY "payment_qr_codes_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'payment-qr-codes'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );
DROP POLICY IF EXISTS "payment_qr_codes_delete" ON storage.objects;
CREATE POLICY "payment_qr_codes_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payment-qr-codes'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );