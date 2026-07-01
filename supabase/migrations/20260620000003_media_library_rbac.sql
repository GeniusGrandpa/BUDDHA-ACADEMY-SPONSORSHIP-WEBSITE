DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'media_library' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.media_library ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.current_user_has_role(role_name text)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = role_name AND status = 'active'); $$;
DROP POLICY IF EXISTS "Anyone can read media" ON public.media_library;
DROP POLICY IF EXISTS "Admins can upload media" ON public.media_library;
DROP POLICY IF EXISTS "Admins can delete media" ON public.media_library;
DROP POLICY IF EXISTS "media_library_select_published" ON media_library;
CREATE POLICY "media_library_select_published" ON public.media_library FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "media_library_select_admin" ON media_library;
CREATE POLICY "media_library_select_admin" ON public.media_library FOR SELECT USING (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "media_library_select_finance" ON media_library;
CREATE POLICY "media_library_select_finance" ON public.media_library FOR SELECT USING (public.current_user_has_role('finance_manager'));
DROP POLICY IF EXISTS "media_library_select_teacher" ON media_library;
CREATE POLICY "media_library_select_teacher" ON public.media_library FOR SELECT USING (public.current_user_has_role('teacher'));
DROP POLICY IF EXISTS "media_library_insert_admin" ON media_library;
CREATE POLICY "media_library_insert_admin" ON public.media_library FOR INSERT WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "media_library_insert_finance" ON media_library;
CREATE POLICY "media_library_insert_finance" ON public.media_library FOR INSERT WITH CHECK (public.current_user_has_role('finance_manager'));
DROP POLICY IF EXISTS "media_library_insert_teacher" ON media_library;
CREATE POLICY "media_library_insert_teacher" ON public.media_library FOR INSERT WITH CHECK (public.current_user_has_role('teacher'));
DROP POLICY IF EXISTS "media_library_update_admin" ON media_library;
CREATE POLICY "media_library_update_admin" ON public.media_library FOR UPDATE USING (public.is_admin_or_super_admin()) WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "media_library_delete_admin" ON media_library;
CREATE POLICY "media_library_delete_admin" ON public.media_library FOR DELETE USING (public.is_admin_or_super_admin());
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/bmp','video/mp4','video/webm','video/ogg','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','application/zip','application/x-rar-compressed']::text[])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/bmp','video/mp4','video/webm','video/ogg','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','application/zip','application/x-rar-compressed']::text[];
DROP POLICY IF EXISTS "media_select_public" ON storage.objects;
CREATE POLICY "media_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'media');
DROP POLICY IF EXISTS "media_insert_authenticated" ON storage.objects;
CREATE POLICY "media_insert_authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "media_delete_authenticated" ON storage.objects;
CREATE POLICY "media_delete_authenticated" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
