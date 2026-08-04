INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']::text[];
DROP POLICY IF EXISTS "videos_select_public" ON storage.objects;
CREATE POLICY "videos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');
DROP POLICY IF EXISTS "videos_insert_authenticated" ON storage.objects;
CREATE POLICY "videos_insert_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "videos_delete_authenticated" ON storage.objects;
CREATE POLICY "videos_delete_authenticated"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
