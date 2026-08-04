INSERT INTO public.user_role_cache (id, role, role_level, status, updated_at)
SELECT p.id, p.role, public.compute_role_level(p.role), p.status, now()
FROM public.profiles p
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  role_level = EXCLUDED.role_level,
  status = EXCLUDED.status,
  updated_at = now();

DROP POLICY IF EXISTS "Admin full access donation_content" ON public.donation_content;
CREATE POLICY "Admin full access donation_content" ON public.donation_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access sponsorship_content" ON public.sponsorship_content;
CREATE POLICY "Admin full access sponsorship_content" ON public.sponsorship_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access volunteer_content" ON public.volunteer_content;
CREATE POLICY "Admin full access volunteer_content" ON public.volunteer_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access transparency_content" ON public.transparency_content;
CREATE POLICY "Admin full access transparency_content" ON public.transparency_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access hero_content" ON public.hero_content;
CREATE POLICY "Admin full access hero_content" ON public.hero_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access section_visibility" ON public.section_visibility;
CREATE POLICY "Admin full access section_visibility" ON public.section_visibility
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access site_images" ON public.site_images;
CREATE POLICY "Admin full access site_images" ON public.site_images
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access footer_content" ON public.footer_content;
CREATE POLICY "Admin full access footer_content" ON public.footer_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access seo_content" ON public.seo_content;
CREATE POLICY "Admin full access seo_content" ON public.seo_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access page_headers" ON public.page_headers;
CREATE POLICY "Admin full access page_headers" ON public.page_headers
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admin full access section_content" ON public.section_content;
CREATE POLICY "Admin full access section_content" ON public.section_content
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "admin_all_media" ON public.media_library;
CREATE POLICY "admin_all_media" ON public.media_library
  FOR ALL USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "Admins can view all volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can view all volunteer applications"
  ON public.volunteer_applications FOR SELECT
  TO authenticated
  USING (public.get_user_role_level() >= 90);
