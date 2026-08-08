-- Restore RLS enforcement on the payment-screenshots storage bucket.
--
-- 20260818000008 set public = true on this bucket. A public bucket bypasses
-- storage.objects RLS entirely, so anyone with the object URL (or who can
-- guess the path) could read another donor's payment screenshot without
-- being authenticated. Screenshots must be private; access is granted only
-- through the owner/staff-scoped SELECT policy and short-lived signed URLs.

UPDATE storage.buckets
SET public = false
WHERE id = 'payment-screenshots';

-- Re-assert the owner/staff-scoped policies so they exist even if the bucket
-- is recreated.
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
