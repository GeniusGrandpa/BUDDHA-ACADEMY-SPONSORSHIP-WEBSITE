CREATE TABLE IF NOT EXISTS public.donation_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  hero_background_image TEXT DEFAULT '',
  currency_label TEXT DEFAULT 'All amounts in Nepalese Rupees (NPR)',
  impact_cards JSONB DEFAULT '[]'::jsonb,
  impact_stories JSONB DEFAULT '[]'::jsonb,
  process_steps JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_donation_content_published ON public.donation_content(is_published);
CREATE TABLE IF NOT EXISTS public.sponsorship_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  hero_background_image TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  section_title TEXT DEFAULT '',
  section_description TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  cta_title TEXT DEFAULT '',
  cta_description TEXT DEFAULT '',
  cta_button_text TEXT DEFAULT '',
  cta_button_link TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsorship_content_published ON public.sponsorship_content(is_published);
CREATE TABLE IF NOT EXISTS public.volunteer_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  hero_background_image TEXT DEFAULT '',
  section_title TEXT DEFAULT '',
  section_description TEXT DEFAULT '',
  opportunities JSONB DEFAULT '[]'::jsonb,
  skill_options JSONB DEFAULT '[]'::jsonb,
  form_fields JSONB DEFAULT '[]'::jsonb,
  success_message TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_volunteer_content_published ON public.volunteer_content(is_published);
CREATE TABLE IF NOT EXISTS public.transparency_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  allocation_title TEXT DEFAULT '',
  allocation_description TEXT DEFAULT '',
  allocation_data JSONB DEFAULT '[]'::jsonb,
  verification_title TEXT DEFAULT '',
  verification_description TEXT DEFAULT '',
  verification_steps JSONB DEFAULT '[]'::jsonb,
  impact_report_title TEXT DEFAULT '',
  impact_report_items JSONB DEFAULT '[]'::jsonb,
  receipt_policy_title TEXT DEFAULT '',
  receipt_policy_text TEXT DEFAULT '',
  donor_privacy_title TEXT DEFAULT '',
  donor_privacy_text TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transparency_content_published ON public.transparency_content(is_published);
CREATE TABLE IF NOT EXISTS public.hero_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT '',
  highlight TEXT DEFAULT '',
  description TEXT DEFAULT '',
  background_image TEXT DEFAULT '',
  overlay_color TEXT DEFAULT 'from-stone-950/80 via-stone-950/60 to-transparent',
  overlay_opacity INTEGER DEFAULT 80,
  cta_primary_text TEXT DEFAULT '',
  cta_primary_link TEXT DEFAULT '',
  cta_secondary_text TEXT DEFAULT '',
  cta_secondary_link TEXT DEFAULT '',
  statistics JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  layout TEXT DEFAULT 'left',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  animation_enabled BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hero_content_visible ON public.hero_content(is_visible);
CREATE TABLE IF NOT EXISTS public.section_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  section_name TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_section_visibility_key ON public.section_visibility(section_key);
CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  title TEXT DEFAULT '',
  position TEXT DEFAULT 'center',
  is_featured BOOLEAN DEFAULT false,
  section TEXT DEFAULT '',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_images_key ON public.site_images(image_key);
CREATE INDEX IF NOT EXISTS idx_site_images_section ON public.site_images(section);
CREATE TABLE IF NOT EXISTS public.footer_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT DEFAULT '',
  copyright_text TEXT DEFAULT '',
  nonprofit_text TEXT DEFAULT '',
  quick_links JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE IF EXISTS public.news
  ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured_image_caption TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS related_post_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS public.seo_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  og_title TEXT DEFAULT '',
  og_description TEXT DEFAULT '',
  twitter_title TEXT DEFAULT '',
  twitter_description TEXT DEFAULT '',
  canonical_url TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_content_slug ON public.seo_content(page_slug);
CREATE TABLE IF NOT EXISTS public.page_headers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  background_image TEXT DEFAULT '',
  overlay_enabled BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_headers_slug ON public.page_headers(page_slug);
