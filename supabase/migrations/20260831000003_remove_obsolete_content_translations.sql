DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'content_translations'
  ) THEN
    DROP TRIGGER IF EXISTS content_translations_updated_at ON public.content_translations;
  END IF;
END $$;


DROP FUNCTION IF EXISTS public.update_content_translations_updated_at();


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'content_translations'
  ) THEN
    DROP POLICY IF EXISTS content_translations_select_public ON public.content_translations;
    DROP POLICY IF EXISTS content_translations_insert_admin ON public.content_translations;
    DROP POLICY IF EXISTS content_translations_update_admin ON public.content_translations;
    DROP POLICY IF EXISTS content_translations_delete_admin ON public.content_translations;
  END IF;
END $$;


DROP INDEX IF EXISTS public.idx_content_translations_entity;
DROP INDEX IF EXISTS public.idx_content_translations_language;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'content_translations'
  ) THEN
    DROP TABLE public.content_translations;
  END IF;
END $$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'content_translations'
  ) THEN
    RAISE EXCEPTION 'content_translations table still exists after removal';
  END IF;
  
  RAISE NOTICE 'Obsolete content_translations system successfully removed';
END $$;
