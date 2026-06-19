-- Design Theme Management System
-- Centralized design settings, theme presets, and visual customization

-- 1. DESIGN SETTINGS TABLE (single row, stores all design config as JSON)
CREATE TABLE IF NOT EXISTS design_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Branding
  branding JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Colors (all website colors)
  colors JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Typography
  typography JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Layout & UI customization
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Component styling overrides
  component_styles JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Design tokens (spacing, radius, shadows, breakpoints, etc.)
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Website configuration (homepage layout, sections, announcements, etc.)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Draft settings (for preview before publish)
  draft JSONB,

  -- Metadata
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Only allow one published design settings row
  CONSTRAINT one_published_row CHECK (NOT is_published OR (is_published AND id = (SELECT id FROM design_settings WHERE is_published = true LIMIT 1))),
  -- Allow either no published row or exactly one
  CONSTRAINT unique_published UNIQUE (is_published) WHERE is_published = true
);

-- 2. THEME PRESETS TABLE
CREATE TABLE IF NOT EXISTS theme_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,

  -- Full snapshot of design_settings at time of save
  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  typography JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  component_styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. WEBSITE CONFIGURATION TABLE (homepage layout, sections, etc.)
CREATE TABLE IF NOT EXISTS website_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SECTION VISIBILITY TABLE
CREATE TABLE IF NOT EXISTS section_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ======== DEFAULT DATA ========

-- Insert default branding
INSERT INTO design_settings (
  branding,
  colors,
  typography,
  layout,
  component_styles,
  tokens,
  config,
  is_published
) VALUES (
  -- Branding
  jsonb_build_object(
    'organization_name', 'Buddha Academy',
    'tagline', 'Boudha · Kathmandu',
    'slogan', 'Empowering Through Education',
    'logo_url', '/src/assets/logo.jpg',
    'secondary_logo_url', null,
    'favicon_url', null,
    'footer_branding', 'Buddha Academy',
    'email_branding', 'Buddha Academy'
  ),

  -- Colors
  jsonb_build_object(
    'primary', '#f26b1d',
    'primary_light', '#fcb375',
    'primary_dark', '#b53f14',
    'secondary', '#c49a4e',
    'secondary_light', '#e3cc8e',
    'secondary_dark', '#a37d3f',
    'accent', '#f59e0b',
    'background', '#fdfbf7',
    'surface', '#ffffff',
    'surface_hover', '#faf6ee',
    'card', '#ffffff',
    'card_hover', '#faf6ee',
    'navbar_bg', '#ffffff',
    'navbar_text', '#374151',
    'navbar_active', '#d97706',
    'navbar_hover', '#d97706',
    'footer_bg', '#f9fafb',
    'footer_text', '#6b7280',
    'footer_heading', '#111827',
    'sidebar_bg', '#fdfbf7',
    'sidebar_text', '#6b7280',
    'sidebar_active_bg', '#fff5ed',
    'sidebar_active_text', '#ea580c',
    'button_primary_bg', '#f26b1d',
    'button_primary_text', '#ffffff',
    'button_primary_hover', '#d95317',
    'button_secondary_bg', '#c49a4e',
    'button_secondary_text', '#ffffff',
    'button_secondary_hover', '#a37d3f',
    'button_outline_border', '#f26b1d',
    'button_outline_text', '#f26b1d',
    'button_outline_hover', '#fff5ed',
    'text_primary', '#111827',
    'text_secondary', '#4b5563',
    'text_muted', '#9ca3af',
    'text_on_primary', '#ffffff',
    'text_on_secondary', '#ffffff',
    'border', '#e5e7eb',
    'border_light', '#f3f4f6',
    'border_accent', '#fcd34d',
    'divider', '#e5e7eb',
    'success', '#10b981',
    'success_light', '#d1fae5',
    'warning', '#f59e0b',
    'warning_light', '#fef3c7',
    'error', '#ef4444',
    'error_light', '#fee2e2',
    'info', '#3b82f6',
    'info_light', '#dbeafe',
    'hero_overlay', '#000000',
    'hero_overlay_opacity', '0.4'
  ),

  -- Typography
  jsonb_build_object(
    'heading_font', 'Inter',
    'body_font', 'Inter',
    'heading_font_url', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'body_font_url', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'base_size', '16',
    'scale_ratio', '1.25',
    'h1_size', '2.986',
    'h2_size', '2.488',
    'h3_size', '2.074',
    'h4_size', '1.728',
    'h5_size', '1.44',
    'h6_size', '1.2',
    'body_size', '1',
    'small_size', '0.833',
    'heading_weight', '700',
    'body_weight', '400',
    'heading_letter_spacing', '-0.025',
    'body_letter_spacing', '0',
    'heading_line_height', '1.2',
    'body_line_height', '1.6',
    'text_transform_heading', 'none',
    'text_transform_body', 'none'
  ),

  -- Layout
  jsonb_build_object(
    'container_width', '1280',
    'container_padding_x', '16',
    'section_spacing_y', '16',
    'section_spacing_x', '16',
    'border_radius_sm', '0.375',
    'border_radius_md', '0.5',
    'border_radius_lg', '0.75',
    'border_radius_xl', '1',
    'border_radius_2xl', '1.5',
    'border_radius_full', '9999',
    'shadow_sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'shadow_md', '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    'shadow_lg', '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    'shadow_xl', '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    'card_style', 'default',
    'button_style', 'rounded',
    'navbar_layout', 'default',
    'footer_layout', 'default',
    'sidebar_behavior', 'fixed',
    'animation_enabled', true,
    'animation_duration', '0.3',
    'hover_effects', true,
    'website_max_width', '100'
  ),

  -- Component styles
  jsonb_build_object(
    'hero_default_style', 'gradient',
    'hero_default_bg', 'linear-gradient(135deg, #f26b1d, #fcb375)',
    'hero_default_overlay', true,
    'card_default_style', 'elevated',
    'card_default_border_radius', '0.75',
    'cta_default_style', 'gradient',
    'banner_default_style', 'default',
    'testimonial_layout', 'grid',
    'student_spotlight_layout', 'grid',
    'donation_section_theme', 'warm'
  ),

  -- Design tokens
  jsonb_build_object(
    'spacing_unit', '4',
    'transition_duration', '300',
    'transition_timing', 'ease-in-out',
    'z_index_dropdown', '50',
    'z_index_sticky', '100',
    'z_index_modal_backdrop', '200',
    'z_index_modal', '300',
    'z_index_popover', '400',
    'z_index_tooltip', '500',
    'z_index_toast', '600',
    'breakpoint_sm', '640',
    'breakpoint_md', '768',
    'breakpoint_lg', '1024',
    'breakpoint_xl', '1280',
    'breakpoint_2xl', '1536'
  ),

  -- Config
  jsonb_build_object(
    'homepage_layout', 'default',
    'featured_sections', jsonb_build_array('hero', 'stats', 'about', 'students', 'testimonials', 'news', 'cta', 'footer'),
    'announcement_bar_enabled', false,
    'announcement_bar_text', '',
    'announcement_bar_type', 'info',
    'cta_placement', 'bottom',
    'donation_campaign_theme', 'default',
    'seasonal_theme_enabled', false,
    'seasonal_theme_name', '',
    'dynamic_banners_enabled', true
  )
) ON CONFLICT DO NOTHING;

