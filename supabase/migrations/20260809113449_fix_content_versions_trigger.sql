DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin" ON public.site_settings
  FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

GRANT INSERT ON public.site_settings TO authenticated;
