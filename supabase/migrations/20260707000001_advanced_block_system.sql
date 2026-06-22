-- Advanced Block System: page_blocks table, versioning enhancements, audit triggers
-- Migration 20260707000001

-- 1. Create page_blocks table for normalized block storage
CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  title TEXT DEFAULT '',
  content JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON public.page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_sort ON public.page_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_page_blocks_visible ON public.page_blocks(page_id, is_visible);

-- 2. Add version tracking columns to pages (if not exist)
ALTER TABLE IF EXISTS public.pages
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Update pages updated_by if it doesn't have proper references (it already exists in initial schema)

-- 4. Enhanced create_content_version function that captures blocks & seo
CREATE OR REPLACE FUNCTION public.create_content_version_v2()
RETURNS TRIGGER AS $$
DECLARE
  current_version INTEGER;
  version_id UUID;
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
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN NEW.slug
      ELSE NULL
    END,
    current_version,
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title, '')
      ELSE ''
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    COALESCE(NEW.published, OLD.published, false),
    auth.uid()
  ) RETURNING id INTO version_id;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes)
  VALUES (
    auth.uid(),
    TG_OP || ' page: ' || COALESCE(NEW.slug, OLD.slug, '') || ' (version ' || current_version || ')',
    'pages',
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted', to_jsonb(OLD))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE jsonb_build_object('created', to_jsonb(NEW))
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Audit trigger for page_blocks
CREATE OR REPLACE FUNCTION public.audit_page_blocks()
RETURNS TRIGGER AS $$
DECLARE
  page_slug TEXT;
BEGIN
  SELECT slug INTO page_slug FROM public.pages WHERE id = COALESCE(NEW.page_id, OLD.page_id);
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes)
  VALUES (
    auth.uid(),
    TG_OP || ' block (' || COALESCE(NEW.block_type, OLD.block_type, '') || ') on page: ' || COALESCE(page_slug, ''),
    'page_blocks',
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted', to_jsonb(OLD))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE jsonb_build_object('created', to_jsonb(NEW))
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Drop old triggers and create new ones
DROP TRIGGER IF EXISTS version_pages_changes ON public.pages;
DROP TRIGGER IF EXISTS version_news_changes ON public.news;
DROP TRIGGER IF EXISTS audit_page_blocks_trigger ON public.page_blocks;

CREATE TRIGGER version_pages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.create_content_version_v2();

CREATE TRIGGER audit_page_blocks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.audit_page_blocks();

-- 7. Helper function to sync page.blocks JSON from page_blocks table
CREATE OR REPLACE FUNCTION public.sync_page_blocks_json(target_page_id UUID)
RETURNS void AS $$
DECLARE
  blocks_json JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pb.id,
      'type', pb.block_type,
      'title', pb.title,
      'content', pb.content,
      'settings', pb.settings,
      'is_visible', pb.is_visible,
      'is_draft', pb.is_draft
    ) ORDER BY pb.sort_order ASC
  ) INTO blocks_json
  FROM public.page_blocks pb
  WHERE pb.page_id = target_page_id;

  UPDATE public.pages
  SET blocks = COALESCE(blocks_json, '[]'::jsonb)
  WHERE id = target_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Helper to migrate homepage_sections to a 'home' page with blocks
CREATE OR REPLACE FUNCTION public.migrate_homepage_sections_to_blocks()
RETURNS text AS $$
DECLARE
  home_page_id UUID;
  section RECORD;
  block_id UUID;
  block_type_map text;
  total INTEGER := 0;
BEGIN
  -- Find or create the home page
  SELECT id INTO home_page_id FROM public.pages WHERE slug = 'home';
  
  IF home_page_id IS NULL THEN
    INSERT INTO public.pages (slug, title, content, published)
    VALUES ('home', 'Homepage', '{}'::jsonb, true)
    RETURNING id INTO home_page_id;
  END IF;

  -- Delete existing migrated blocks
  DELETE FROM public.page_blocks WHERE page_id = home_page_id;

  -- Map homepage_sections section_key to block_type
  FOR section IN 
    SELECT * FROM public.homepage_sections ORDER BY sort_order ASC
  LOOP
    block_type_map := CASE section.section_key
      WHEN 'hero' THEN 'hero'
      WHEN 'stats' THEN 'stats'
      WHEN 'features' THEN 'text'
      WHEN 'cta' THEN 'cta'
      WHEN 'impact' THEN 'stats'
      WHEN 'testimonials' THEN 'testimonials'
      WHEN 'news' THEN 'text'
      WHEN 'partners' THEN 'partners'
      ELSE 'custom_section'
    END;

    INSERT INTO public.page_blocks (page_id, block_type, title, content, sort_order, is_visible)
    VALUES (
      home_page_id,
      block_type_map,
      section.title,
      section.content,
      section.sort_order,
      section.is_active
    );
    total := total + 1;
  END LOOP;

  -- Sync blocks JSON
  PERFORM public.sync_page_blocks_json(home_page_id);

  RETURN 'Migrated ' || total || ' homepage sections to blocks on page: home';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Migrate existing homepage_sections data automatically
DO $$
DECLARE
  section_count INTEGER;
  home_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO section_count FROM public.homepage_sections;
  SELECT COUNT(*) INTO home_count FROM public.page_blocks pb JOIN public.pages p ON p.id = pb.page_id WHERE p.slug = 'home';
  
  IF section_count > 0 AND home_count = 0 THEN
    PERFORM public.migrate_homepage_sections_to_blocks();
  END IF;
END $$;

-- 10. RLS policies
ALTER TABLE IF EXISTS public.page_blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_blocks' AND policyname = 'page_blocks_select_public') THEN
    CREATE POLICY page_blocks_select_public ON public.page_blocks
      FOR SELECT USING (
        is_visible = true AND is_draft = false
        AND EXISTS (SELECT 1 FROM public.pages WHERE id = page_id AND published = true)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_blocks' AND policyname = 'page_blocks_select_admin') THEN
    CREATE POLICY page_blocks_select_admin ON public.page_blocks
      FOR SELECT USING (public.get_user_role_level() >= 60);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_blocks' AND policyname = 'page_blocks_insert_admin') THEN
    CREATE POLICY page_blocks_insert_admin ON public.page_blocks
      FOR INSERT WITH CHECK (public.get_user_role_level() >= 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_blocks' AND policyname = 'page_blocks_update_admin') THEN
    CREATE POLICY page_blocks_update_admin ON public.page_blocks
      FOR UPDATE USING (public.get_user_role_level() >= 90)
      WITH CHECK (public.get_user_role_level() >= 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_blocks' AND policyname = 'page_blocks_delete_admin') THEN
    CREATE POLICY page_blocks_delete_admin ON public.page_blocks
      FOR DELETE USING (public.get_user_role_level() >= 90);
  END IF;
END $$;

-- 11. Grant permissions
GRANT SELECT ON public.page_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_page_blocks_json TO authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_homepage_sections_to_blocks TO authenticated;
