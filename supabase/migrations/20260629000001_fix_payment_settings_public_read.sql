DROP POLICY IF EXISTS "payment_settings_select_staff" ON payment_settings;
DROP POLICY IF EXISTS "payment_settings_select_active" ON payment_settings;
CREATE POLICY "payment_settings_select_active"
  ON payment_settings FOR SELECT
  USING (is_active = true OR public.get_user_role_level() >= 80);
DROP POLICY IF EXISTS "payment_settings_select_public" ON payment_settings;
CREATE POLICY "payment_settings_select_public"
  ON payment_settings FOR SELECT
  USING (is_active = true);
GRANT EXECUTE ON FUNCTION public.get_user_role_level TO anon, authenticated;
