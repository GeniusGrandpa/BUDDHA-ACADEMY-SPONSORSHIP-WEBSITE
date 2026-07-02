-- ============================================================================
-- CORRECTIVE MIGRATION — Phase 11: Migration Audit & Rollback
-- ============================================================================
-- This migration safely removes architecture that no longer matches the
-- restored production system. It does NOT delete any production data.
--
-- PRESERVED:
--   ✓ profiles, students, sponsorships, donations, payments, audit_logs
--   ✓ media, navigation, footer_content, branding, site_settings
--   ✓ hero_content, section_content, section_visibility, page_headers
--   ✓ site_images, cms_strings, seo_content
--   ✓ donation_content, sponsorship_content, volunteer_content, transparency_content
--   ✓ website_pages, website_sections, website_content_blocks (used by admin)
--   ✓ website_page_versions, website_media (used by admin)
--   ✓ legal_pages, legal_page_sections, legal_page_versions
--   ✓ testimonials, gallery, news, contacts, faqs, announcements, partners
--
-- REMOVED (unused page builder architecture):
--   ✗ page_blocks table (from advanced_block_system — never used by restored code)
--   ✗ sync_page_blocks_json function (syncs to unused page_blocks)
--   ✗ migrate_homepage_sections_to_blocks function (migrates to unused page_blocks)
--   ✗ audit_page_blocks function (audits unused page_blocks)
--   ✗ version_pages_changes trigger (auto-versions on pages — handled by website_builder)
--   ✗ create_content_version_v2 function (replaced by website_page_versions)
-- ============================================================================
-- 1. Drop the page_blocks table (introduced by 20260707000001_advanced_block_system)
--    This table is NOT used by any code in the restored system.
--    The website_content_blocks table serves the same purpose for the website builder.
DROP TABLE IF EXISTS public.page_blocks CASCADE;
-- 2. Drop functions that only served page_blocks
DROP FUNCTION IF EXISTS public.sync_page_blocks_json(UUID);
DROP FUNCTION IF EXISTS public.migrate_homepage_sections_to_blocks();
DROP FUNCTION IF EXISTS public.audit_page_blocks();
-- 3. Drop the version_pages_changes trigger and its function
--    The website_page_versions table handles versioning in the website builder.
--    The create_content_version_v2 function was a duplicate versioning system.
DROP TRIGGER IF EXISTS version_pages_changes ON public.pages;
DROP FUNCTION IF EXISTS public.create_content_version_v2();
-- 4. Ensure the website_pages seed data is correct for all public pages
--    (Re-seed to ensure consistency with restored React pages)
INSERT INTO public.website_pages (
    slug,
    title,
    status,
    meta_title,
    meta_description
  )
VALUES (
    'home',
    'Home',
    'published',
    'Home - Buddha Academy',
    'Welcome to Buddha Academy'
  ),
  (
    'about',
    'About Us',
    'published',
    'About Us - Buddha Academy',
    'Learn about Buddha Academy'
  ),
  (
    'sponsor',
    'Sponsorship',
    'published',
    'Sponsorship - Buddha Academy',
    'Sponsor a student at Buddha Academy'
  ),
  (
    'students',
    'Students',
    'published',
    'Students - Buddha Academy',
    'View students at Buddha Academy'
  ),
  (
    'donate',
    'Donations',
    'published',
    'Donate - Buddha Academy',
    'Support Buddha Academy with a donation'
  ),
  (
    'gallery',
    'Gallery',
    'published',
    'Gallery - Buddha Academy',
    'View photos and media from Buddha Academy'
  ),
  (
    'news',
    'News/Blog',
    'published',
    'News & Updates - Buddha Academy',
    'Latest news and updates from Buddha Academy'
  ),
  (
    'contact',
    'Contact',
    'published',
    'Contact Us - Buddha Academy',
    'Get in touch with Buddha Academy'
  ),
  (
    'faq',
    'FAQ',
    'published',
    'Frequently Asked Questions - Buddha Academy',
    'Common questions about Buddha Academy'
  ),
  (
    'volunteer',
    'Volunteer',
    'published',
    'Volunteer - Buddha Academy',
    'Volunteer with Buddha Academy'
  ),
  (
    'campaigns',
    'Campaigns',
    'published',
    'Campaigns - Buddha Academy',
    'Current campaigns at Buddha Academy'
  ),
  (
    'success-stories',
    'Success Stories',
    'published',
    'Success Stories - Buddha Academy',
    'Success stories from Buddha Academy'
  ),
  (
    'activity',
    'Activity',
    'published',
    'Recent Activity - Buddha Academy',
    'Recent activity at Buddha Academy'
  ),
  (
    'transparency',
    'Transparency',
    'published',
    'Transparency - Buddha Academy',
    'Our commitment to transparency'
  ),
  (
    'privacy',
    'Privacy Policy',
    'published',
    'Privacy Policy - Buddha Academy',
    'Privacy policy of Buddha Academy'
  ),
  (
    'terms',
    'Terms of Service',
    'published',
    'Terms of Service - Buddha Academy',
    'Terms of service of Buddha Academy'
  ) ON CONFLICT (slug) DO
