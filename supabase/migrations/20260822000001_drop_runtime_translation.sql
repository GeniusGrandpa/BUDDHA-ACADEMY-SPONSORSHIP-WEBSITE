DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'translations'
  ) THEN
    DELETE FROM storage.buckets WHERE id = 'translations';
  END IF;
END $$;

DROP POLICY IF EXISTS page_translations_select_public ON public.page_translations;

DROP TRIGGER IF EXISTS page_translations_updated_at ON public.page_translations;

DROP FUNCTION IF EXISTS public.update_page_translations_updated_at();

DO $$
DECLARE
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY ARRAY['translation_queue','translation_jobs_view','page_translation_view'] LOOP
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = v_name) THEN
      EXECUTE format('DROP VIEW IF EXISTS public.%I', v_name);
    END IF;
  END LOOP;
END $$;

DROP VIEW IF EXISTS public.page_translations_view;

DROP TABLE IF EXISTS public.translation_requests;
DROP TABLE IF EXISTS public.translation_cache;
DROP TABLE IF EXISTS public.translation_jobs;
DROP TABLE IF EXISTS public.translations;
DROP TABLE IF EXISTS public.page_translations;
DROP TABLE IF EXISTS public.translation_requests_log;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT proname
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND (proname LIKE '%translation%' OR proname LIKE '%translate%')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I()', r.proname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS idx_page_translations_language;
DROP INDEX IF EXISTS idx_translations_language;
DROP INDEX IF EXISTS idx_translation_cache_language;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tgname, tgrelid::regclass AS tbl
    FROM pg_trigger
    WHERE tgisinternal = false
      AND (tgname LIKE '%translation%' OR tgname LIKE '%translate%')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', r.tgname, r.tbl);
  END LOOP;
END $$;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (policyname LIKE '%translation%' OR policyname LIKE '%translate%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;
