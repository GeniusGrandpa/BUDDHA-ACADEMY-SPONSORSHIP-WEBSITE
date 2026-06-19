GRANT SELECT ON payment_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON payment_settings TO authenticated;

DO $$ DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'payment_settings' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON payment_settings', rec.policyname);
  END LOOP;
END $$;

CREATE POLICY "payment_settings_select_all"
  ON payment_settings FOR SELECT
  USING (true);

CREATE POLICY "payment_settings_insert_staff"
  ON payment_settings FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);

CREATE POLICY "payment_settings_update_staff"
  ON payment_settings FOR UPDATE
  USING (public.get_user_role_level() >= 80);

CREATE POLICY "payment_settings_delete_admin"
  ON payment_settings FOR DELETE
  USING (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "payment_qr_codes_insert" ON storage.objects;
CREATE POLICY "payment_qr_codes_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-qr-codes'
    AND auth.role() = 'authenticated'
    AND public.get_user_role_level() >= 80
  );

DROP POLICY IF EXISTS "payment_qr_codes_update" ON storage.objects;
CREATE POLICY "payment_qr_codes_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'payment-qr-codes'
    AND public.get_user_role_level() >= 80
  );

DROP POLICY IF EXISTS "payment_qr_codes_delete" ON storage.objects;
CREATE POLICY "payment_qr_codes_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payment-qr-codes'
    AND public.get_user_role_level() >= 90
  );