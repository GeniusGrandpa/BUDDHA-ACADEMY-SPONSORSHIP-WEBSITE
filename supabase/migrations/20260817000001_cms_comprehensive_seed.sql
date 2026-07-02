-- ===============================================================
-- CMS Comprehensive Seed Migration
-- Creates missing CMS tables and seeds all CMS content
-- for Buddha Academy Boarding School, Kathmandu, Nepal
-- ===============================================================

-- 1. Create cms_programs table (manages programs page content)
CREATE TABLE IF NOT EXISTS public.cms_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb,
  impact TEXT DEFAULT '',
  funding_goal NUMERIC DEFAULT 0,
  raised_amount NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_programs_slug ON public.cms_programs(slug);
CREATE INDEX IF NOT EXISTS idx_cms_programs_sort ON public.cms_programs(sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_programs_active ON public.cms_programs(is_active);

-- 2. Create cms_impact_stats table (homepage impact statistics)
CREATE TABLE IF NOT EXISTS public.cms_impact_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  prefix TEXT DEFAULT '',
  suffix TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_impact_stats_sort ON public.cms_impact_stats(sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_impact_stats_active ON public.cms_impact_stats(is_active);

-- 3. Enable RLS on new tables
ALTER TABLE public.cms_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_impact_stats ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for cms_programs
DROP POLICY IF EXISTS "cms_programs_select_public" ON public.cms_programs;
CREATE POLICY "cms_programs_select_public"
  ON public.cms_programs FOR SELECT
  USING (is_active = true AND status = 'active');

DROP POLICY IF EXISTS "cms_programs_select_admin" ON public.cms_programs;
CREATE POLICY "cms_programs_select_admin"
  ON public.cms_programs FOR SELECT
  USING (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_programs_insert_admin" ON public.cms_programs;
CREATE POLICY "cms_programs_insert_admin"
  ON public.cms_programs FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_programs_update_admin" ON public.cms_programs;
CREATE POLICY "cms_programs_update_admin"
  ON public.cms_programs FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_programs_delete_admin" ON public.cms_programs;
CREATE POLICY "cms_programs_delete_admin"
  ON public.cms_programs FOR DELETE
  USING (public.get_user_role_level() >= 90);

-- 5. RLS policies for cms_impact_stats
DROP POLICY IF EXISTS "cms_impact_stats_select_public" ON public.cms_impact_stats;
CREATE POLICY "cms_impact_stats_select_public"
  ON public.cms_impact_stats FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "cms_impact_stats_select_admin" ON public.cms_impact_stats;
CREATE POLICY "cms_impact_stats_select_admin"
  ON public.cms_impact_stats FOR SELECT
  USING (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_impact_stats_insert_admin" ON public.cms_impact_stats;
CREATE POLICY "cms_impact_stats_insert_admin"
  ON public.cms_impact_stats FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_impact_stats_update_admin" ON public.cms_impact_stats;
CREATE POLICY "cms_impact_stats_update_admin"
  ON public.cms_impact_stats FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS "cms_impact_stats_delete_admin" ON public.cms_impact_stats;
CREATE POLICY "cms_impact_stats_delete_admin"
  ON public.cms_impact_stats FOR DELETE
  USING (public.get_user_role_level() >= 90);

-- 6. Grant permissions for new tables
GRANT SELECT ON public.cms_programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_programs TO authenticated;
GRANT SELECT ON public.cms_impact_stats TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_impact_stats TO authenticated;

-- ===============================================================
-- SEED DATA SECTION
-- ===============================================================

-- Fix: cms_audit_trigger was incorrectly redefined in migration
-- 20260710000001 to use public.audit_log (singular) which does not
-- exist. The actual table is public.audit_logs (plural).
-- Without this fix, the trigger on site_settings (and other CMS
-- tables) fails on every UPDATE/INSERT/DELETE.
CREATE OR REPLACE FUNCTION public.cms_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
$$;

-- 7. Update site_settings default currency to NPR
UPDATE public.site_settings
SET
  donation_default_currency = 'NPR',
  site_name = COALESCE(site_name, 'Buddha Academy Boarding School'),
  tagline = COALESCE(tagline, 'Empowering Nepal''s Future Through Education'),
  contact_email = COALESCE(contact_email, 'info@buddhaacademy.edu.np'),
  contact_phone = COALESCE(contact_phone, '+977 1 1234567'),
  contact_address = COALESCE(contact_address, 'Buddha Academy, Boudha, Kathmandu, Nepal'),
  seo_default_title = COALESCE(seo_default_title, 'Buddha Academy Boarding School - Sponsor a Child in Nepal'),
  seo_default_description = COALESCE(seo_default_description, 'Support Buddha Academy in Kathmandu, Nepal. Sponsor a child''s education, provide meals, and transform lives through our transparent sponsorship program.'),
  donation_min_amount = COALESCE(donation_min_amount, 100),
  donation_max_amount = COALESCE(donation_max_amount, 1000000),
  footer_description = COALESCE(footer_description, 'Buddha Academy Boarding School is a nonprofit institution in Kathmandu, Nepal, providing free quality education, meals, and accommodation to underprivileged children since 1977.'),
  footer_copyright = COALESCE(footer_copyright, 'All rights reserved.'),
  footer_nonprofit_text = COALESCE(footer_nonprofit_text, 'Buddha Academy is a registered nonprofit organization.')
WHERE id = (SELECT id FROM public.site_settings LIMIT 1);

-- Insert site_settings if not exists
INSERT INTO public.site_settings (
  site_name, tagline, contact_email, contact_phone, contact_address,
  donation_default_currency, donation_min_amount, donation_max_amount,
  footer_description, footer_copyright, footer_nonprofit_text,
  seo_default_title, seo_default_description
)
SELECT
  'Buddha Academy Boarding School',
  'Empowering Nepal''s Future Through Education',
  'info@buddhaacademy.edu.np',
  '+977 1 1234567',
  'Buddha Academy, Boudha, Kathmandu, Nepal',
  'NPR', 100, 1000000,
  'Buddha Academy Boarding School is a nonprofit institution in Kathmandu, Nepal, providing free quality education, meals, and accommodation to underprivileged children since 1977.',
  'All rights reserved.',
  'Buddha Academy is a registered nonprofit organization.',
  'Buddha Academy Boarding School - Sponsor a Child in Nepal',
  'Support Buddha Academy in Kathmandu, Nepal. Sponsor a child''s education, provide meals, and transform lives through our transparent sponsorship program.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings LIMIT 1);

-- 8. Seed hero_content
INSERT INTO public.hero_content (
  title, highlight, description, cta_primary_text, cta_primary_link,
  cta_secondary_text, cta_secondary_link, statistics, layout, is_visible,
  animation_enabled, display_order
)
VALUES (
  'Empowering Nepal''s Future',
  'One Child at a Time',
  'Buddha Academy Boarding School provides free quality education, nutritious meals, and safe accommodation to underprivileged children in Kathmandu, Nepal. Your sponsorship transforms lives.',
  'Sponsor a Child',
  '/students',
  'Make a Donation',
  '/donate',
  '[{"value": "49+", "label": "Years of Service"}, {"value": "2000+", "label": "Children Educated"}, {"value": "100%", "label": "Free Education"}, {"value": "250+", "label": "Active Sponsorships"}]'::jsonb,
  'left', true, true, 1
)
ON CONFLICT DO NOTHING;

-- 9. Seed donation_content
INSERT INTO public.donation_content (
  hero_title, hero_subtitle, currency_label,
  impact_cards, process_steps, is_published
)
VALUES (
  'Make a Donation',
  'Every contribution creates opportunity for a child in Nepal. Your support provides education, meals, and hope.',
  'All amounts in Nepalese Rupees (NPR)',
  '[{"amount": 1000, "label": "School Supplies", "description": "Provides books, stationery and uniforms for one student for a term", "icon": "BookOpen"}, {"amount": 5000, "label": "Monthly Education Support", "description": "Covers a child''s education, meals and basic needs for one month", "icon": "GraduationCap"}, {"amount": 10000, "label": "Full Student Support", "description": "Comprehensive monthly support including education, meals and healthcare", "icon": "Heart"}, {"amount": 25000, "label": "Community Impact", "description": "Supports multiple students and community programs across the school", "icon": "Users"}]'::jsonb,
  '[{"title": "Choose Your Impact", "desc": "Select an amount or enter a custom donation in NPR"}, {"title": "Select Frequency", "desc": "Choose one-time or recurring monthly support"}, {"title": "Secure Payment", "desc": "Pay via Khalti, eSewa, or bank transfer"}, {"title": "Track Your Impact", "desc": "Receive updates and see exactly how your donation helps"}]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- 10. Seed sponsorship_content
INSERT INTO public.sponsorship_content (
  hero_title, hero_subtitle, section_title, section_description,
  steps, benefits, cta_title, cta_description,
  cta_button_text, cta_button_link, is_published
)
VALUES (
  'Sponsor a Child''s Education',
  'For just NPR 5,000 per month, you can transform a child''s life through the power of education at Buddha Academy in Kathmandu.',
  'How Sponsorship Works',
  'Our sponsorship program connects you directly with a child at Buddha Academy, creating a personal bond while funding their complete education, meals, and care.',
  '[{"title": "Browse Profiles", "desc": "Review children waiting for sponsors and learn about their dreams"}, {"title": "Choose a Child", "desc": "Select a student whose story resonates with you"}, {"title": "Make Your Pledge", "desc": "Complete the secure sponsorship form with your details"}, {"title": "We Connect", "desc": "We link you with your sponsored child and share their full profile"}, {"title": "Receive Updates", "desc": "Get regular progress reports, photos, and letters from your child"}, {"title": "Track Impact", "desc": "See exactly how your sponsorship is changing their life"}]'::jsonb,
  '[{"text": "Direct, life-changing impact on a child''s education and future"}, {"text": "Regular updates with photos, letters, and progress reports from your sponsored child"}, {"text": "Opportunity to build a meaningful cross-cultural connection"}, {"text": "Transparent reporting on how your sponsorship funds are used"}, {"text": "100% of your sponsorship goes directly to student support programs"}]'::jsonb,
  'Ready to Change a Life?',
  'Choose a child to sponsor and begin your journey of impact today. Your monthly contribution provides education, meals, healthcare, and hope.',
  'Sponsor a Child',
  '/students',
  true
)
ON CONFLICT DO NOTHING;

-- 11. Seed footer_content
INSERT INTO public.footer_content (
  description, copyright_text, nonprofit_text,
  quick_links, social_links, contact_info, is_published
)
VALUES (
  'Buddha Academy Boarding School is a nonprofit institution in Kathmandu, Nepal, providing free quality education, meals, and accommodation to underprivileged children since 1977.',
  'Buddha Academy Boarding School. All rights reserved.',
  'Buddha Academy is a registered nonprofit organization dedicated to child education and welfare in Nepal.',
  '[{"label": "Sponsor a Child", "url": "/sponsor"}, {"label": "Make a Donation", "url": "/donate"}, {"label": "About Us", "url": "/about"}, {"label": "Contact Us", "url": "/contact"}, {"label": "Privacy Policy", "url": "/privacy"}, {"label": "Terms of Service", "url": "/terms"}]'::jsonb,
  '[{"platform": "Facebook", "url": "#"}, {"platform": "Instagram", "url": "#"}, {"platform": "Twitter", "url": "#"}]'::jsonb,
  '{"address": "Buddha Academy, Boudha, Kathmandu, Nepal", "phone": "+977 1 1234567", "email": "info@buddhaacademy.edu.np", "hours": "Monday – Friday: 9:00 AM – 5:00 PM (NPT)"}'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- 12. Seed transparency_content
INSERT INTO public.transparency_content (
  hero_title, hero_subtitle,
  allocation_title, allocation_description,
  allocation_data,
  verification_title, verification_description,
  verification_steps,
  impact_report_title, impact_report_items,
  receipt_policy_title, receipt_policy_text,
  donor_privacy_title, donor_privacy_text,
  is_published
)
VALUES (
  'Transparency & Accountability',
  'Built on Trust',
  'How Your Donations Are Used',
  'Every rupee you donate is carefully allocated to programs that directly benefit our students. We maintain complete financial transparency.',
  '[{"name": "Student Education & Welfare", "value": 70}, {"name": "Teachers & Staff", "value": 20}, {"name": "Facilities & Operations", "value": 10}]'::jsonb,
  'Student Verification Process',
  'Every sponsored student is carefully vetted to ensure support reaches those who need it most.',
  '["Each student is personally interviewed by our admissions team", "Family background verification and financial need assessment", "Academic records and previous school performance review", "Regular follow-up visits and progress monitoring", "Annual re-evaluation of sponsorship eligibility and needs"]'::jsonb,
  'Annual Impact Report',
  '["Number of students enrolled and graduated", "Academic performance statistics", "Financial statements breakdown", "Success stories and testimonials", "Future plans and growth goals"]'::jsonb,
  'Receipt Policy',
  'All donors receive official receipt confirmation via email immediately after donation. Annual consolidated receipts are provided for tax purposes. Physical receipts available on request.',
  'Donor Privacy',
  'We never share donor information with third parties. Your personal data is protected and used only for communication regarding your donations and impact updates.',
  true
)
ON CONFLICT DO NOTHING;

-- 13. Seed FAQs
INSERT INTO public.faqs (question, answer, category, sort_order, is_published) VALUES
(
  'How does student sponsorship work at Buddha Academy?',
  'When you sponsor a child at Buddha Academy, your monthly contribution directly supports their education, daily meals, healthcare, and accommodation. You will receive regular updates including progress reports, photos, and letters from your sponsored child. You can browse student profiles, choose a child to sponsor, and begin changing a life today.',
  'sponsorship', 1, true
),
(
  'How are donations used at Buddha Academy?',
  '100% of donations go directly to our programs: 70% supports children''s education, meals, healthcare, and welfare; 20% supports teachers and staff salaries; and 10% covers facilities and operational costs. We maintain complete financial transparency and publish regular impact reports.',
  'donations', 2, true
),
(
  'Can I track the impact of my donation or sponsorship?',
  'Yes. Donors and sponsors receive regular updates on how their contributions are making a difference. Sponsors get personalized progress reports, photos, and letters from their sponsored child. All donors can view impact metrics and financial reports on our transparency page.',
  'impact', 3, true
),
(
  'Is Buddha Academy transparent about its finances?',
  'Absolutely. We are committed to complete transparency. We publish detailed financial breakdowns showing exactly how donations are allocated, conduct regular audits, and provide annual impact reports. Visit our Transparency page to see how every rupee is used.',
  'transparency', 4, true
),
(
  'How can I contact Buddha Academy?',
  'You can reach us by email at info@buddhaacademy.edu.np, by phone at +977 1 1234567, or visit our campus in Boudha, Kathmandu. Our team is available Monday through Friday, 9:00 AM to 5:00 PM (NPT). You can also use the contact form on our website.',
  'contact', 5, true
),
(
  'Can I set up recurring monthly support?',
  'Yes. We offer both one-time donations and recurring monthly sponsorship options. Monthly sponsorship provides sustained support that helps us plan and budget for each child''s education, meals, and care throughout the year.',
  'donations', 6, true
),
(
  'What does my sponsorship provide for a child?',
  'Your monthly sponsorship provides a complete support package including: quality education with qualified teachers, three nutritious meals daily, regular healthcare check-ups, school uniforms and supplies, safe accommodation, and extracurricular activities that nurture the whole child.',
  'sponsorship', 7, true
),
(
  'Is my donation tax-deductible?',
  'Yes. All donations to Buddha Academy are tax-deductible. You will receive an official receipt via email immediately after your donation, and annual consolidated receipts are provided for tax purposes. Physical receipts are available on request.',
  'donations', 8, true
)
ON CONFLICT DO NOTHING;

-- 14. Seed testimonials
INSERT INTO public.testimonials (author_name, author_role, content, is_published, is_featured, sort_order) VALUES
(
  'Rajesh Sharma',
  'Sponsor from Australia',
  'Sponsoring a child at Buddha Academy has been one of the most rewarding experiences of my life. Receiving letters and photos showing my sponsored child''s progress brings so much joy. The transparency and regular communication give me complete confidence that my support is making a real difference.',
  true, true, 1
),
(
  'Priya Patel',
  'Monthly Donor',
  'I love that I can see exactly where my donations go. The impact reports are detailed and the team is always responsive to questions. Knowing that my contribution provides meals and education to children who would otherwise go without is incredibly fulfilling.',
  true, true, 2
),
(
  'Michael Chen',
  'Volunteer Teacher',
  'Volunteering at Buddha Academy was a life-changing experience. The dedication of the staff and the enthusiasm of the students is inspiring. Every child here has big dreams, and the school gives them the tools to achieve those dreams.',
  true, true, 3
)
ON CONFLICT DO NOTHING;

-- Fix: extend legal_pages type check to include transparency_statement
ALTER TABLE public.legal_pages DROP CONSTRAINT IF EXISTS legal_pages_type_check;
ALTER TABLE public.legal_pages ADD CONSTRAINT legal_pages_type_check
  CHECK (type IN ('privacy_policy', 'terms_conditions', 'cookie_policy', 'donation_policy', 'transparency_statement'));

-- 15. Seed legal pages
INSERT INTO public.legal_pages (type, title, slug, status, effective_date) VALUES
('privacy_policy', 'Privacy Policy', 'privacy', 'published', now()),
('terms_conditions', 'Terms and Conditions', 'terms', 'published', now()),
('donation_policy', 'Donation Policy', 'donation-policy', 'published', now()),
('transparency_statement', 'Transparency Statement', 'transparency-statement', 'published', now())
ON CONFLICT (slug) DO UPDATE SET status = 'published', title = EXCLUDED.title;

-- Seed legal page sections
DO $$
DECLARE
  v_privacy_id UUID;
  v_terms_id UUID;
  v_donation_policy_id UUID;
  v_transparency_stmt_id UUID;
BEGIN
  SELECT id INTO v_privacy_id FROM public.legal_pages WHERE slug = 'privacy' LIMIT 1;
  SELECT id INTO v_terms_id FROM public.legal_pages WHERE slug = 'terms' LIMIT 1;
  SELECT id INTO v_donation_policy_id FROM public.legal_pages WHERE slug = 'donation-policy' LIMIT 1;
  SELECT id INTO v_transparency_stmt_id FROM public.legal_pages WHERE slug = 'transparency-statement' LIMIT 1;

  -- Privacy Policy sections
  IF v_privacy_id IS NOT NULL THEN
    INSERT INTO public.legal_page_sections (legal_page_id, heading, content, sort_order, is_visible) VALUES
    (v_privacy_id, 'Information We Collect',
     'We collect information you provide directly when you create an account, make a donation, sponsor a child, or contact us. This may include your name, email address, phone number, mailing address, and payment information. We also automatically collect certain technical information when you visit our website, including your IP address, browser type, and pages viewed.',
     1, true),
    (v_privacy_id, 'How We Use Your Information',
     'We use your information to process donations and sponsorships, communicate with you about your impact, send you updates and progress reports, improve our website and services, and comply with legal obligations. We do not sell, trade, or share your personal information with third parties except as necessary to process payments or as required by law.',
     2, true),
    (v_privacy_id, 'Data Security',
     'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using industry-standard SSL technology.',
     3, true),
    (v_privacy_id, 'Your Rights',
     'You have the right to access, correct, or delete your personal information at any time. You can update your communication preferences and opt out of marketing emails. To exercise these rights, please contact us at info@buddhaacademy.edu.np.',
     4, true),
    (v_privacy_id, 'Contact Us',
     'If you have any questions about this Privacy Policy, please contact us at Buddha Academy, Boudha, Kathmandu, Nepal, or email info@buddhaacademy.edu.np.',
     5, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Terms and Conditions sections
  IF v_terms_id IS NOT NULL THEN
    INSERT INTO public.legal_page_sections (legal_page_id, heading, content, sort_order, is_visible) VALUES
    (v_terms_id, 'Acceptance of Terms',
     'By accessing and using the Buddha Academy website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.',
     1, true),
    (v_terms_id, 'Donations and Sponsorships',
     'All donations and sponsorship contributions are voluntary and non-refundable. Buddha Academy reserves the right to allocate funds where they are most needed, unless explicitly designated for a specific program or student. Sponsorship contributions are used to support the sponsored child''s education, meals, healthcare, and accommodation.',
     2, true),
    (v_terms_id, 'Use of Content',
     'All content on this website, including text, images, and media, is the property of Buddha Academy unless otherwise noted. You may not reproduce, distribute, or modify our content without prior written permission.',
     3, true),
    (v_terms_id, 'Limitation of Liability',
     'Buddha Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.',
     4, true),
    (v_terms_id, 'Changes to Terms',
     'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the new terms.',
     5, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Donation Policy sections
  IF v_donation_policy_id IS NOT NULL THEN
    INSERT INTO public.legal_page_sections (legal_page_id, heading, content, sort_order, is_visible) VALUES
    (v_donation_policy_id, 'Our Commitment',
     'Buddha Academy is committed to using every donation effectively and transparently to support our mission of providing free education to underprivileged children in Nepal. We respect the trust our donors place in us and handle every contribution with care and accountability.',
     1, true),
    (v_donation_policy_id, 'Use of Donations',
     'Donations are used to fund our educational programs, meals, healthcare, accommodation, and operational expenses. Unless specifically designated by the donor, all donations are allocated where they are most needed to support our students and programs.',
     2, true),
    (v_donation_policy_id, 'Donor Privacy',
     'We respect the privacy of our donors. Personal information is collected and used solely for processing donations, providing receipts, and communicating about impact. We do not share, sell, or trade donor information with any third party.',
     3, true),
    (v_donation_policy_id, 'Receipts and Tax Deductibility',
     'All donors receive an official receipt via email immediately after donation. Annual consolidated receipts are provided for tax purposes. Donations to Buddha Academy are tax-deductible as allowed by applicable law.',
     4, true),
    (v_donation_policy_id, 'Refund Policy',
     'Donations to Buddha Academy are non-refundable. If you believe an error has been made, please contact us at info@buddhaacademy.edu.np and we will address your concern promptly.',
     5, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Transparency Statement sections
  IF v_transparency_stmt_id IS NOT NULL THEN
    INSERT INTO public.legal_page_sections (legal_page_id, heading, content, sort_order, is_visible) VALUES
    (v_transparency_stmt_id, 'Our Transparency Commitment',
     'Buddha Academy believes that complete transparency is essential to building trust with our supporters. We are committed to providing clear, accurate, and timely information about our finances, programs, and impact.',
     1, true),
    (v_transparency_stmt_id, 'Financial Transparency',
     'We publish detailed financial information including how donations are allocated across programs. Our allocation breakdown shows exactly what percentage of funds goes to student education and welfare, staff and teachers, and facilities and operations.',
     2, true),
    (v_transparency_stmt_id, 'Impact Reporting',
     'We regularly publish impact reports showing the number of students supported, academic performance metrics, success stories, and program outcomes. Our donors and sponsors receive personalized updates on the specific children they support.',
     3, true),
    (v_transparency_stmt_id, 'Governance and Oversight',
     'Buddha Academy is governed by a dedicated board and operates under the laws and regulations of Nepal. We maintain regular audits and review processes to ensure funds are used effectively and our programs achieve their intended impact.',
     4, true),
    (v_transparency_stmt_id, 'Questions and Feedback',
     'We welcome questions about our operations and finances. Please contact us at info@buddhaacademy.edu.np for any transparency-related inquiries. We are happy to provide additional information about our programs and impact.',
     5, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 16. Seed cms_programs
INSERT INTO public.cms_programs (title, slug, description, full_description, category, status, sort_order, is_active, features, impact, funding_goal) VALUES
(
  'Student Sponsorship',
  'student-sponsorship',
  'Sponsor a child''s complete education at Buddha Academy. Your monthly contribution covers tuition, meals, healthcare, accommodation, and school supplies.',
  'Our flagship program connects compassionate sponsors with children who need support. Each sponsorship provides a child with free quality education, three nutritious meals daily, regular healthcare check-ups, safe boarding accommodation, school uniforms and supplies, and extracurricular activities. Sponsors receive regular updates, photos, and letters from their sponsored child, creating a meaningful cross-cultural connection.',
  'education', 'active', 1, true,
  '[{"title": "Monthly Progress Updates", "description": "Receive photos, grades, and letters from your sponsored child"}, {"title": "Direct Impact", "description": "100% of your sponsorship supports your child''s education and care"}, {"title": "Personal Connection", "description": "Build a meaningful relationship through letters and updates"}, {"title": "Full Support Package", "description": "Education, meals, healthcare and accommodation included"}]'::jsonb,
  'Each sponsorship provides a complete education and care package for one child, giving them the opportunity to break the cycle of poverty.',
  5000
),
(
  'School Supplies Support',
  'school-supplies',
  'Provide essential learning materials including textbooks, stationery, uniforms, and school bags to students at Buddha Academy.',
  'Many children come to Buddha Academy with nothing but the clothes they wear. Our School Supplies Support program ensures every student has the essential tools they need to learn and participate fully in their education. Your contribution provides textbooks, notebooks, stationery, uniforms, shoes, school bags, and other essential learning materials. This program removes the financial barrier that prevents many children from attending school with dignity.',
  'education', 'active', 2, true,
  '[{"title": "Complete School Kit", "description": "Textbooks, notebooks, stationery, and learning materials"}, {"title": "School Uniforms", "description": "Two sets of uniforms and proper footwear"}, {"title": "School Bag", "description": "Durable bag with essential supplies"}, {"title": "Term-Based Distribution", "description": "Supplies distributed at start of each academic term"}]'::jsonb,
  'Provides complete learning materials for a student for an entire academic year.',
  1000
),
(
  'Meal and Nutrition Support',
  'meal-nutrition',
  'Provide nutritious daily meals to children at Buddha Academy. Proper nutrition is essential for learning and healthy development.',
  'For many of our students, the meals they receive at Buddha Academy are their only reliable source of nutrition each day. Our Meal and Nutrition Support program ensures every child receives three balanced meals daily, including breakfast, lunch, and dinner. We focus on providing nutritious, culturally appropriate meals that support healthy growth and cognitive development. Proper nutrition is fundamental to a child''s ability to learn and thrive.',
  'nutrition', 'active', 3, true,
  '[{"title": "Three Daily Meals", "description": "Nutritious breakfast, lunch, and dinner every day"}, {"title": "Balanced Nutrition", "description": "Meals designed for healthy growth and development"}, {"title": "Clean Water", "description": "Access to clean drinking water throughout the day"}, {"title": "Health Monitoring", "description": "Regular health and growth check-ups"}]'::jsonb,
  'Provides nutritious daily meals for students, supporting their health and ability to learn.',
  2000
),
(
  'Classroom and Learning Materials',
  'classroom-materials',
  'Support our classrooms with furniture, educational materials, science equipment, and technology resources.',
  'A proper learning environment is essential for quality education. This program funds classroom furniture, educational posters and charts, science laboratory equipment, computers and tablets, library books, sports equipment, and teaching aids. By supporting our classrooms, you help create an engaging and effective learning environment where students can develop the skills and knowledge they need to build a better future.',
  'education', 'active', 4, true,
  '[{"title": "Classroom Furniture", "description": "Desks, chairs, and storage for comfortable learning"}, {"title": "Science Equipment", "description": "Lab materials for hands-on science education"}, {"title": "Technology Resources", "description": "Computers and tablets for digital learning"}, {"title": "Library Books", "description": "Age-appropriate books to foster reading culture"}]'::jsonb,
  'Enhances the learning environment for all students at Buddha Academy.',
  3000
),
(
  'Community Outreach',
  'community-outreach',
  'Extend Buddha Academy''s impact beyond the campus through community programs, parent engagement, and local partnerships.',
  'Buddha Academy believes in strengthening the entire community around our students. Our Community Outreach program includes parent education workshops, community health camps, awareness programs on child rights and education, environmental initiatives, and partnerships with local organizations. By engaging families and the broader community, we create a supportive ecosystem that helps children succeed both in and out of school.',
  'community', 'active', 5, true,
  '[{"title": "Parent Workshops", "description": "Education and empowerment for parents and guardians"}, {"title": "Health Camps", "description": "Free health check-ups for the local community"}, {"title": "Awareness Programs", "description": "Child rights and education awareness initiatives"}, {"title": "Community Events", "description": "Cultural and educational events for the community"}]'::jsonb,
  'Extends impact beyond the classroom to strengthen the entire community.',
  1500
),
(
  'Emergency Student Support',
  'emergency-support',
  'Provide urgent assistance for students facing medical emergencies, family crises, or other unexpected challenges.',
  'Life is unpredictable, especially for families living in poverty. When our students face medical emergencies, family crises, natural disasters, or other unexpected challenges, the Emergency Student Support program provides immediate assistance. This fund helps cover emergency medical treatment, temporary accommodation, family support, and other urgent needs. Your contribution ensures that no child''s education is derailed by circumstances beyond their control.',
  'support', 'active', 6, true,
  '[{"title": "Medical Emergencies", "description": "Urgent medical treatment and hospital care"}, {"title": "Family Crisis Support", "description": "Assistance during family emergencies and hardships"}, {"title": "Disaster Relief", "description": "Support during natural disasters and crises"}, {"title": "Rapid Response", "description": "Immediate assistance when children need it most"}]'::jsonb,
  'Provides critical emergency support to students facing unexpected crises.',
  500
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  is_active = true;

-- 17. Seed cms_impact_stats
INSERT INTO public.cms_impact_stats (label, value, prefix, suffix, icon, category, sort_order, is_active) VALUES
('Years of Service', '49', '', '+', 'Clock', 'general', 1, true),
('Children Educated', '2000', '', '+', 'Users', 'general', 2, true),
('Active Sponsorships', '250', '', '+', 'Heart', 'general', 3, true),
('Free Education', '100', '', '%', 'CheckCircle', 'general', 4, true)
ON CONFLICT DO NOTHING;

-- 18. Seed navigation items (update existing, add missing)
INSERT INTO public.navigation_items (location, label, url, route, sort_order, is_visible) VALUES
  ('header', 'Sponsor', NULL, '/sponsor', 3, true),
  ('header', 'Donate', NULL, '/donate', 4, true),
  ('header', 'Programs', NULL, '/programs', 7, true),
  ('footer_get_involved', 'Donation Policy', NULL, '/donation-policy', 4, true),
  ('footer_get_involved', 'Transparency', NULL, '/transparency', 5, true),
  ('footer_information', 'Donation Policy', NULL, '/donation-policy', 6, true),
  ('footer_information', 'Transparency Statement', NULL, '/transparency-statement', 7, true)
ON CONFLICT DO NOTHING;

-- 19. Seed SEO content for all public pages
INSERT INTO public.seo_content (page_slug, meta_title, meta_description, is_published) VALUES
  ('home', 'Buddha Academy Boarding School - Sponsor a Child in Kathmandu, Nepal', 'Buddha Academy provides free education, meals, and housing to underprivileged children in Kathmandu, Nepal. Sponsor a child and transform a life today.', true),
  ('about', 'About Us - Buddha Academy Boarding School, Kathmandu', 'Learn about Buddha Academy''s mission to provide free quality education to underprivileged children in Nepal since 1977.', true),
  ('sponsor', 'Sponsor a Child - Buddha Academy Boarding School', 'Sponsor a child at Buddha Academy in Kathmandu. Your monthly support provides education, meals, and hope.', true),
  ('donate', 'Donate - Support Buddha Academy Boarding School', 'Donate to support free education for underprivileged children in Nepal. Every contribution makes a difference.', true),
  ('students', 'Meet Our Students - Buddha Academy Boarding School', 'Browse profiles of children at Buddha Academy waiting for sponsorship. Change a life today.', true),
  ('programs', 'Our Programs - Buddha Academy Boarding School', 'Explore our programs including student sponsorship, school supplies, meal support, and community outreach in Kathmandu.', true),
  ('gallery', 'Gallery - Buddha Academy Boarding School', 'Photos and media showcasing life at Buddha Academy Boarding School in Kathmandu, Nepal.', true),
  ('news', 'News - Buddha Academy Boarding School', 'Latest news and updates from Buddha Academy Boarding School in Kathmandu, Nepal.', true),
  ('contact', 'Contact Us - Buddha Academy Boarding School', 'Get in touch with Buddha Academy Boarding School in Kathmandu, Nepal. We would love to hear from you.', true),
  ('faq', 'FAQ - Buddha Academy Boarding School', 'Frequently asked questions about sponsoring a child, donating, and supporting Buddha Academy.', true),
  ('volunteer', 'Volunteer - Buddha Academy Boarding School', 'Volunteer with Buddha Academy in Kathmandu, Nepal and make a direct impact on children''s lives.', true),
  ('transparency', 'Transparency - Buddha Academy Boarding School', 'Our commitment to financial transparency and accountability at Buddha Academy Boarding School.', true),
  ('privacy', 'Privacy Policy - Buddha Academy Boarding School', 'Privacy policy for Buddha Academy Boarding School website and services.', true),
  ('terms', 'Terms and Conditions - Buddha Academy Boarding School', 'Terms and conditions for using Buddha Academy Boarding School website and services.', true),
  ('donation-policy', 'Donation Policy - Buddha Academy Boarding School', 'Donation policy for Buddha Academy Boarding School. Learn how your contributions are used.', true),
  ('transparency-statement', 'Transparency Statement - Buddha Academy Boarding School', 'Transparency statement outlining Buddha Academy''s commitment to open and honest reporting.', true)
ON CONFLICT (page_slug) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = true;

-- 20. Seed page_headers for all pages
INSERT INTO public.page_headers (page_slug, title, subtitle, is_visible) VALUES
  ('sponsor', 'Sponsor a Child', 'Change a Life Through Education', true),
  ('programs', 'Our Programs', 'Discover How We Support Children and Communities', true),
  ('donate', 'Make a Donation', 'Every Contribution Creates Opportunity', true),
  ('transparency', 'Transparency & Accountability', 'Built on Trust', true),
  ('faq', 'Frequently Asked Questions', 'Find Answers to Common Questions', true),
  ('volunteer', 'Volunteer With Us', 'Make a Direct Impact', true),
  ('privacy', 'Privacy Policy', 'How We Protect Your Information', true),
  ('terms', 'Terms and Conditions', 'Guidelines for Using Our Services', true),
  ('donation-policy', 'Donation Policy', 'Our Commitment to Donor Trust', true),
  ('transparency-statement', 'Transparency Statement', 'Our Promise of Openness', true)
ON CONFLICT (page_slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  is_visible = true;

-- 21. Seed section_visibility
INSERT INTO public.section_visibility (section_key, section_name, is_visible, sort_order) VALUES
  ('hero', 'Hero Section', true, 1),
  ('impact_stats', 'Impact Statistics', true, 2),
  ('about_preview', 'About Preview', true, 3),
  ('featured_programs', 'Featured Programs', true, 4),
  ('sponsorship_steps', 'Sponsorship Steps', true, 5),
  ('testimonials', 'Testimonials', true, 6),
  ('transparency_highlight', 'Transparency Highlight', true, 7),
  ('cta_banner', 'Call to Action Banner', true, 8)
ON CONFLICT (section_key) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  is_visible = true;

-- 22. Seed homepage_sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, content, is_active, sort_order) VALUES
(
  'hero',
  'Empowering Nepal''s Future',
  'One Child at a Time',
  jsonb_build_object(
    'description', 'Buddha Academy Boarding School provides free quality education, nutritious meals, and safe accommodation to underprivileged children in Kathmandu, Nepal.',
    'cta_primary', jsonb_build_object('text', 'Sponsor a Child', 'link', '/sponsor'),
    'cta_secondary', jsonb_build_object('text', 'Donate Now', 'link', '/donate')
  ),
  true, 1
),
(
  'impact_stats',
  'Our Impact in Numbers',
  'Transforming Lives Through Education',
  jsonb_build_object(
    'stats', jsonb_build_array(
      jsonb_build_object('value', '49+', 'label', 'Years of Service'),
      jsonb_build_object('value', '2000+', 'label', 'Children Educated'),
      jsonb_build_object('value', '250+', 'label', 'Active Sponsorships'),
      jsonb_build_object('value', '100%', 'label', 'Free Education')
    )
  ),
  true, 2
),
(
  'about_preview',
  'About Buddha Academy',
  'Providing Educational Hope Since 1977',
  jsonb_build_object(
    'description', 'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free quality education to underprivileged children. What began with 12 students has grown into a thriving institution that has educated thousands of children.',
    'milestones', jsonb_build_array(
      jsonb_build_object('year', '1977', 'event', 'Founded with 12 students'),
      jsonb_build_object('year', '1995', 'event', 'Permanent campus established'),
      jsonb_build_object('year', '2015', 'event', 'International sponsorships began'),
      jsonb_build_object('year', '2026', 'event', 'Educating hundreds annually')
    )
  ),
  true, 3
),
(
  'sponsorship_steps',
  'How Sponsorship Works',
  'Your Journey to Changing a Life',
  jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('title', 'Browse Profiles', 'desc', 'Review children waiting for sponsors'),
      jsonb_build_object('title', 'Choose a Child', 'desc', 'Select a student to sponsor'),
      jsonb_build_object('title', 'Make Your Pledge', 'desc', 'Complete sponsorship form securely'),
      jsonb_build_object('title', 'Receive Updates', 'desc', 'Get progress reports and photos')
    )
  ),
  true, 4
),
(
  'transparency_highlight',
  'Transparent & Accountable',
  'Built on Trust',
  jsonb_build_object(
    'description', 'We maintain complete transparency in how every donation is used. Our allocation model ensures maximum impact for every child.',
    'allocation', jsonb_build_array(
      jsonb_build_object('name', 'Student Education & Welfare', 'percentage', 70),
      jsonb_build_object('name', 'Teachers & Staff', 'percentage', 20),
      jsonb_build_object('name', 'Facilities & Operations', 'percentage', 10)
    )
  ),
  true, 5
)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  is_active = true;

-- 23. Seed cms_strings for key website labels
INSERT INTO public.cms_strings (key, value, category, is_published) VALUES
  ('donate_hero_title', 'Make a Donation', 'donate', true),
  ('donate_hero_description', 'Your support provides education, meals and hope to children in Nepal.', 'donate', true),
  ('donate_currency_npr', 'All amounts in Nepalese Rupees (NPR)', 'donate', true),
  ('sponsor_hero_title', 'Sponsor a Child''s Education', 'sponsor', true),
  ('sponsor_hero_subtitle', 'For just NPR 5,000 per month, you can transform a child''s life.', 'sponsor', true),
  ('programs_title', 'Our Programs', 'programs', true),
  ('programs_subtitle', 'Discover how we support children and communities in Nepal', 'programs', true),
  ('impact_title', 'Our Impact', 'impact', true),
  ('impact_subtitle', 'See the difference your support makes', 'impact', true),
  ('footer_tagline', 'Providing free education to underprivileged children in Nepal since 1977.', 'footer', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  category = EXCLUDED.category,
  is_published = true;

-- 24. Add page to website_pages for programs page
INSERT INTO public.website_pages (slug, title, status, meta_title, meta_description)
VALUES ('programs', 'Our Programs', 'published', 'Our Programs - Buddha Academy Boarding School', 'Explore our programs including student sponsorship, school supplies, meal support, and community outreach in Kathmandu.')
ON CONFLICT (slug) DO UPDATE SET
  status = 'published',
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- 25. Seed website_sections for homepage if not already populated
DO $$
DECLARE
  v_home_id UUID;
BEGIN
  SELECT id INTO v_home_id FROM public.website_pages WHERE slug = 'home' LIMIT 1;

  IF v_home_id IS NOT NULL THEN
    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
    VALUES (
      v_home_id, 'hero', 'hero',
      'Empowering Nepal''s Future',
      'One Child at a Time',
      'Buddha Academy Boarding School provides free quality education, nutritious meals, and safe accommodation to underprivileged children in Kathmandu, Nepal.',
      jsonb_build_object(
        'cta_primary', jsonb_build_object('text', 'Sponsor a Child', 'link', '/sponsor'),
        'cta_secondary', jsonb_build_object('text', 'Donate Now', 'link', '/donate'),
        'statistics', jsonb_build_array(
          jsonb_build_object('value', '49+', 'label', 'Years of Service'),
          jsonb_build_object('value', '2000+', 'label', 'Children Educated'),
          jsonb_build_object('value', '250+', 'label', 'Active Sponsorships'),
          jsonb_build_object('value', '100%', 'label', 'Free Education')
        )
      ),
      jsonb_build_object('overlay_opacity', 0.5, 'layout', 'left'),
      1, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      content = EXCLUDED.content,
      is_visible = true;

    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
    VALUES (
      v_home_id, 'about_preview', 'about_preview',
      'About Buddha Academy',
      'Providing Educational Hope Since 1977',
      'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free quality education to underprivileged children.',
      jsonb_build_object(
        'milestones', jsonb_build_array(
          jsonb_build_object('year', '1977', 'event', 'Founded with 12 students'),
          jsonb_build_object('year', '1995', 'event', 'Permanent campus established'),
          jsonb_build_object('year', '2015', 'event', 'International sponsorships began'),
          jsonb_build_object('year', '2026', 'event', 'Educating hundreds annually')
        )
      ),
      2, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      content = EXCLUDED.content,
      is_visible = true;

    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
    VALUES (
      v_home_id, 'impact_stats', 'stats',
      'Our Impact in Numbers',
      'Transforming lives through education since 1977.',
      jsonb_build_object('statistics', jsonb_build_array(
        jsonb_build_object('value', '49+', 'label', 'Years of Service'),
        jsonb_build_object('value', '2000+', 'label', 'Children Educated'),
        jsonb_build_object('value', '250+', 'label', 'Active Sponsorships'),
        jsonb_build_object('value', '100%', 'label', 'Free Education')
      )),
      3, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      content = EXCLUDED.content,
      is_visible = true;

    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
    VALUES (
      v_home_id, 'sponsorship_steps', 'steps',
      'How Sponsorship Works',
      'Your journey to changing a child''s life starts here.',
      jsonb_build_object('steps', jsonb_build_array(
        jsonb_build_object('title', 'Browse Profiles', 'desc', 'Review children waiting for sponsors'),
        jsonb_build_object('title', 'Choose a Child', 'desc', 'Select a student to sponsor'),
        jsonb_build_object('title', 'Make Your Pledge', 'desc', 'Complete the secure sponsorship form'),
        jsonb_build_object('title', 'Receive Updates', 'desc', 'Get regular progress reports and photos')
      )),
      4, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      content = EXCLUDED.content,
      is_visible = true;
  END IF;
END $$;

-- 26. Seed website_section for programs page
DO $$
DECLARE
  v_programs_id UUID;
BEGIN
  SELECT id INTO v_programs_id FROM public.website_pages WHERE slug = 'programs' LIMIT 1;

  IF v_programs_id IS NOT NULL THEN
    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, subtitle, description, content, sort_order, is_visible)
    VALUES (
      v_programs_id, 'page_header', 'page_header',
      'Our Programs',
      'Discover How We Support Children and Communities',
      'Buddha Academy runs comprehensive programs designed to provide complete support for underprivileged children in Kathmandu, Nepal.',
      '{}',
      1, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      is_visible = true;

    INSERT INTO public.website_sections
      (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
    VALUES (
      v_programs_id, 'programs_list', 'programs_list',
      'Our Programs',
      'Explore the programs that make Buddha Academy a beacon of hope for children in Nepal.',
      '{}',
      2, true
    )
    ON CONFLICT (page_id, section_key) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      is_visible = true;
  END IF;
END $$;

-- 27. Seed donation-policy and transparency-statement pages in website_pages
INSERT INTO public.website_pages (slug, title, status, meta_title, meta_description)
VALUES
  ('donation-policy', 'Donation Policy', 'published', 'Donation Policy - Buddha Academy Boarding School', 'Our donation policy outlining how contributions are used and managed.'),
  ('transparency-statement', 'Transparency Statement', 'published', 'Transparency Statement - Buddha Academy Boarding School', 'Our commitment to transparency and accountability.')
ON CONFLICT (slug) DO UPDATE SET
  status = 'published',
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;
