DROP INDEX IF EXISTS public.idx_page_translations_language;

DROP FUNCTION IF EXISTS public.update_page_translations_updated_at();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'page_translations'
  ) THEN
    DROP TRIGGER IF EXISTS page_translations_updated_at ON public.page_translations;
    DROP POLICY IF EXISTS page_translations_select_public ON public.page_translations;
    DROP TABLE public.page_translations;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'page_translations'
  ) THEN
    RAISE EXCEPTION 'old page_translations table still exists';
  END IF;
END $$;