CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT DEFAULT 'Buddha Academy',
  tagline TEXT DEFAULT 'Empowering Nepal''s Future, One Child at a Time',
  logo_url TEXT,
  favicon_url TEXT,
  theme_primary_color TEXT DEFAULT '#f59e0b',
  theme_secondary_color TEXT DEFAULT '#ea580c',
  contact_email TEXT DEFAULT 'info@buddhaacademy.edu.np',
  contact_phone TEXT DEFAULT '+977 1 1234567',
  contact_address TEXT DEFAULT 'Buddha Academy, Boudha, Kathmandu, Nepal',
  social_facebook TEXT DEFAULT '#',
  social_instagram TEXT DEFAULT '#',
  social_twitter TEXT DEFAULT '#',
  social_youtube TEXT,
  social_linkedin TEXT,
  seo_default_title TEXT DEFAULT 'Buddha Academy - Empowering Nepal''s Future',
  seo_default_description TEXT DEFAULT 'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
  seo_default_image TEXT,
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT,
  announcement_type TEXT DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'success', 'error')),
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  donation_default_currency TEXT DEFAULT 'USD',
  donation_min_amount NUMERIC DEFAULT 1,
  donation_max_amount NUMERIC DEFAULT 100000,
  footer_description TEXT DEFAULT 'Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, providing free education to underprivileged children since 1977.',
  footer_copyright TEXT DEFAULT 'All rights reserved.',
  footer_nonprofit_text TEXT DEFAULT 'A tax-exempt 501(c)(3) nonprofit organization.',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_singleton ON public.site_settings((true));
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  location TEXT NOT NULL DEFAULT 'header' CHECK (location IN ('header', 'footer_get_involved', 'footer_information', 'footer_contact', 'mobile', 'quick_links')),
  label TEXT NOT NULL,
  url TEXT,
  route TEXT,
  icon TEXT,
  target TEXT DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_cta BOOLEAN DEFAULT false,
  cta_style TEXT CHECK (cta_style IN ('primary', 'secondary', 'glass', 'outline')),
  requires_auth BOOLEAN DEFAULT false,
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_navigation_items_location ON public.navigation_items(location);
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent ON public.navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_sort ON public.navigation_items(location, sort_order);
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'event')),
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON public.announcements(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_announcements_sort ON public.announcements(sort_order);
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  partner_type TEXT NOT NULL DEFAULT 'sponsor' CHECK (partner_type IN ('sponsor', 'donor', 'partner', 'media', 'community', 'government')),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_sort ON public.partners(sort_order);
CREATE INDEX IF NOT EXISTS idx_partners_visible ON public.partners(is_visible);
ALTER TABLE IF EXISTS public.pages
  ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.media_library
  ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT '/',
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS file_hash TEXT,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON public.media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_mime ON public.media_library(mime_type);
CREATE OR REPLACE FUNCTION public.cms_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, changes, ip_address)
  VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      ELSE row_to_json(NEW)::jsonb
    END,
    current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_site_settings') THEN
    CREATE TRIGGER audit_site_settings AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
      FOR EACH ROW EXECUTE FUNCTION public.cms_audit_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_navigation_items') THEN
    CREATE TRIGGER audit_navigation_items AFTER INSERT OR UPDATE OR DELETE ON public.navigation_items
      FOR EACH ROW EXECUTE FUNCTION public.cms_audit_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_announcements') THEN
    CREATE TRIGGER audit_announcements AFTER INSERT OR UPDATE OR DELETE ON public.announcements
      FOR EACH ROW EXECUTE FUNCTION public.cms_audit_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_partners') THEN
    CREATE TRIGGER audit_partners AFTER INSERT OR UPDATE OR DELETE ON public.partners
      FOR EACH ROW EXECUTE FUNCTION public.cms_audit_trigger();
  END IF;
END $$;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_update_admin"
  ON site_settings FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "navigation_items_select_public"
  ON navigation_items FOR SELECT
  USING (is_visible = true);
CREATE POLICY "navigation_items_select_staff"
  ON navigation_items FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "navigation_items_insert_admin"
  ON navigation_items FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "navigation_items_update_admin"
  ON navigation_items FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "navigation_items_delete_admin"
  ON navigation_items FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "announcements_select_public"
  ON announcements FOR SELECT
  USING (is_active = true);
CREATE POLICY "announcements_select_staff"
  ON announcements FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "announcements_insert_admin"
  ON announcements FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "announcements_update_admin"
  ON announcements FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "announcements_delete_admin"
  ON announcements FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "partners_select_public"
  ON partners FOR SELECT
  USING (is_visible = true);
CREATE POLICY "partners_select_staff"
  ON partners FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "partners_insert_admin"
  ON partners FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "partners_update_admin"
  ON partners FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "partners_delete_admin"
  ON partners FOR DELETE
  USING (public.get_user_role_level() >= 90);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT SELECT ON public.navigation_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.navigation_items TO authenticated;
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partners TO authenticated;
INSERT INTO public.site_settings (site_name, tagline, footer_description)
VALUES (
  'Buddha Academy',
  'Empowering Nepal''s Future, One Child at a Time',
  'Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, providing free education to underprivileged children since 1977.'
)
ON CONFLICT DO NOTHING;
INSERT INTO public.navigation_items (location, label, url, route, sort_order, is_visible) VALUES
  ('header', 'Home', NULL, '/', 1, true),
  ('header', 'About', NULL, '/about', 2, true),
  ('header', 'Students', NULL, '/students', 3, true),
  ('header', 'Gallery', NULL, '/gallery', 4, true),
  ('header', 'News', NULL, '/news', 5, true),
  ('header', 'Contact', NULL, '/contact', 6, true),
  ('footer_get_involved', 'Sponsor a Child', NULL, '/sponsor', 1, true),
  ('footer_get_involved', 'Make a Donation', NULL, '/donate', 2, true),
  ('footer_get_involved', 'Volunteer', NULL, '/volunteer', 3, true),
  ('footer_information', 'About Us', NULL, '/about', 1, true),
  ('footer_information', 'Transparency', NULL, '/transparency', 2, true),
  ('footer_information', 'FAQ', NULL, '/faq', 3, true),
  ('footer_information', 'Privacy Policy', NULL, '/privacy', 4, true),
  ('footer_information', 'Terms of Service', NULL, '/terms', 5, true)
ON CONFLICT DO NOTHING;
