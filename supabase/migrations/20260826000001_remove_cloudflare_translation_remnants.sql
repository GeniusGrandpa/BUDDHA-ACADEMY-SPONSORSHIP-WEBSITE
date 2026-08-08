-- Defensive cleanup of the OLD Cloudflare translation system.
--
-- The old runtime translation integration was a Supabase Edge Function
-- (functions/translate) that called Cloudflare Workers AI
-- (@cf/meta/m2m100-1.2b) and cached results in the `public.page_translations`
-- table. That integration has been fully replaced by static locale bundles
-- (src/locales) plus the generic `public.content_translations` table.
--
-- The `page_translations` table and every object created for it were already
-- dropped by migration 20260822000001_drop_runtime_translation.sql (applied
-- locally and on the linked remote project). This migration is a defensive,
-- idempotent safety net: it removes the Cloudflare-specific objects IF they
-- still exist on any environment, and then verifies the new localization
-- system is intact.
--
-- It does NOT touch, modify, or drop:
--   * public.content_translations (new localization system)
--   * CMS content tables (hero_content, section_content, footer_content, ...)
--   * profiles, auth, payments, donations, invoices, or any other table
--   * any policy, trigger, index, or function used by the new localization
--     system or any other feature
-- No CASCADE is used and no user/content data is deleted.

-- ---------------------------------------------------------------
-- 1. Remove Cloudflare-translation remnants (all IF EXISTS, no CASCADE)
-- ---------------------------------------------------------------
DO $$
BEGIN
  -- Only attempt table-level cleanup if the table actually exists so that a
  -- trigger/policy drop never fails on a missing relation.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'page_translations'
  ) THEN
    DROP TRIGGER IF EXISTS page_translations_updated_at ON public.page_translations;
    DROP POLICY IF EXISTS page_translations_select_public ON public.page_translations;
    ALTER TABLE public.page_translations
      DROP CONSTRAINT IF EXISTS page_translations_page_language_key;
  END IF;
END $$;

-- Index and trigger function are standalone objects; safe to drop unconditionally.
DROP INDEX IF EXISTS public.idx_page_translations_language;
DROP FUNCTION IF EXISTS public.update_page_translations_updated_at();

-- Drop the table last. Plain DROP (no CASCADE) so any accidental dependency
-- would fail loudly instead of silently removing an unrelated object.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'page_translations'
  ) THEN
    DROP TABLE public.page_translations;
  END IF;
END $$;

-- ---------------------------------------------------------------
-- 2. Verification: the new localization system must remain intact
-- ---------------------------------------------------------------
DO $$
DECLARE
  missing text[] := '{}'::text[];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'content_translations'
  ) THEN
    missing := array_append(missing, 'table content_translations');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_content_translations_updated_at'
  ) THEN
    missing := array_append(missing, 'function update_content_translations_updated_at()');
  END IF;

  IF cardinality(missing) > 0 THEN
    RAISE EXCEPTION 'new localization system is missing: %', array_to_string(missing, ', ');
  END IF;

  RAISE NOTICE 'cloudflare translation remnants removed; new localization system verified intact';
END $$;
