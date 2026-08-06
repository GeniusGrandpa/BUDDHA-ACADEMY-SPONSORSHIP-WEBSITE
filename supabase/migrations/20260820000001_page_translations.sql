CREATE TABLE IF NOT EXISTS public.page_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  language TEXT NOT NULL,
  translated_title TEXT,
  translated_description TEXT,
  translated_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  translated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'page_translations_page_language_key'
  ) THEN
    ALTER TABLE public.page_translations
      ADD CONSTRAINT page_translations_page_language_key UNIQUE (page_id, language);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_page_translations_language
  ON public.page_translations (language);

ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_translations_select_public"
  ON public.page_translations FOR SELECT
  USING (true);

GRANT SELECT ON public.page_translations TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_page_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS page_translations_updated_at ON public.page_translations;
CREATE TRIGGER page_translations_updated_at
  BEFORE UPDATE ON public.page_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_page_translations_updated_at();