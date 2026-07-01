-- Seed all section_content rows required by HomePage rendering
-- Fixes: missing welcome, stats, featured_students, testimonials, donation_cta sections
-- Fixes: section_visibility key mismatch (students_preview -> featured_students)

-- 1. Hero background image — restore on hero_content if blank
UPDATE public.hero_content
SET background_image = 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'
WHERE (background_image IS NULL OR background_image = '')
  AND is_visible = true;

-- 2. Ensure hero_content has all required stat fields populated
UPDATE public.hero_content
SET
  statistics = '[
    {"value": "Since 1977", "label": "Trusted Service"},
    {"value": "49+",        "label": "Years of Service"},
    {"value": "100%",       "label": "Free Education"},
    {"value": "2000+",      "label": "Children Supported"}
  ]'::jsonb
WHERE (statistics IS NULL OR statistics = '[]'::jsonb)
  AND is_visible = true;

-- 3. section_content: welcome section
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'welcome',
  'Welcome to Buddha Academy',
  '',
  '{"title": "Welcome to Buddha Academy", "content": "Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal. We believe every child deserves the opportunity to learn, grow, and build a better future."}',
  true,
  1
)
ON CONFLICT (section_key) DO UPDATE SET
  title       = EXCLUDED.title,
  content     = EXCLUDED.content,
  is_visible  = true;

-- 4. section_content: stats section
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'stats',
  'Our Impact in Numbers',
  '',
  '{"title": "Our Impact in Numbers"}',
  true,
  2
)
ON CONFLICT (section_key) DO UPDATE SET
  title      = EXCLUDED.title,
  content    = EXCLUDED.content,
  is_visible = true;

-- 5. section_content: about_preview (upsert to ensure correct content)
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'about_preview',
  'About Buddha Academy',
  'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
  '{"title": "About Buddha Academy", "description": "Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.", "milestones": [
    {"year": "1977",  "event": "Founded with 12 students"},
    {"year": "1990s", "event": "Hostel expansion program"},
    {"year": "2010s", "event": "Computer lab established"},
    {"year": "Today", "event": "Educating hundreds annually"}
  ]}',
  true,
  3
)
ON CONFLICT (section_key) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  content     = EXCLUDED.content,
  is_visible  = true;

-- 6. section_content: featured_students section
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'featured_students',
  'Children Waiting for Sponsors',
  'Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.',
  '{"title": "Children Waiting for Sponsors"}',
  true,
  4
)
ON CONFLICT (section_key) DO UPDATE SET
  title      = EXCLUDED.title,
  content    = EXCLUDED.content,
  is_visible = true;

-- 7. section_content: sponsorship_steps (upsert)
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'sponsorship_steps',
  'How Sponsorship Works',
  'Your journey to changing a child''s life starts here.',
  '{"title": "How Sponsorship Works", "description": "Your journey to changing a child''s life starts here.", "steps": [
    {"title": "Browse Profiles",  "desc": "Review children waiting for sponsors"},
    {"title": "Choose a Child",   "desc": "Select a student to sponsor"},
    {"title": "Make Your Pledge", "desc": "Complete donation form securely"},
    {"title": "We Connect",       "desc": "Link you with your sponsored child"},
    {"title": "Receive Updates",  "desc": "Get progress reports and photos"},
    {"title": "Build Connection", "desc": "Exchange letters and messages"},
    {"title": "Track Impact",     "desc": "See your contribution at work"},
    {"title": "Join Community",   "desc": "Connect with other sponsors"}
  ]}',
  true,
  5
)
ON CONFLICT (section_key) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  content     = EXCLUDED.content,
  is_visible  = true;

-- 8. section_content: testimonials section
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'testimonials',
  'What Our Supporters Say',
  '',
  '{"title": "What Our Supporters Say"}',
  true,
  6
)
ON CONFLICT (section_key) DO UPDATE SET
  title      = EXCLUDED.title,
  content    = EXCLUDED.content,
  is_visible = true;

-- 9. section_content: donation_cta section
INSERT INTO public.section_content (section_key, title, description, content, is_visible, sort_order)
VALUES (
  'donation_cta',
  'Make a Difference Today',
  'Every contribution brings hope and opportunity to a child in Nepal.',
  '{"title": "Make a Difference Today", "description": "Every contribution brings hope and opportunity to a child in Nepal.", "button_text": "Donate Now", "button_link": "/donate"}',
  true,
  7
)
ON CONFLICT (section_key) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  content     = EXCLUDED.content,
  is_visible  = true;

