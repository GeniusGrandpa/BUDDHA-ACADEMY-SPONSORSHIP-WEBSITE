DO $$ DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT policyname, tablename, schemaname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('pages', 'homepage_sections', 'videos', 'faqs', 'student_stories', 'media_library')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;
CREATE POLICY "pages_select_public"
  ON pages FOR SELECT
  USING (published = true);
CREATE POLICY "pages_select_staff"
  ON pages FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "pages_insert_admin"
  ON pages FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "pages_update_admin"
  ON pages FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "pages_delete_admin"
  ON pages FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "homepage_sections_select_public"
  ON homepage_sections FOR SELECT
  USING (is_active = true);
CREATE POLICY "homepage_sections_select_staff"
  ON homepage_sections FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "homepage_sections_insert_admin"
  ON homepage_sections FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "homepage_sections_update_admin"
  ON homepage_sections FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "homepage_sections_delete_admin"
  ON homepage_sections FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "videos_select_public"
  ON videos FOR SELECT
  USING (true);
CREATE POLICY "videos_insert_admin"
  ON videos FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "videos_update_admin"
  ON videos FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "videos_delete_admin"
  ON videos FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "faqs_select_public"
  ON faqs FOR SELECT
  USING (is_published = true);
CREATE POLICY "faqs_select_staff"
  ON faqs FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "faqs_insert_admin"
  ON faqs FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "faqs_update_admin"
  ON faqs FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "faqs_delete_admin"
  ON faqs FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "student_stories_select_public"
  ON student_stories FOR SELECT
  USING (is_published = true);
CREATE POLICY "student_stories_select_staff"
  ON student_stories FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "student_stories_insert_admin"
  ON student_stories FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "student_stories_update_admin"
  ON student_stories FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "student_stories_delete_admin"
  ON student_stories FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "media_library_select_published"
  ON media_library FOR SELECT
  USING (is_published = true);
CREATE POLICY "media_library_select_staff"
  ON media_library FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "media_library_insert_finance"
  ON media_library FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);
CREATE POLICY "media_library_update_admin"
  ON media_library FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "media_library_delete_admin"
  ON media_library FOR DELETE
  USING (public.get_user_role_level() >= 90);