-- Generic per-locale content translation table.
--
-- English is the source of truth: every CMS row stays as-authored in English.
-- Localized prose lives here as overrides keyed by (entity_type, entity_id, language, field).
-- The client fetches the English row, then applies the overrides for the active language.
-- Missing overrides fall back to English automatically, so a locale is never partially broken.
--
-- entity_type  -> which table the content belongs to, e.g. 'hero_content', 'section_content',
--                 'footer_content', 'navigation_items', 'page_headers', 'cms_strings',
--                 'donation_content', 'sponsorship_content', 'volunteer_content', 'transparency_content'.
-- entity_id    -> the row's primary key (uuid). For keyed rows use the natural key:
--                 section_content = section_key, page_headers = page_slug,
--                 navigation_items = item id, cms_strings = string key, site_settings = 'main'.
-- field        -> the text column being overridden (e.g. 'title', 'description'),
--                 or a dot-path into JSONB for nested prose (e.g. 'quick_links.0.label',
--                 'content.steps.0.title').
-- value        -> the translated prose.

CREATE TABLE IF NOT EXISTS public.content_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  language TEXT NOT NULL,
  field TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_translations
  DROP CONSTRAINT IF EXISTS content_translations_entity_lang_field_key;
ALTER TABLE public.content_translations
  ADD CONSTRAINT content_translations_entity_lang_field_key UNIQUE (entity_type, entity_id, language, field);

CREATE INDEX IF NOT EXISTS idx_content_translations_entity
  ON public.content_translations (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_language
  ON public.content_translations (language);

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_translations_select_public ON public.content_translations;
CREATE POLICY "content_translations_select_public"
  ON public.content_translations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS content_translations_insert_admin ON public.content_translations;
CREATE POLICY "content_translations_insert_admin"
  ON public.content_translations FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS content_translations_update_admin ON public.content_translations;
CREATE POLICY "content_translations_update_admin"
  ON public.content_translations FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS content_translations_delete_admin ON public.content_translations;
CREATE POLICY "content_translations_delete_admin"
  ON public.content_translations FOR DELETE
  USING (public.get_user_role_level() >= 90);

GRANT SELECT ON public.content_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_translations TO authenticated;

CREATE OR REPLACE FUNCTION public.update_content_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_translations_updated_at ON public.content_translations;
CREATE TRIGGER content_translations_updated_at
  BEFORE UPDATE ON public.content_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_content_translations_updated_at();
