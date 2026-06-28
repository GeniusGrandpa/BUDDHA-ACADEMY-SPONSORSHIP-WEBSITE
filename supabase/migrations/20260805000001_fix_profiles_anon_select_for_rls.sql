-- The admin RLS policies on CMS tables reference `profiles` in subqueries:
--   EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() ...)
-- PostgreSQL checks table-access permissions before evaluating WHERE conditions.
-- Even though auth.uid() is NULL for anon (making the subquery return no rows),
-- PostgreSQL still requires SELECT privilege on `profiles` to execute the subquery.
--
-- The profiles table has strict RLS policies that prevent anon from seeing any
-- actual row data. Granting SELECT allows the subquery to be parsed; RLS then
-- filters everything out for anon.
--
-- As a belt-and-suspenders measure, also wrap the admin policies that lack an
-- auth.role() guard so they short-circuit earlier.

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