UPDATE
SET title = EXCLUDED.title,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;
-- 5. Ensure homepage sections exist in website_sections for admin editing
DO $$
DECLARE v_page_id UUID;
BEGIN
SELECT id INTO v_page_id
FROM public.website_pages
WHERE slug = 'home'
LIMIT 1;
IF v_page_id IS NULL THEN RETURN;
END IF;
INSERT INTO public.website_sections (
    page_id,
    section_key,
    section_type,
    title,
    subtitle,
    description,
    content,
    settings,
    sort_order,
    is_visible
  )
VALUES (
    v_page_id,
    'hero',
    'hero',
    'Empowering Nepal''s Future',
    'One Child at a Time',
    'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
    '{"highlight":"One Child at a Time","background_image":"https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg","layout":"left","cta_primary":{"text":"Sponsor a Child","link":"/students"},"cta_secondary":{"text":"Donate Now","link":"/donate"},"statistics":[{"value":"Since 1977","label":"Trusted Service"},{"value":"49+","label":"Years of Service"},{"value":"100%","label":"Free Education"},{"value":"2000+","label":"Children Supported"}],"badges":[]}',
    '{"background_image":"https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg","overlay_color":"#000000","overlay_opacity":0.5}',
    1,
    true
  ),
  (
    v_page_id,
    'stats',
    'stats',
    'Our Impact in Numbers',
    '',
    '',
    '{"statistics":[{"value":"Since 1977","label":"Trusted Service"},{"value":"49+","label":"Years of Service"},{"value":"100%","label":"Free Education"},{"value":"2000+","label":"Children Supported"}]}',
    '{}',
    2,
    true
  ),
  (
    v_page_id,
    'welcome',
    'welcome',
    'Welcome to Buddha Academy',
    '',
    'Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal.',
    '{"content":"Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal."}',
    '{}',
    3,
    true
  ),
  (
    v_page_id,
    'about_preview',
    'about_preview',
    'About Buddha Academy',
    '',
    'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
    '{"milestones":[{"year":"1977","event":"Founded with 12 students"},{"year":"1990s","event":"Hostel expansion program"},{"year":"2010s","event":"Computer lab established"},{"year":"Today","event":"Educating hundreds annually"}]}',
    '{}',
    4,
    true
  ),
  (
    v_page_id,
    'featured_students',
    'featured_students',
    'Children Waiting for Sponsors',
    'Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.',
    '',
    '{}',
    '{}',
    5,
    true
  ),
  (
    v_page_id,
    'sponsorship_steps',
    'sponsorship_steps',
    'How Sponsorship Works',
    'Your journey to changing a child''s life starts here.',
    '',
    '{"steps":[{"title":"Browse Profiles","desc":"Review children waiting for sponsors"},{"title":"Choose a Child","desc":"Select a student to sponsor"},{"title":"Make Your Pledge","desc":"Complete donation form securely"},{"title":"We Connect","desc":"Link you with your sponsored child"},{"title":"Receive Updates","desc":"Get progress reports & photos"},{"title":"Build Connection","desc":"Exchange letters & messages"},{"title":"Track Impact","desc":"See your contribution at work"},{"title":"Join Community","desc":"Connect with other sponsors"}]}',
    '{}',
    6,
    true
  ),
  (
    v_page_id,
    'testimonials',
    'testimonials',
    'What Our Supporters Say',
    '',
    '',
    '{}',
    '{}',
    7,
    true
  ),
  (
    v_page_id,
    'donation_cta',
    'donation_cta',
    'Make a Difference Today',
    'Every contribution brings hope and opportunity to a child in Nepal.',
    '',
    '{"button_text":"Donate Now","button_link":"/donate"}',
    '{}',
    8,
    true
  ) ON CONFLICT (page_id, section_key) DO
UPDATE
SET title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  settings = EXCLUDED.settings,
  sort_order = EXCLUDED.sort_order,
  is_visible = true;
END $$;
-- 6. Ensure section_visibility is seeded correctly
INSERT INTO public.section_visibility (
    section_key,
    section_name,
    is_visible,
    sort_order
  )
VALUES (
    'hero',
    'Hero Section',
    true,
    1
  ),
  (
    'stats',
    'Statistics Bar',
    true,
    2
  ),
  (
    'welcome',
    'Welcome Section',
    true,
    3
  ),
  (
    'about_preview',
    'About Preview',
    true,
    4
  ),
  (
    'featured_students',
    'Featured Students',
    true,
    5
  ),
  (
    'sponsorship_steps',
    'Sponsorship Steps',
    true,
    6
  ),
  (
    'testimonials',
    'Testimonials',
    true,
    7
  ),
  (
    'donation_cta',
    'Donation CTA',
    true,
    8
  ),
  (
    'cta',
    'Call to Action',
    true,
    9
  ),
  ('footer', 'Footer', true, 10) ON CONFLICT (section_key) DO
UPDATE
SET is_visible = EXCLUDED.is_visible,
  sort_order = EXCLUDED.sort_order;
