CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('privacy_policy', 'terms_conditions', 'cookie_policy', 'donation_policy')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  effective_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_page_id UUID NOT NULL REFERENCES public.legal_pages(id) ON DELETE CASCADE,
  heading TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_page_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_page_id UUID NOT NULL REFERENCES public.legal_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON public.legal_pages(slug);
CREATE INDEX IF NOT EXISTS idx_legal_pages_status ON public.legal_pages(status);
CREATE INDEX IF NOT EXISTS idx_legal_pages_type ON public.legal_pages(type);
CREATE INDEX IF NOT EXISTS idx_legal_page_sections_page ON public.legal_page_sections(legal_page_id);
CREATE INDEX IF NOT EXISTS idx_legal_page_sections_sort ON public.legal_page_sections(legal_page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_legal_page_versions_page ON public.legal_page_versions(legal_page_id);

ALTER TABLE IF EXISTS public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_pages_select_public"
  ON public.legal_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "legal_pages_select_staff"
  ON public.legal_pages FOR SELECT
  USING (public.get_user_role_level() >= 60);

CREATE POLICY "legal_pages_insert_admin"
  ON public.legal_pages FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "legal_pages_update_admin"
  ON public.legal_pages FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "legal_pages_delete_admin"
  ON public.legal_pages FOR DELETE
  USING (public.get_user_role_level() >= 90);

CREATE POLICY "legal_page_sections_select_public"
  ON public.legal_page_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.legal_pages
      WHERE legal_pages.id = legal_page_sections.legal_page_id
      AND legal_pages.status = 'published'
    )
  );

CREATE POLICY "legal_page_sections_select_staff"
  ON public.legal_page_sections FOR SELECT
  USING (public.get_user_role_level() >= 60);

CREATE POLICY "legal_page_sections_insert_admin"
  ON public.legal_page_sections FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "legal_page_sections_update_admin"
  ON public.legal_page_sections FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "legal_page_sections_delete_admin"
  ON public.legal_page_sections FOR DELETE
  USING (public.get_user_role_level() >= 90);

CREATE POLICY "legal_page_versions_select_staff"
  ON public.legal_page_versions FOR SELECT
  USING (public.get_user_role_level() >= 60);

CREATE POLICY "legal_page_versions_insert_admin"
  ON public.legal_page_versions FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "legal_page_versions_delete_super_admin"
  ON public.legal_page_versions FOR DELETE
  USING (public.get_user_role_level() >= 100);

REVOKE ALL ON public.legal_pages FROM anon;
GRANT SELECT ON public.legal_pages TO anon;
GRANT ALL ON public.legal_pages TO authenticated;

REVOKE ALL ON public.legal_page_sections FROM anon;
GRANT SELECT ON public.legal_page_sections TO anon;
GRANT ALL ON public.legal_page_sections TO authenticated;

REVOKE ALL ON public.legal_page_versions FROM anon;
GRANT SELECT ON public.legal_page_versions TO authenticated;
GRANT INSERT, DELETE ON public.legal_page_versions TO authenticated;

INSERT INTO public.legal_pages (type, title, slug, meta_title, meta_description, status)
VALUES
  ('privacy_policy', 'Privacy Policy', 'privacy', 'Privacy Policy - Buddha Academy Sponsorship Platform', 'Learn how Buddha Academy collects, uses, stores, and protects your personal data. Our privacy practices follow donor-friendly and NGO-appropriate standards.', 'draft'),
  ('terms_conditions', 'Terms & Conditions', 'terms', 'Terms & Conditions - Buddha Academy Sponsorship Platform', 'Review the terms governing the use of the Buddha Academy sponsorship and donation platform, including eligibility, donations, sponsorships, and user responsibilities.', 'draft')
ON CONFLICT (slug) DO NOTHING;
