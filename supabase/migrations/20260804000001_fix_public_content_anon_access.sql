DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'hero_content', 'section_content', 'footer_content', 'design_settings',
      'pages', 'page_headers', 'seo_content', 'site_images',
      'section_visibility', 'navigation_items', 'announcements', 'partners',
      'donation_content', 'sponsorship_content', 'volunteer_content',
      'transparency_content', 'cms_strings', 'donation_goals',
      'site_settings', 'gallery_items', 'news', 'student_stories',
      'students', 'media_library', 'faqs', 'videos', 'homepage_sections',
      'theme_presets', 'website_config', 'page_blocks', 'volunteer_events',
      'payment_settings'
    ])
  LOOP
    BEGIN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', tbl);
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table % does not exist, skipping', tbl;
    END;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Anyone can read published testimonials" ON public.testimonials;
CREATE POLICY "Anyone can read published testimonials"
  ON public.testimonials FOR SELECT
  USING (is_published = true);

GRANT SELECT ON public.testimonials TO anon;