-- 7. Ensure hero_content has proper defaults
UPDATE public.hero_content
SET background_image = 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'
WHERE (
    background_image IS NULL
    OR background_image = ''
  )
  AND is_visible = true;
UPDATE public.hero_content
SET statistics = '[{"value":"Since 1977","label":"Trusted Service"},{"value":"49+","label":"Years of Service"},{"value":"100%","label":"Free Education"},{"value":"2000+","label":"Children Supported"}]'::jsonb
WHERE (
    statistics IS NULL
    OR statistics = '[]'::jsonb
  )
  AND is_visible = true;
-- 8. Ensure section_content has homepage sections seeded
INSERT INTO public.section_content (
    section_key,
    title,
    description,
    content,
    is_visible,
    sort_order
  )
VALUES (
    'welcome',
    'Welcome to Buddha Academy',
    '',
    '{"title":"Welcome to Buddha Academy","content":"Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal. We believe every child deserves the opportunity to learn, grow, and build a better future."}',
    true,
    1
  ),
  (
    'stats',
    'Our Impact in Numbers',
    '',
    '{"title":"Our Impact in Numbers"}',
    true,
    2
  ),
  (
    'about_preview',
    'About Buddha Academy',
    'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
    '{"title":"About Buddha Academy","description":"Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.","milestones":[{"year":"1977","event":"Founded with 12 students"},{"year":"1990s","event":"Hostel expansion program"},{"year":"2010s","event":"Computer lab established"},{"year":"Today","event":"Educating hundreds annually"}]}',
    true,
    3
  ),
  (
    'featured_students',
    'Children Waiting for Sponsors',
    'Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.',
    '{"title":"Children Waiting for Sponsors"}',
    true,
    4
  ),
  (
    'sponsorship_steps',
    'How Sponsorship Works',
    'Your journey to changing a child''s life starts here.',
    '{"title":"How Sponsorship Works","description":"Your journey to changing a child''s life starts here.","steps":[{"title":"Browse Profiles","desc":"Review children waiting for sponsors"},{"title":"Choose a Child","desc":"Select a student to sponsor"},{"title":"Make Your Pledge","desc":"Complete donation form securely"},{"title":"We Connect","desc":"Link you with your sponsored child"},{"title":"Receive Updates","desc":"Get progress reports & photos"},{"title":"Build Connection","desc":"Exchange letters & messages"},{"title":"Track Impact","desc":"See your contribution at work"},{"title":"Join Community","desc":"Connect with other sponsors"}]}',
    true,
    5
  ),
  (
    'testimonials',
    'What Our Supporters Say',
    '',
    '{"title":"What Our Supporters Say"}',
    true,
    6
  ),
  (
    'donation_cta',
    'Make a Difference Today',
    'Every contribution brings hope and opportunity to a child in Nepal.',
    '{"title":"Make a Difference Today","description":"Every contribution brings hope and opportunity to a child in Nepal.","button_text":"Donate Now","button_link":"/donate"}',
    true,
    7
  ) ON CONFLICT (section_key) DO
UPDATE
SET title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  is_visible = true;
-- 9. Ensure page_headers are seeded for all public pages
INSERT INTO public.page_headers (page_slug, title, subtitle, is_visible)
VALUES (
    'home',
    'Buddha Academy',
    'Empowering Nepal''s Future, One Child at a Time',
    true
  ),
  (
    'about',
    'About Buddha Academy',
    'For over four decades we have been providing free, quality education to underprivileged children in Nepal.',
    true
  ),
  (
    'sponsor',
    'Sponsor a Child',
    'Your sponsorship provides education, meals, healthcare, and hope to a child in need.',
    true
  ),
  (
    'students',
    'Meet Our Students',
    'Browse profiles of children waiting for sponsors. Each child has a unique story and dreams for a brighter future.',
    true
  ),
  (
    'donate',
    'Make a Donation',
    'Your support helps us provide free education and healthcare to underprivileged children in Nepal.',
    true
  ),
  (
    'gallery',
    'Gallery',
    'Explore photos, videos, and testimonials showcasing our students and community.',
    true
  ),
  (
    'news',
    'News & Events',
    'Stay updated with the latest news, events, and impact stories from Buddha Academy.',
    true
  ),
  (
    'contact',
    'Contact Us',
    'Have questions? We would love to hear from you.',
    true
  ),
  (
    'faq',
    'Frequently Asked Questions',
    'Find answers to common questions about sponsorship, donations, and our programs.',
    true
  ),
  (
    'volunteer',
    'Volunteer With Us',
    'Share your skills and make a direct impact on children''s lives.',
    true
  ),
  (
    'transparency',
    'Transparency & Accountability',
    'We are committed to complete transparency in how we use donor funds.',
    true
  ),
  (
    'privacy',
    'Privacy Policy',
    'Your privacy matters to us.',
    true
  ),
  (
    'terms',
    'Terms & Conditions',
    'Please read these terms carefully before using our platform.',
    true
  ),
  (
    'success-stories',
    'Success Stories',
    'Real stories of hope, growth, and transformation.',
    true
  ) ON CONFLICT (page_slug) DO
UPDATE
SET title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_visible = true;