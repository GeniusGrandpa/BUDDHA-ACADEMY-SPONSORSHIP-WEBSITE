CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_slug TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  content JSONB,
  published BOOLEAN,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  restored_at TIMESTAMPTZ,
  restore_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_content_versions_entity ON public.content_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_slug ON public.content_versions(entity_slug);
CREATE INDEX IF NOT EXISTS idx_content_versions_created ON public.content_versions(created_at DESC);
ALTER TABLE IF EXISTS public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view versions"
  ON public.content_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  ));
CREATE POLICY "Admins can manage versions"
  ON public.content_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  ));
CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  current_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO current_version
  FROM public.content_versions
  WHERE entity_type = TG_TABLE_NAME
  AND entity_id = COALESCE(NEW.id, OLD.id);
  INSERT INTO public.content_versions (
    entity_type,
    entity_id,
    entity_slug,
    version_number,
    title,
    content,
    published,
    created_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(
      (CASE 
        WHEN TG_TABLE_NAME = 'pages' THEN (NEW.content->>'slug')
        WHEN TG_TABLE_NAME = 'news' THEN (NEW.content->>'slug')
        ELSE NULL
      END),
      (SELECT slug FROM public.pages WHERE id = COALESCE(NEW.id, OLD.id))
    ),
    current_version,
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title)
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title)
      ELSE ''
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    COALESCE(NEW.published, OLD.published, false),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['pages', 'news'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'version_' || tbl || '_changes') THEN
        EXECUTE format('CREATE TRIGGER version_%I_changes AFTER UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.create_content_version()', tbl, tbl);
      END IF;
    END IF;
  END LOOP;
END $$;
