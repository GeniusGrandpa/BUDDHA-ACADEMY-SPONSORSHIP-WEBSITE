-- Website Builder / CMS Unified System
-- Adds proper website_pages, website_sections, website_page_versions tables
-- with draft/publish workflow, JSONB design settings, and RLS policies

-- 1. WEBSITE_PAGES - unified pages registry
CREATE TABLE IF NOT EXISTS public.website_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  meta_title TEXT,
  meta_description TEXT,
  hero_background_image TEXT,
  hero_overlay_color TEXT DEFAULT '#000000',
  hero_overlay_opacity NUMERIC(3,2) DEFAULT 0.5,
  layout_settings JSONB DEFAULT '{}'::jsonb,
  is_draft BOOLEAN DEFAULT false,
  published_version_id UUID,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WEBSITE_SECTIONS - sections per page
CREATE TABLE IF NOT EXISTS public.website_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.website_pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'custom',
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_draft BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, section_key)
);

-- 3. WEBSITE_CONTENT_BLOCKS - individual blocks within sections
CREATE TABLE IF NOT EXISTS public.website_content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.website_sections(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL DEFAULT 'text' CHECK (block_type IN ('text', 'image', 'card', 'button', 'gallery', 'video', 'rich_text', 'stat', 'testimonial', 'faq_item', 'custom')),
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. WEBSITE_PAGE_VERSIONS - version history for draft/publish
CREATE TABLE IF NOT EXISTS public.website_page_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.website_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, version_number)
);