CREATE TABLE IF NOT EXISTS public.section_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  content JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_section_content_key ON public.section_content(section_key);
ALTER TABLE public.donation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published donation_content" ON public.donation_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published sponsorship_content" ON public.sponsorship_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published volunteer_content" ON public.volunteer_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published transparency_content" ON public.transparency_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view visible hero_content" ON public.hero_content
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can view section_visibility" ON public.section_visibility
  FOR SELECT USING (true);
CREATE POLICY "Public can view site_images" ON public.site_images
  FOR SELECT USING (true);
CREATE POLICY "Public can view published footer_content" ON public.footer_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published seo_content" ON public.seo_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view visible page_headers" ON public.page_headers
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can view visible section_content" ON public.section_content
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin full access donation_content" ON public.donation_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access sponsorship_content" ON public.sponsorship_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access volunteer_content" ON public.volunteer_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access transparency_content" ON public.transparency_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access hero_content" ON public.hero_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access section_visibility" ON public.section_visibility
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_images" ON public.site_images
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access footer_content" ON public.footer_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access seo_content" ON public.seo_content
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access page_headers" ON public.page_headers
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access section_content" ON public.section_content
  USING (auth.role() = 'authenticated');
GRANT ALL ON public.donation_content TO authenticated, anon;
GRANT ALL ON public.sponsorship_content TO authenticated, anon;
GRANT ALL ON public.volunteer_content TO authenticated, anon;
GRANT ALL ON public.transparency_content TO authenticated, anon;
GRANT ALL ON public.hero_content TO authenticated, anon;
GRANT ALL ON public.section_visibility TO authenticated, anon;
GRANT ALL ON public.site_images TO authenticated, anon;
GRANT ALL ON public.footer_content TO authenticated, anon;
GRANT ALL ON public.seo_content TO authenticated, anon;
GRANT ALL ON public.page_headers TO authenticated, anon;
GRANT ALL ON public.section_content TO authenticated, anon;
INSERT INTO public.hero_content (title, highlight, description, background_image, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, statistics, badges, is_visible)
VALUES (
  'Empowering Nepal''s Future',
  'One Child at a Time',
  'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
  'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg',
  'Sponsor a Child',
  '/students',
  'Donate Now',
  '/donate',
  '[{"value": "Since 1977", "label": "Trusted Service"}, {"value": "49+", "label": "Years of Service"}, {"value": "100%", "label": "Free Education"}, {"value": "2000+", "label": "Children Supported"}]',
  '[{"text": "Verified Nonprofit"}, {"text": "12+ Countries"}]',
  true
);
ALTER TABLE public.section_visibility ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
INSERT INTO public.section_visibility (section_key, section_name, is_visible, sort_order) VALUES
  ('hero', 'Hero Section', true, 1),
  ('stats', 'Statistics Bar', true, 2),
  ('about_preview', 'About Preview', true, 3),
  ('students_preview', 'Students Preview', true, 4),
  ('sponsorship_steps', 'Sponsorship Steps', true, 5),
  ('news', 'News Section', true, 6),
  ('testimonials', 'Testimonials', true, 7),
  ('cta', 'Call to Action', true, 8),
  ('footer', 'Footer', true, 9)
