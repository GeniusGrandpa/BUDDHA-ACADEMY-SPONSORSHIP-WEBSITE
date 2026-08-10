INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/ogg','video/quicktime']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/ogg','video/quicktime']::text[];
DROP POLICY IF EXISTS "gallery_select_public" ON storage.objects;
CREATE POLICY "gallery_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');
DROP POLICY IF EXISTS "gallery_insert_authenticated" ON storage.objects;
CREATE POLICY "gallery_insert_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "gallery_delete_authenticated" ON storage.objects;
CREATE POLICY "gallery_delete_authenticated"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');