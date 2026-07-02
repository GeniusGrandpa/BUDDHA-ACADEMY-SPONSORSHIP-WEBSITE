DO $$
DECLARE
  v_about_id       UUID;
  v_sponsor_id     UUID;
  v_donate_id      UUID;
  v_students_id    UUID;
  v_gallery_id     UUID;
  v_news_id        UUID;
  v_contact_id     UUID;
  v_faq_id         UUID;
  v_volunteer_id   UUID;
  v_transparency_id UUID;
  v_privacy_id     UUID;
  v_terms_id       UUID;
  v_campaigns_id   UUID;
  v_stories_id     UUID;
  v_activity_id    UUID;
BEGIN

INSERT INTO public.website_pages (slug, title, status, meta_title, meta_description)
VALUES
  ('about',           'About Us',        'published', 'About Us - Buddha Academy',          'Learn about Buddha Academy and our mission'),
  ('sponsor',         'Sponsorship',     'published', 'Sponsor a Child - Buddha Academy',   'Sponsor a child and change their life'),
  ('donate',          'Donate',          'published', 'Donate - Buddha Academy',            'Support Buddha Academy with a donation'),
  ('students',        'Students',        'published', 'Students - Buddha Academy',          'Meet the students at Buddha Academy'),
  ('gallery',         'Gallery',         'published', 'Gallery - Buddha Academy',           'Photos and media from Buddha Academy'),
  ('news',            'News',            'published', 'News - Buddha Academy',              'Latest news from Buddha Academy'),
  ('contact',         'Contact',         'published', 'Contact Us - Buddha Academy',        'Get in touch with Buddha Academy'),
  ('faq',             'FAQ',             'published', 'FAQ - Buddha Academy',               'Frequently asked questions'),
  ('volunteer',       'Volunteer',       'published', 'Volunteer - Buddha Academy',         'Volunteer with Buddha Academy'),
  ('transparency',    'Transparency',    'published', 'Transparency - Buddha Academy',      'Our commitment to transparency'),
  ('privacy',         'Privacy Policy',  'published', 'Privacy Policy - Buddha Academy',    'Privacy policy of Buddha Academy'),
  ('terms',           'Terms',           'published', 'Terms of Service - Buddha Academy',  'Terms of service of Buddha Academy'),
  ('campaigns',       'Campaigns',       'published', 'Campaigns - Buddha Academy',         'Current campaigns at Buddha Academy'),
  ('success-stories', 'Success Stories', 'published', 'Success Stories - Buddha Academy',   'Success stories from Buddha Academy'),
  ('activity',        'Activity',        'published', 'Activity - Buddha Academy',          'Recent activity at Buddha Academy')
ON CONFLICT (slug) DO UPDATE SET status = 'published';