ON CONFLICT (section_key) DO NOTHING;
INSERT INTO public.section_content (section_key, title, description, content, is_visible) VALUES
('about_preview', 'About Buddha Academy', 'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.', '{"milestones": [{"year": "1977", "event": "Founded with 12 students"}, {"year": "1990s", "event": "Hostel expansion program"}, {"year": "2010s", "event": "Computer lab established"}, {"year": "Today", "event": "Educating hundreds annually"}]}', true),
('sponsorship_steps', 'How Sponsorship Works', 'Your journey to changing a child''s life starts here. Follow these simple steps to become a sponsor.', '{"steps": [{"num": "01", "title": "Browse Profiles", "desc": "Review children waiting for sponsors"}, {"num": "02", "title": "Choose a Child", "desc": "Select a student to sponsor"}, {"num": "03", "title": "Make Your Pledge", "desc": "Complete donation form securely"}, {"num": "04", "title": "We Connect", "desc": "Link you with your sponsored child"}, {"num": "05", "title": "Receive Updates", "desc": "Get progress reports & photos"}, {"num": "06", "title": "Build Connection", "desc": "Exchange letters & messages"}, {"num": "07", "title": "Track Impact", "desc": "See your contribution at work"}, {"num": "08", "title": "Join Community", "desc": "Connect with other sponsors"}]}', true)
ON CONFLICT (section_key) DO NOTHING;
INSERT INTO public.sponsorship_content (hero_title, hero_subtitle, section_title, section_description, steps, benefits, cta_title, cta_description, cta_button_text, cta_button_link, is_published)
VALUES (
  'Sponsor a Child',
  'Your sponsorship provides education, meals, healthcare, and hope to a child in need. Change a life today.',
  'How Sponsorship Works',
  'Follow these simple steps to start your sponsorship journey and change a child''s life.',
  '[{"num": "01", "title": "Browse Student Profiles", "desc": "Review profiles of children waiting for a sponsor"}, {"num": "02", "title": "Choose a Child to Sponsor", "desc": "Select a student whose story resonates with you"}, {"num": "03", "title": "Select Your Sponsorship Level", "desc": "Choose a monthly contribution that fits your budget"}, {"num": "04", "title": "Complete the Sponsorship Form", "desc": "Fill in your details and payment information"}, {"num": "05", "title": "Receive Welcome Package", "desc": "Get your sponsorship welcome kit with child''s photo"}, {"num": "06", "title": "Build a Connection", "desc": "Exchange letters, photos, and updates with your child"}, {"num": "07", "title": "Get Progress Updates", "desc": "Receive regular progress reports and school updates"}, {"num": "08", "title": "See Your Impact", "desc": "Track how your sponsorship is changing a life"}, {"num": "09", "title": "Transform a Life", "desc": "Your consistent support creates lasting change"}]',
  '[{"text": "Provide quality education"}, {"text": "Ensure nutritious meals"}, {"text": "Access to healthcare"}, {"text": "Safe learning environment"}, {"text": "Educational materials"}, {"text": "Character development"}]',
  'Ready to Change a Life?',
  'Browse our student profiles and find a child whose story speaks to your heart. Your sponsorship can transform their future.',
  'Browse Student Profiles',
  '/students',
  true
);
INSERT INTO public.donation_content (hero_title, hero_subtitle, currency_label, impact_cards, process_steps, is_published)
VALUES (
  'Make a Donation',
  'Your support helps us provide free education, meals, and healthcare to underprivileged children in Nepal. Every contribution makes a difference.',
  'All amounts in Nepalese Rupees (NPR)',
  '[{"amount": 1000, "label": "School Supplies for a Student", "description": "Provides notebooks, pens, stationery and other essential school supplies for a student for one month.", "icon": "book"}, {"amount": 5000, "label": "Monthly Educational Support", "description": "Covers educational materials, tutoring support, and learning resources for a student.", "icon": "graduation-cap"}, {"amount": 10000, "label": "Full Sponsorship Assistance", "description": "Provides comprehensive support including tuition, books, uniforms, and daily meals.", "icon": "heart"}, {"amount": 25000, "label": "Multi-Student Support", "description": "Your generous contribution helps support multiple students with their educational needs.", "icon": "users"}]',
  '[{"title": "Choose Amount", "desc": "Select a donation amount or enter custom"}, {"title": "Select Frequency", "desc": "One-time or monthly giving"}, {"title": "Complete Payment", "desc": "Secure payment via Khalti, eSewa, or Bank"}, {"title": "Receive Receipt", "desc": "Get instant tax-deductible receipt"}]',
  true
);
INSERT INTO public.transparency_content (hero_title, hero_subtitle, allocation_title, allocation_description, allocation_data, verification_title, verification_description, verification_steps, impact_report_title, impact_report_items, receipt_policy_title, receipt_policy_text, donor_privacy_title, donor_privacy_text, is_published)
VALUES (
  'Transparency & Accountability',
  'We are committed to complete transparency in how we use donor funds and the impact we create.',
  'How Your Donations Are Used',
  'Every dollar you donate goes directly to supporting our students and their education.',
  '[{"label": "Children''s Education & Welfare", "value": 70, "color": "#F59E0B", "description": "Covers tuition, books, uniforms, daily meals, healthcare, and extracurricular activities for students."}, {"label": "Teachers & Staff", "value": 20, "color": "#10B981", "description": "Salaries and training for qualified teachers, administrative staff, and support personnel."}, {"label": "Facilities & Operations", "value": 10, "color": "#3B82F6", "description": "Building maintenance, utilities, transportation, and daily operational expenses."}]',
  'Student Verification Process',
  'Every student at Buddha Academy goes through a rigorous verification process to ensure your sponsorship reaches those who need it most.',
  '["Each student is personally interviewed by our admissions team", "Family background verification and financial need assessment", "Academic records and previous school performance review", "Regular follow-up visits and progress monitoring by coordinators", "Annual re-evaluation of sponsorship eligibility and needs"]',
  'Annual Impact Report',
  '["Number of students enrolled and graduated", "Academic performance statistics", "Financial statements breakdown", "Success stories and testimonials", "Future plans and goals"]',
  'Receipt Policy',
  'All donors receive official receipt confirmation via email immediately after donation. Annual consolidated receipts are provided for tax purposes. Physical receipts available on request.',
  'Donor Privacy',
  'We never share donor information with third parties. Your personal data is protected and used only for communication regarding your donations and impact updates.',
  true
);
INSERT INTO public.volunteer_content (hero_title, hero_subtitle, section_title, section_description, opportunities, skill_options, success_message, is_published)
VALUES (
  'Volunteer With Us',
  'Share your skills and make a direct impact on children''s lives. Join our community of dedicated volunteers.',
  'Volunteer Opportunities',
  'Whether you can join us in Nepal or contribute remotely, there are many ways to help.',
  '[{"title": "Teaching", "description": "Help with English, math, science, and computer classes. Share your knowledge and inspire young minds.", "icon": "book"}, {"title": "Healthcare", "description": "Medical professionals can provide check-ups, health education, and basic healthcare services.", "icon": "heart"}, {"title": "Mentorship", "description": "Guide and support students in their personal development, career choices, and life skills.", "icon": "users"}, {"title": "Remote Support", "description": "Contribute from anywhere through online tutoring, fundraising, content creation, and more.", "icon": "globe"}]',
  '[{"value": "", "label": "Select your area of expertise"}, {"value": "teaching", "label": "Teaching & Education"}, {"value": "healthcare", "label": "Healthcare & Medical"}, {"value": "it", "label": "IT & Technology"}, {"value": "construction", "label": "Construction & Maintenance"}, {"value": "administration", "label": "Administration"}, {"value": "arts", "label": "Arts & Music"}, {"value": "sports", "label": "Sports & Physical Education"}, {"value": "other", "label": "Other"}]',
  'Thank you for your interest in volunteering. We''ll be in touch soon.',
  true
);
INSERT INTO public.footer_content (description, copyright_text, nonprofit_text, quick_links, social_links, contact_info, is_published)
VALUES (
  'Buddha Academy is a nonprofit organization dedicated to providing free, quality education to underprivileged children in Nepal.',
  '© 2024 Buddha Academy. All rights reserved.',
  'Buddha Academy is a registered 501(c)(3) nonprofit organization.',
  '[{"label": "About Us", "url": "/about"}, {"label": "Our Students", "url": "/students"}, {"label": "Sponsorship", "url": "/sponsor"}, {"label": "Donate", "url": "/donate"}, {"label": "FAQ", "url": "/faq"}, {"label": "Contact", "url": "/contact"}, {"label": "Privacy Policy", "url": "/privacy"}, {"label": "Terms & Conditions", "url": "/terms"}]',
  '[{"platform": "facebook", "url": "https://facebook.com/buddhaacademy", "label": "Facebook"}, {"platform": "instagram", "url": "https://instagram.com/buddhaacademy", "label": "Instagram"}, {"platform": "twitter", "url": "https://twitter.com/buddhaacademy", "label": "Twitter"}]',
  '{"address": "Buddha Academy, Boudha, Kathmandu, Nepal", "phone": "+977 1 1234567", "email": "info@buddhaacademy.edu.np"}',
  true
);
INSERT INTO public.page_headers (page_slug, title, subtitle, is_visible) VALUES
  ('about', 'About Buddha Academy', 'For over four decades, we''ve been providing free, quality education to underprivileged children in Nepal, transforming lives and building brighter futures.', true),
  ('contact', 'Contact Us', 'Have questions? We''d love to hear from you. Send us a message and we''ll respond as soon as possible.', true),
  ('privacy', 'Privacy Policy', 'Your privacy matters to us. Learn how we collect, use, and protect your information.', true),
  ('terms', 'Terms & Conditions', 'Please read these terms carefully before using our platform.', true),
  ('volunteer', 'Volunteer With Us', 'Share your skills and make a direct impact on children''s lives.', true),
  ('transparency', 'Transparency & Accountability', 'We are committed to complete transparency in how we use donor funds.', true),
  ('students', 'Meet Our Students', 'Browse profiles of children waiting for sponsors. Each child has a unique story and dreams for a brighter future.', true),
  ('news', 'News & Events', 'Stay updated with the latest news, events, and impact stories from Buddha Academy.', true),
  ('faq', 'Frequently Asked Questions', 'Find answers to common questions about sponsorship, donations, and our programs.', true),
  ('gallery', 'Gallery', 'Explore photos, videos, and testimonials showcasing our students and community.', true),
  ('success-stories', 'Success Stories', 'Real stories of hope, growth, and transformation. See how sponsorship is changing lives at Buddha Academy.', true)