-- 5. WEBSITE_MEDIA - unified media library
CREATE TABLE IF NOT EXISTS public.website_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT DEFAULT '',
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add updated_at triggers
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['website_pages', 'website_sections', 'website_content_blocks', 'website_page_versions'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_' || tbl || '_updated_at') THEN
      EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- RLS ENABLE
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_media ENABLE ROW LEVEL SECURITY;

-- RLS: website_pages
DROP POLICY IF EXISTS "Public can read published pages" ON public.website_pages;
CREATE POLICY "Public can read published pages"
  ON public.website_pages FOR SELECT
  USING (status = 'published' OR public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can insert website_pages" ON public.website_pages;
CREATE POLICY "Admins can insert website_pages"
  ON public.website_pages FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can update website_pages" ON public.website_pages;
CREATE POLICY "Admins can update website_pages"
  ON public.website_pages FOR UPDATE
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can delete website_pages" ON public.website_pages;
CREATE POLICY "Admins can delete website_pages"
  ON public.website_pages FOR DELETE
  USING (public.is_admin_or_super_admin());

-- RLS: website_sections
DROP POLICY IF EXISTS "Public can read visible sections" ON public.website_sections;
CREATE POLICY "Public can read visible sections"
  ON public.website_sections FOR SELECT
  USING (is_visible = true OR public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can insert website_sections" ON public.website_sections;
CREATE POLICY "Admins can insert website_sections"
  ON public.website_sections FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can update website_sections" ON public.website_sections;
CREATE POLICY "Admins can update website_sections"
  ON public.website_sections FOR UPDATE
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can delete website_sections" ON public.website_sections;
CREATE POLICY "Admins can delete website_sections"
  ON public.website_sections FOR DELETE
  USING (public.is_admin_or_super_admin());

-- RLS: website_content_blocks
DROP POLICY IF EXISTS "Public can read visible blocks" ON public.website_content_blocks;
CREATE POLICY "Public can read visible blocks"
  ON public.website_content_blocks FOR SELECT
  USING (is_visible = true OR EXISTS (
    SELECT 1 FROM public.website_sections ws
    JOIN public.website_pages wp ON wp.id = ws.page_id
    WHERE ws.id = website_content_blocks.section_id
    AND (ws.is_visible = true OR public.is_admin_or_super_admin())
  ));

DROP POLICY IF EXISTS "Admins can manage blocks" ON public.website_content_blocks;
CREATE POLICY "Admins can manage blocks"
  ON public.website_content_blocks FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

-- RLS: website_page_versions
DROP POLICY IF EXISTS "Admins can manage versions" ON public.website_page_versions;
CREATE POLICY "Admins can manage versions"
  ON public.website_page_versions FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

-- RLS: website_media
DROP POLICY IF EXISTS "Public can read media" ON public.website_media;
CREATE POLICY "Public can read media"
  ON public.website_media FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can upload media" ON public.website_media;
CREATE POLICY "Admins can upload media"
  ON public.website_media FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can update media" ON public.website_media;
CREATE POLICY "Admins can update media"
  ON public.website_media FOR UPDATE
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Admins can delete media" ON public.website_media;
CREATE POLICY "Admins can delete media"
  ON public.website_media FOR DELETE
  USING (public.is_admin_or_super_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON public.website_pages(slug);
CREATE INDEX IF NOT EXISTS idx_website_pages_status ON public.website_pages(status);
CREATE INDEX IF NOT EXISTS idx_website_sections_page ON public.website_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_sort ON public.website_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_website_blocks_section ON public.website_content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_website_blocks_sort ON public.website_content_blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_website_versions_page ON public.website_page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_website_media_type ON public.website_media(mime_type);
CREATE INDEX IF NOT EXISTS idx_website_pages_updated ON public.website_pages(updated_at DESC);

-- Seed initial pages from existing ALL_PUBLIC_PAGES
INSERT INTO public.website_pages (slug, title, status, meta_title, meta_description)
VALUES
  ('home', 'Home', 'published', 'Home - Buddha Academy', 'Welcome to Buddha Academy'),
  ('about', 'About Us', 'published', 'About Us - Buddha Academy', 'Learn about Buddha Academy'),
  ('sponsor', 'Sponsorship', 'published', 'Sponsorship - Buddha Academy', 'Sponsor a student at Buddha Academy'),
  ('students', 'Students', 'published', 'Students - Buddha Academy', 'View students at Buddha Academy'),
  ('donate', 'Donations', 'published', 'Donate - Buddha Academy', 'Support Buddha Academy with a donation'),
  ('gallery', 'Gallery', 'published', 'Gallery - Buddha Academy', 'View photos and media from Buddha Academy'),
  ('news', 'News/Blog', 'published', 'News & Updates - Buddha Academy', 'Latest news and updates from Buddha Academy'),
  ('contact', 'Contact', 'published', 'Contact Us - Buddha Academy', 'Get in touch with Buddha Academy'),
  ('faq', 'FAQ', 'published', 'Frequently Asked Questions - Buddha Academy', 'Common questions about Buddha Academy'),
  ('volunteer', 'Volunteer', 'published', 'Volunteer - Buddha Academy', 'Volunteer with Buddha Academy'),
  ('campaigns', 'Campaigns', 'published', 'Campaigns - Buddha Academy', 'Current campaigns at Buddha Academy'),
  ('success-stories', 'Success Stories', 'published', 'Success Stories - Buddha Academy', 'Success stories from Buddha Academy'),
  ('activity', 'Activity', 'published', 'Recent Activity - Buddha Academy', 'Recent activity at Buddha Academy'),
  ('transparency', 'Transparency', 'published', 'Transparency - Buddha Academy', 'Our commitment to transparency'),
  ('privacy', 'Privacy Policy', 'published', 'Privacy Policy - Buddha Academy', 'Privacy policy of Buddha Academy'),
  ('terms', 'Terms of Service', 'published', 'Terms of Service - Buddha Academy', 'Terms of service of Buddha Academy')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- Audit triggers for website tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['website_pages', 'website_sections', 'website_content_blocks', 'website_page_versions', 'website_media'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_' || tbl || '_changes') THEN
      EXECUTE format('CREATE TRIGGER audit_%I_changes AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_content_change()', tbl, tbl);
    END IF;
  END LOOP;
END $$;