SELECT id INTO v_about_id        FROM public.website_pages WHERE slug = 'about'           LIMIT 1;
SELECT id INTO v_sponsor_id      FROM public.website_pages WHERE slug = 'sponsor'         LIMIT 1;
SELECT id INTO v_donate_id       FROM public.website_pages WHERE slug = 'donate'          LIMIT 1;
SELECT id INTO v_students_id     FROM public.website_pages WHERE slug = 'students'        LIMIT 1;
SELECT id INTO v_gallery_id      FROM public.website_pages WHERE slug = 'gallery'         LIMIT 1;
SELECT id INTO v_news_id         FROM public.website_pages WHERE slug = 'news'            LIMIT 1;
SELECT id INTO v_contact_id      FROM public.website_pages WHERE slug = 'contact'         LIMIT 1;
SELECT id INTO v_faq_id          FROM public.website_pages WHERE slug = 'faq'             LIMIT 1;
SELECT id INTO v_volunteer_id    FROM public.website_pages WHERE slug = 'volunteer'       LIMIT 1;
SELECT id INTO v_transparency_id FROM public.website_pages WHERE slug = 'transparency'    LIMIT 1;
SELECT id INTO v_privacy_id      FROM public.website_pages WHERE slug = 'privacy'         LIMIT 1;
SELECT id INTO v_terms_id        FROM public.website_pages WHERE slug = 'terms'           LIMIT 1;
SELECT id INTO v_campaigns_id    FROM public.website_pages WHERE slug = 'campaigns'       LIMIT 1;
SELECT id INTO v_stories_id      FROM public.website_pages WHERE slug = 'success-stories' LIMIT 1;
SELECT id INTO v_activity_id     FROM public.website_pages WHERE slug = 'activity'        LIMIT 1;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
VALUES (
  v_about_id, 'page_header', 'page_header',
  'About Buddha Academy',
  'Providing free, quality education to underprivileged children in Nepal since 1977.',
  NULL,
  '{}',
  jsonb_build_object('background_image', '', 'overlay_color', '#000000', 'overlay_opacity', 0.5),
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_about_id, 'about_mission', 'about_mission',
  'Our Mission',
  'Buddha Academy is dedicated to providing free, quality education to underprivileged children in the heart of Kathmandu. We believe that every child, regardless of their background, deserves the opportunity to learn, grow, and reach their full potential.',
  jsonb_build_object(
    'mission_description', 'Founded in 1977 by compassionate educators, Buddha Academy has grown from a small school with 12 students to a thriving institution serving hundreds of children annually. Our students receive not just education, but a complete support system including meals, healthcare, and safe accommodation.',
    'vision', 'A world where every child has access to quality education and the opportunity to build a brighter future.'
  ),
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, content, sort_order, is_visible)
VALUES (
  v_about_id, 'about_stats', 'about_stats',
  'Our Impact in Numbers',
  jsonb_build_object('statistics', jsonb_build_array(
    jsonb_build_object('value', '49+',    'label', 'Years of Service'),
    jsonb_build_object('value', '2000+',  'label', 'Children Educated'),
    jsonb_build_object('value', '12+',    'label', 'Partner Countries'),
    jsonb_build_object('value', '100%',   'label', 'Free Education')
  )),
  3, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_about_id, 'about_values', 'about_values',
  'Our Core Values',
  'The principles that guide everything we do at Buddha Academy.',
  '{}',
  4, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_about_id, 'about_timeline', 'about_timeline',
  'Our Journey',
  'From a small school with 12 students to a beacon of hope for thousands of children.',
  jsonb_build_object('milestones', jsonb_build_array(
    jsonb_build_object('year', '1977', 'event', 'Founded with 12 students by dedicated educators'),
    jsonb_build_object('year', '1985', 'event', 'First graduating class completes secondary education'),
    jsonb_build_object('year', '1995', 'event', 'Moved to permanent campus with dedicated classrooms'),
    jsonb_build_object('year', '2005', 'event', 'Enrollment crossed 500 students with expanded programs'),
    jsonb_build_object('year', '2015', 'event', 'International sponsorships begin connecting students worldwide'),
    jsonb_build_object('year', '2026', 'event', 'Serving over 2,000 children with free, quality education')
  )),
  5, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_about_id, 'about_cta', 'about_cta',
  'Join Our Mission',
  'Help us continue providing free education to children who need it most. Every contribution makes a lasting difference.',
  jsonb_build_object(
    'button_text',  'Sponsor a Child',
    'button_link',  '/students',
    'button2_text', 'Make a Donation',
    'button2_link', '/donate'
  ),
  6, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
VALUES (
  v_sponsor_id, 'sponsor_hero', 'sponsor_hero',
  'Sponsor a Child',
  'Change a Life Today',
  'Your sponsorship provides free education, daily meals, healthcare, and hope to a child in Kathmandu, Nepal.',
  jsonb_build_object(
    'background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg',
    'cta_primary',      jsonb_build_object('text', 'Browse Students', 'link', '/students'),
    'cta_secondary',    jsonb_build_object('text', 'Learn More', 'link', '/about')
  ),
  jsonb_build_object('background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg', 'overlay_opacity', 0.55),
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, content = EXCLUDED.content,
  settings = EXCLUDED.settings, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_sponsor_id, 'sponsor_steps', 'sponsor_steps',
  'How Sponsorship Works',
  'Your journey to changing a child''s life is simple. Follow these steps and become a life-changing sponsor.',
  jsonb_build_object('steps', jsonb_build_array(
    jsonb_build_object('title', 'Browse Profiles',   'desc', 'Review children waiting for sponsors and learn their stories'),
    jsonb_build_object('title', 'Choose a Child',    'desc', 'Select a student whose story resonates with you'),
    jsonb_build_object('title', 'Make Your Pledge',  'desc', 'Complete the secure sponsorship form with your details'),
    jsonb_build_object('title', 'We Connect',        'desc', 'We link you with your sponsored child and share updates'),
    jsonb_build_object('title', 'Receive Updates',   'desc', 'Get regular progress reports, photos, and school updates'),
    jsonb_build_object('title', 'Build Connection',  'desc', 'Exchange letters and messages with your sponsored child'),
    jsonb_build_object('title', 'Track Impact',      'desc', 'See exactly how your sponsorship is changing their life'),
    jsonb_build_object('title', 'Join Community',    'desc', 'Connect with other sponsors in our global community')
  )),
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_sponsor_id, 'sponsor_benefits', 'sponsor_benefits',
  'What Your Sponsorship Provides',
  'Your monthly contribution directly supports a child''s education and wellbeing.',
  jsonb_build_object('cards', jsonb_build_array(
    jsonb_build_object('title', 'Quality Education',     'description', 'Full access to structured curriculum, qualified teachers, and learning materials.', 'icon', 'book-open'),
    jsonb_build_object('title', 'Nutritious Meals',      'description', 'Three balanced meals daily to ensure students can focus on learning.', 'icon', 'utensils'),
    jsonb_build_object('title', 'Healthcare Access',     'description', 'Regular medical check-ups, dental care, and emergency medical support.', 'icon', 'heart'),
    jsonb_build_object('title', 'Safe Accommodation',    'description', 'Safe, clean boarding facilities for students from remote villages.', 'icon', 'home'),
    jsonb_build_object('title', 'Educational Materials', 'description', 'Textbooks, stationery, uniforms, and all required school supplies.', 'icon', 'package'),
    jsonb_build_object('title', 'Personal Development',  'description', 'Mentoring, sports, arts, and activities that nurture the whole child.', 'icon', 'star')
  )),
  3, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_sponsor_id, 'sponsor_cta', 'sponsor_cta',
  'Ready to Change a Life?',
  'Browse our student profiles and find a child whose story speaks to your heart. Your sponsorship transforms their future.',
  jsonb_build_object('button_text', 'Browse Student Profiles', 'button_link', '/students'),
  4, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
VALUES (
  v_donate_id, 'donate_hero', 'donate_hero',
  'Make a Donation',
  'Every Contribution Counts',
  'Your support helps us provide free education, daily meals, and healthcare to underprivileged children in Nepal.',
  jsonb_build_object('background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'),
  jsonb_build_object('background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg', 'overlay_opacity', 0.6),
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, settings = EXCLUDED.settings,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_donate_id, 'donate_impact', 'donate_impact',
  'See Your Impact',
  'Every donation — large or small — directly supports our students'' education and wellbeing.',
  jsonb_build_object('statistics', jsonb_build_array(
    jsonb_build_object('value', 'NPR 1,000', 'label', 'Provides school supplies for 1 student'),
    jsonb_build_object('value', 'NPR 5,000', 'label', 'Covers monthly educational support'),
    jsonb_build_object('value', 'NPR 10,000', 'label', 'Full month of student support'),
    jsonb_build_object('value', 'NPR 25,000', 'label', 'Supports multiple students')
  )),
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_donate_id, 'donate_process', 'donate_process',
  'How to Donate',
  'Making a donation is quick, secure, and easy.',
  jsonb_build_object('steps', jsonb_build_array(
    jsonb_build_object('title', 'Choose Amount',    'desc', 'Select a preset amount or enter a custom donation amount'),
    jsonb_build_object('title', 'Select Frequency', 'desc', 'Choose between one-time or recurring monthly donations'),
    jsonb_build_object('title', 'Secure Payment',   'desc', 'Complete payment via Khalti, eSewa, or bank transfer'),
    jsonb_build_object('title', 'Get Receipt',      'desc', 'Receive an instant tax-deductible donation receipt')
  )),
  3, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
VALUES (
  v_students_id, 'page_header', 'page_header',
  'Meet Our Students',
  'Children Waiting for Sponsors',
  'Browse profiles of children currently waiting for sponsorship. Each child has a unique story and dreams for a brighter future.',
  '{}',
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_students_id, 'students_grid', 'students_grid',
  'Student Profiles',
  'Find a child to sponsor. Profiles are updated regularly as new students join and sponsorships are secured.',
  '{}',
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
VALUES (
  v_gallery_id, 'page_header', 'page_header',
  'Gallery',
  'Life at Buddha Academy',
  'Explore photos, videos, and moments showcasing our students, staff, and community.',
  '{}',
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_gallery_id, 'gallery_grid', 'gallery_grid',
  'Photo Gallery',
  'A window into daily life, special events, and the moments that make Buddha Academy special.',
  '{}',
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
VALUES (
  v_news_id, 'page_header', 'page_header',
  'News & Updates',
  'Stay Informed',
  'The latest news, stories, and updates from Buddha Academy and our community.',
  '{}',
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_news_id, 'news_grid', 'news_grid',
  'Latest Articles',
  'Stories, updates, and announcements from Buddha Academy.',
  '{}',
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
VALUES (
  v_contact_id, 'page_header', 'page_header',
  'Contact Us',
  'We Would Love to Hear From You',
  'Have questions about sponsorship, donations, or volunteering? We are here to help.',
  '{}',
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_contact_id, 'contact_details', 'contact_details',
  'Get in Touch',
  'Reach us by phone, email, or visit us in person at our campus in Boudha, Kathmandu.',
  jsonb_build_object(
    'address', 'Buddha Academy, Boudha, Kathmandu, Nepal',
    'phone',   '+977 1 1234567',
    'email',   'info@buddhaacademy.edu.np',
    'hours',   'Monday to Friday: 9:00 AM – 5:00 PM (NPT)'
  ),
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_contact_id, 'contact_form', 'contact_form',
  'Send Us a Message',
  'Fill in the form below and we will get back to you within 24 hours.',
  '{}',
  3, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
VALUES (
  v_faq_id, 'page_header', 'page_header',
  'Frequently Asked Questions',
  'We Have Answers',
  'Find answers to the most common questions about sponsorship, donations, and our programs.',
  '{}',
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_faq_id, 'faq_list', 'faq_list',
  'Common Questions',
  'Can''t find the answer you are looking for? Contact us directly.',
  '{}',
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
VALUES (
  v_volunteer_id, 'volunteer_hero', 'volunteer_hero',
  'Volunteer With Us',
  'Make a Direct Impact',
  'Share your skills and time to help children access quality education. Join our dedicated team of volunteers from around the world.',
  jsonb_build_object('background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'),
  jsonb_build_object('background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg', 'overlay_opacity', 0.55),
  1, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description, settings = EXCLUDED.settings,
  sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_volunteer_id, 'volunteer_opps', 'volunteer_opps',
  'Volunteer Opportunities',
  'Whether you can join us in Nepal or contribute remotely, there are many ways to make a difference.',
  jsonb_build_object('cards', jsonb_build_array(
    jsonb_build_object('title', 'Teaching',          'description', 'Help with English, math, science, and computer classes. Share your knowledge and inspire young minds.', 'icon', 'book'),
    jsonb_build_object('title', 'Healthcare',        'description', 'Medical professionals can provide check-ups, health education, and basic healthcare services.', 'icon', 'heart'),
    jsonb_build_object('title', 'Mentorship',        'description', 'Guide students in personal development, career choices, and life skills.', 'icon', 'users'),
    jsonb_build_object('title', 'Remote Support',    'description', 'Contribute from anywhere through online tutoring, content creation, and fundraising.', 'icon', 'globe'),
    jsonb_build_object('title', 'Construction',      'description', 'Help maintain and improve our facilities and campus infrastructure.', 'icon', 'tool'),
    jsonb_build_object('title', 'Arts and Culture',  'description', 'Teach music, art, dance, and help preserve Nepali cultural heritage.', 'icon', 'music')
  )),
  2, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  content = EXCLUDED.content, sort_order = EXCLUDED.sort_order, is_visible = true;

INSERT INTO public.website_sections
  (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
VALUES (
  v_volunteer_id, 'volunteer_form', 'volunteer_form',
  'Apply to Volunteer',
  'Interested in volunteering? Fill in your details and we will get in touch with the next steps.',
  '{}',
  3, true
)
ON CONFLICT (page_id, section_key) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_visible = true;

END $$;