ON CONFLICT (page_slug) DO NOTHING;
INSERT INTO public.site_images (image_key, image_url, alt_text, title, section) VALUES
  ('about_mission_1', 'https://images.pexels.com/photos/8471832/pexels-photo-8471832.jpeg?auto=compress&cs=tinysrgb&w=600', 'Students learning', 'Students in Classroom', 'about'),
  ('about_mission_2', 'https://images.pexels.com/photos/8471827/pexels-photo-8471827.jpeg?auto=compress&cs=tinysrgb&w=600', 'School activities', 'School Activities', 'about'),
  ('student_fallback', 'https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=600', 'Student', 'Student Photo', 'students'),
  ('gallery_fallback', 'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=600', 'Gallery image', 'Gallery', 'gallery'),
  ('sponsorship_hero', 'https://scontent.fktm21-2.fna.fbcdn.net/v/t39.30808-6/471833586_890283822036353_4086769547494535428_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=3LVD_rzG4N0Q7kNvwEzDsQX&_nc_oc=AdlXnOODHPjcqTBlp9fAhrXFGfqBNq3X0x0CctLvC46m5dA17B7FnAxrJQW0iNd6CqE&_nc_zt=23&_nc_ht=scontent.fktm21-2.fna&_nc_gid=P69xhrqJ_6dGqQHfPsdIqg&oh=00_AfFk2hbvmXKcmE5tLlViO_qE8AhZvU9ldDDhSF1MsWL7MQ&oe=67F7E569', 'Buddha Academy students', 'Buddha Academy', 'sponsorship')
ON CONFLICT (image_key) DO NOTHING;
UPDATE public.news SET
  hero_title = COALESCE(hero_title, title),
  hero_subtitle = COALESCE(hero_subtitle, '')
WHERE hero_title IS NULL OR hero_title = '';
CREATE OR REPLACE FUNCTION public.get_section_visibility(p_section_key TEXT)
RETURNS TABLE(is_visible BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT sv.is_visible FROM public.section_visibility sv WHERE sv.section_key = p_section_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_page_header(p_slug TEXT)
RETURNS TABLE(id UUID, title TEXT, subtitle TEXT, background_image TEXT, is_visible BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT ph.id, ph.title, ph.subtitle, ph.background_image, ph.is_visible FROM public.page_headers ph WHERE ph.page_slug = p_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_site_image(p_image_key TEXT)
RETURNS TABLE(image_url TEXT, alt_text TEXT, title TEXT) AS $$
BEGIN
  RETURN QUERY SELECT si.image_url, si.alt_text, si.title FROM public.site_images si WHERE si.image_key = p_image_key LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