-- Insert default website config items
INSERT INTO website_config (key, label, value) VALUES
  ('homepage_sections_order', 'Homepage Section Order', jsonb_build_array(
    'hero', 'impact_stats', 'featured_students', 'about_preview', 'testimonials', 'latest_news', 'cta_banner'
  )),
  ('featured_sections_enabled', 'Featured Sections Toggle', jsonb_build_object(
    'hero', true, 'impact_stats', true, 'featured_students', true,
    'about_preview', true, 'testimonials', true, 'latest_news', true, 'cta_banner', true
  )),
  ('donation_settings', 'Donation Display Settings', jsonb_build_object(
    'show_goal_progress', true, 'show_recent_donors', true,
    'minimum_donation_display', '5', 'currency_symbol', '$'
  )),
  ('layout_options', 'Global Layout Options', jsonb_build_object(
    'container_style', 'boxed', 'content_width', '1200',
    'sidebar_position', 'right', 'show_breadcrumbs', true
  ))
ON CONFLICT (key) DO NOTHING;

-- Insert default section visibility
INSERT INTO section_visibility (section_key, section_name, description) VALUES
  ('hero', 'Hero Section', 'Main hero/banner at top of homepage'),
  ('impact_stats', 'Impact Stats', 'Key metrics and statistics display'),
  ('featured_students', 'Featured Students', 'Student spotlight cards'),
  ('about_preview', 'About Preview', 'Brief about section'),
  ('testimonials', 'Testimonials', 'Donor and community testimonials'),
  ('latest_news', 'Latest News', 'Recent news and updates'),
  ('cta_banner', 'CTA Banner', 'Call-to-action banner'),
  ('donation_goals', 'Donation Goals', 'Fundraising progress display'),
  ('partners', 'Partners/Sponsors', 'Partner and sponsor logos'),
  ('events', 'Upcoming Events', 'Events calendar preview'),
  ('video_gallery', 'Video Gallery', 'Featured videos section'),
  ('faq_section', 'FAQ Section', 'Frequently asked questions')
ON CONFLICT (section_key) DO NOTHING;

-- ======== RLS POLICIES ========

ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_visibility ENABLE ROW LEVEL SECURITY;

-- Design settings: public can read published, only super_admin/admin can write
CREATE POLICY "Anyone can read published design settings"
  ON design_settings FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can read all design settings"
  ON design_settings FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY "Admins can insert design settings"
  ON design_settings FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY "Admins can update design settings"
  ON design_settings FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

CREATE POLICY "Admins can delete design settings"
  ON design_settings FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

-- Theme presets: public can read, only admins can write
CREATE POLICY "Anyone can read theme presets"
  ON theme_presets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage theme presets"
  ON theme_presets FOR ALL
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

-- Website config: public can read active, only admins can write
CREATE POLICY "Anyone can read active website config"
  ON website_config FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage website config"
  ON website_config FOR ALL
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

-- Section visibility: public can read, only admins can write
CREATE POLICY "Anyone can read section visibility"
  ON section_visibility FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage section visibility"
  ON section_visibility FOR ALL
  USING (
    auth.role() = 'authenticated' AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
    )
  );

-- ======== TRIGGER for updated_at ========
CREATE OR REPLACE FUNCTION update_design_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER design_settings_updated_at
  BEFORE UPDATE ON design_settings
  FOR EACH ROW EXECUTE FUNCTION update_design_settings_updated_at();

CREATE TRIGGER theme_presets_updated_at
  BEFORE UPDATE ON theme_presets
  FOR EACH ROW EXECUTE FUNCTION update_design_settings_updated_at();

-- ======== GRANTS ========
GRANT ALL ON design_settings TO authenticated;
GRANT ALL ON theme_presets TO authenticated;
GRANT ALL ON website_config TO authenticated;
GRANT ALL ON section_visibility TO authenticated;
GRANT SELECT ON design_settings TO anon;
GRANT SELECT ON theme_presets TO anon;
GRANT SELECT ON website_config TO anon;
GRANT SELECT ON section_visibility TO anon;
