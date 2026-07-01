
GRANT SELECT ON public.profiles TO anon;

DO $$
DECLARE
  tbl TEXT;
  pol TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['hero_content', 'footer_content', 'section_content'])
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE tablename = tbl
        AND qual LIKE '%profiles%'
        AND qual NOT LIKE '%auth.role()%'
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I',
        pol, tbl
      );
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (
          auth.role() = ''authenticated'' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = ANY (ARRAY[''admin''::text, ''super_admin''::text])
              AND profiles.status = ''active''
          )
        )',
        pol, tbl
      );
    END LOOP;
  END LOOP;
END $$;