-- 10. Fix section_visibility: add missing keys and fix key mismatch
-- The codebase checks 'featured_students' but the old seed used 'students_preview'
INSERT INTO public.section_visibility (section_key, section_name, is_visible, sort_order) VALUES
  ('hero',              'Hero Section',        true, 1),
  ('stats',             'Statistics Bar',      true, 2),
  ('welcome',           'Welcome Section',     true, 3),
  ('about_preview',     'About Preview',       true, 4),
  ('featured_students', 'Featured Students',   true, 5),
  ('sponsorship_steps', 'Sponsorship Steps',   true, 6),
  ('testimonials',      'Testimonials',        true, 7),
  ('donation_cta',      'Donation CTA',        true, 8),
  ('cta',               'Call to Action',      true, 9),
  ('footer',            'Footer',              true, 10)
ON CONFLICT (section_key) DO UPDATE SET
  is_visible = true;

-- 11. page_headers: seed all pages used by DynamicPublicPageRenderer
INSERT INTO public.page_headers (page_slug, title, subtitle, is_visible) VALUES
  ('home',             'Buddha Academy',            'Empowering Nepal''s Future, One Child at a Time',                                                                 true),
  ('about',            'About Buddha Academy',      'For over four decades we have been providing free, quality education to underprivileged children in Nepal.',       true),
  ('sponsor',          'Sponsor a Child',           'Your sponsorship provides education, meals, healthcare, and hope to a child in need.',                             true),
  ('students',         'Meet Our Students',         'Browse profiles of children waiting for sponsors. Each child has a unique story and dreams for a brighter future.', true),
  ('donate',           'Make a Donation',           'Your support helps us provide free education and healthcare to underprivileged children in Nepal.',                 true),
  ('gallery',          'Gallery',                   'Explore photos, videos, and testimonials showcasing our students and community.',                                   true),
  ('news',             'News & Events',             'Stay updated with the latest news, events, and impact stories from Buddha Academy.',                               true),
  ('contact',          'Contact Us',                'Have questions? We would love to hear from you.',                                                                    true),
  ('faq',              'Frequently Asked Questions','Find answers to common questions about sponsorship, donations, and our programs.',                                  true),
  ('volunteer',        'Volunteer With Us',         'Share your skills and make a direct impact on children''s lives.',                                                  true),
  ('transparency',     'Transparency & Accountability', 'We are committed to complete transparency in how we use donor funds.',                                         true),
  ('privacy',          'Privacy Policy',            'Your privacy matters to us.',                                                                                       true),
  ('terms',            'Terms & Conditions',        'Please read these terms carefully before using our platform.',                                                      true),
  ('success-stories',  'Success Stories',           'Real stories of hope, growth, and transformation.',                                                                 true)
ON CONFLICT (page_slug) DO UPDATE SET
  title      = EXCLUDED.title,
  subtitle   = EXCLUDED.subtitle,
  is_visible = true;

-- 12. Seed testimonials for the home page testimonials section
INSERT INTO public.testimonials (author_name, author_role, content, quote, is_published, is_featured, testimonial_type, sort_order)
VALUES
  ('Sarah M.',   'Sponsor from USA',        'Sponsoring a child at Buddha Academy has been one of the most rewarding experiences of my life. Seeing the progress reports every term fills me with joy.',  'Seeing the progress reports fills me with joy.',              true, true, 'donor',   1),
  ('James T.',   'Donor from UK',           'The transparency and regular updates from Buddha Academy give me complete confidence that my donations are making a real difference.',                       'My donations are making a real difference.',                  true, true, 'donor',   2),
  ('Priya K.',   'Volunteer from India',    'I volunteered at Buddha Academy for two months and was amazed by the dedication of the staff and the enthusiasm of the students.',                           'I was amazed by the dedication of the staff and students.',   true, true, 'volunteer', 3),
  ('Michael R.', 'Sponsor from Australia',  'Buddha Academy changed the life of the child I sponsor. She went from struggling to excel in her class. Education truly is the greatest gift.',              'Education truly is the greatest gift.',                       true, true, 'donor',   4)
ON CONFLICT DO NOTHING;
