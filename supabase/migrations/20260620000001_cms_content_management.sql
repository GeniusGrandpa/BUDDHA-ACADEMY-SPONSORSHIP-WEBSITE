CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'upload', 'vimeo')),
  thumbnail_url TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.student_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  quote TEXT,
  achievements TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.news ADD COLUMN slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.news ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.news ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.testimonials ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'testimonial_type'
  ) THEN
    ALTER TABLE public.testimonials ADD COLUMN testimonial_type TEXT DEFAULT 'donor' CHECK (testimonial_type IN ('donor', 'teacher', 'student', 'volunteer'));
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['pages', 'homepage_sections', 'videos', 'faqs', 'student_stories', 'gallery_items', 'news', 'testimonials'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_' || tbl || '_updated_at') THEN
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', tbl, tbl);
      END IF;
    END IF;
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_news_published_at') THEN
    CREATE TRIGGER set_news_published_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.set_published_at();
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(BOTH '-' FROM base_slug);
  final_slug := base_slug;
  LOOP
    IF table_name = 'news' THEN
      IF NOT EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) THEN
        EXIT;
      END IF;
    END IF;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published pages" ON pages;
CREATE POLICY "Anyone can read published pages"
  ON public.pages FOR SELECT
  USING (published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
CREATE POLICY "Admins can insert pages"
  ON public.pages FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
CREATE POLICY "Admins can update pages"
  ON public.pages FOR UPDATE
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
CREATE POLICY "Admins can delete pages"
  ON public.pages FOR DELETE
  USING (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read active homepage sections" ON homepage_sections;
CREATE POLICY "Anyone can read active homepage sections"
  ON public.homepage_sections FOR SELECT
  USING (is_active = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage homepage sections" ON homepage_sections;
CREATE POLICY "Admins can manage homepage sections"
  ON public.homepage_sections FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read videos" ON videos;
CREATE POLICY "Anyone can read videos"
  ON public.videos FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read published faqs" ON faqs;
CREATE POLICY "Anyone can read published faqs"
  ON public.faqs FOR SELECT
  USING (is_published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read published stories" ON student_stories;
CREATE POLICY "Anyone can read published stories"
  ON public.student_stories FOR SELECT
  USING (is_published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage stories" ON student_stories;
CREATE POLICY "Admins can manage stories"
  ON public.student_stories FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read media" ON media_library;
CREATE POLICY "Anyone can read media"
  ON public.media_library FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can upload media" ON media_library;
CREATE POLICY "Admins can upload media"
  ON public.media_library FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can delete media" ON media_library;
CREATE POLICY "Admins can delete media"
  ON public.media_library FOR DELETE
  USING (public.is_admin_or_super_admin());
CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS TRIGGER AS $$
DECLARE
  entity_name TEXT;
  action_type TEXT;
  changes_json JSONB;
BEGIN
  entity_name := TG_TABLE_NAME;
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    changes_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    changes_json := to_jsonb(OLD);
  END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata)
  VALUES (
    auth.uid(),
    action_type || ' ' || entity_name,
    entity_name,
    COALESCE(NEW.id, OLD.id)::TEXT,
    changes_json,
    jsonb_build_object('table', entity_name, 'op', TG_OP)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['pages', 'homepage_sections', 'videos', 'faqs', 'student_stories', 'media_library'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_' || tbl || '_changes') THEN
        EXECUTE format('CREATE TRIGGER audit_%I_changes AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_content_change()', tbl, tbl);
      END IF;
    END IF;
  END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON public.homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON public.homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON public.videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON public.faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_student_stories_published ON public.student_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_student_stories_featured ON public.student_stories(featured);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON public.gallery_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON public.media_library(mime_type);
INSERT INTO public.pages (slug, title, content, published) VALUES
  ('home', 'Homepage', '{"hero_title": "Empowering Nepal''s Future", "hero_subtitle": "One Child at a Time", "hero_description": "Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.", "cta_primary_text": "Sponsor a Child", "cta_primary_link": "/students", "cta_secondary_text": "Donate Now", "cta_secondary_link": "/donate"}', true),
  ('about', 'About Us', '{"title": "About Buddha Academy", "subtitle": "For over four decades, we have been providing free, quality education.", "mission": "Buddha Academy is committed to providing free, quality education.", "vision": "We believe education is the key to breaking the cycle of poverty.", "stats": [{"value": "49+", "label": "Years of Service"}, {"value": "2000+", "label": "Children Educated"}, {"value": "100%", "label": "Free Education"}, {"value": "12+", "label": "Partner Countries"}], "values": [{"title": "Compassion", "desc": "Every child deserves love and care."}, {"title": "Education", "desc": "Quality education breaks poverty cycles."}, {"title": "Community", "desc": "Building strong communities."}, {"title": "Integrity", "desc": "Transparent operations."}], "timeline": [{"year": "1977", "title": "Founded", "desc": "Opened with 12 students."}]}', true),
  ('volunteer', 'Volunteer Page', '{"title": "Volunteer With Us", "subtitle": "Share your skills and make a direct impact on children''s lives.", "sectionTitle": "Volunteer Opportunities", "sectionDesc": "Whether you can join us in Nepal or contribute remotely, there are many ways to help.", "opportunities": [{"title": "Teaching", "desc": "Share your knowledge by teaching subjects like English, Math, Science, or Computer skills."}, {"title": "Healthcare", "desc": "Provide medical checkups, health education, and basic healthcare services to students."}, {"title": "Mentorship", "desc": "Connect with students as a mentor and guide them in their personal development."}, {"title": "Remote Support", "desc": "Contribute from anywhere in the world through online teaching and administrative support."}]}', true),
  ('privacy', 'Privacy Policy', '{"title": "Privacy Policy", "lastUpdated": "June 2025", "body": "Buddha Academy (\"we\", \"our\", or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.\\n\\nInformation We Collect\\n\\nWe may collect information about you when you:\\n\\n- Register for an account\\n- Make a donation or pledge\\n- Sponsor a child\\n- Submit a contact form\\n- Subscribe to our newsletter\\n- Apply to volunteer\\n\\nThe information we collect may include your name, email address, phone number, country of residence, payment information, and any other information you voluntarily provide.\\n\\nHow We Use Your Information\\n\\nWe use the information we collect to:\\n\\n- Process your donations and sponsorships\\n- Provide updates on your sponsored child\\n- Send you important communications about our programs\\n- Respond to your inquiries and requests\\n- Improve our website and services\\n- Comply with legal obligations"}', true),
  ('terms', 'Terms of Service', '{"title": "Terms & Conditions", "lastUpdated": "June 2025", "body": "By accessing and using the Buddha Academy website, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our website.\\n\\nUse License\\n\\nPermission is granted to temporarily access the materials on Buddha Academy''s website for personal, non-commercial use only. This is the grant of a license, not a transfer of title.\\n\\nDonations and Sponsorships\\n\\nAll donations and sponsorships are voluntary contributions. We make every effort to ensure that donations are used as specified.\\n\\nUser Accounts\\n\\nWhen you create an account, you must provide accurate information. You are responsible for maintaining the confidentiality of your account.\\n\\nProhibited Uses\\n\\nYou may use our website only for lawful purposes. You agree not to:\\n\\n- Use the site in any way that violates applicable laws\\n- Engage in any conduct that restricts others'' use\\n- Impersonate any person or entity\\n- Interfere with the site''s operation"}', true),
  ('contact', 'Contact Page', '{"title": "Contact Us", "subtitle": "Have questions? We''d love to hear from you.", "address": "Buddha Academy", "addressLine2": "Boudha, Kathmandu", "addressLine3": "Nepal", "phone": "+977 1 1234567", "phoneHours": "Mon-Fri, 9am-5pm (NPT)", "email": "info@buddhaacademy.edu.np", "emailResponse": "We''ll respond within 24 hours", "officeHours": ["Monday - Friday: 9:00 AM - 5:00 PM", "Saturday: 10:00 AM - 2:00 PM", "Sunday: Closed"], "location": "Located in Boudha, Kathmandu", "locationDesc": "Situated in the culturally rich Boudha area."}', true),
  ('transparency', 'Transparency', '{"title": "Transparency & Accountability", "subtitle": "Built on Trust", "description": "We are committed to complete transparency in how we use donor funds and the impact we create.", "allocationData": [{"name": "Children''s Education & Welfare", "value": 70}, {"name": "Teachers & Staff", "value": 20}, {"name": "Facilities & Operations", "value": 10}], "impactStats": [{"label": "Students Supported", "value": "250+"}, {"label": "Active Sponsors", "value": "180+"}, {"label": "Years of Impact", "value": "12+"}, {"label": "Donation Efficiency", "value": "95%"}]}', true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.homepage_sections (section_key, title, subtitle, content, sort_order, is_active) VALUES
  ('hero', 'Hero Section', 'Main hero banner', '{"title": "Empowering Nepal''s Future", "highlight": "One Child at a Time", "description": "Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.", "cta_primary_text": "Sponsor a Child", "cta_primary_link": "/students", "cta_secondary_text": "Donate Now", "cta_secondary_link": "/donate", "background_image": "https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=1920"}', 1, true),
  ('stats', 'Statistics Bar', 'Key impact numbers', '{"items": [{"value": "Since 1977", "label": "Trusted Service"}, {"value": "49+", "label": "Years of Service"}, {"value": "100%", "label": "Free Education"}, {"value": "250+", "label": "Children Supported"}]}', 2, true),
  ('about_preview', 'About Preview', 'Brief about section with timeline', '{"title": "About Buddha Academy", "description": "Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.", "milestones": [{"year": "1977", "event": "Founded with 12 students"}, {"year": "1990s", "event": "Hostel expansion program"}, {"year": "2010s", "event": "Computer lab established"}, {"year": "Today", "event": "Educating hundreds annually"}]}', 3, true),
  ('sponsorship_steps', 'How Sponsorship Works', 'Step-by-step sponsorship guide', '{"title": "How Sponsorship Works", "description": "Your journey to changing a child''s life starts here.", "steps": [{"num": "01", "title": "Browse Profiles", "desc": "Review children waiting for sponsors"}, {"num": "02", "title": "Choose a Child", "desc": "Select a student to sponsor"}, {"num": "03", "title": "Make Your Pledge", "desc": "Complete donation form securely"}, {"num": "04", "title": "We Connect", "desc": "Link you with your sponsored child"}, {"num": "05", "title": "Receive Updates", "desc": "Get progress reports & photos"}, {"num": "06", "title": "Build Connection", "desc": "Exchange letters & messages"}, {"num": "07", "title": "Track Impact", "desc": "See your contribution at work"}, {"num": "08", "title": "Join Community", "desc": "Connect with other sponsors"}]}', 4, true),
  ('transparency_highlight', 'Transparency Highlight', 'Trust and accountability messaging', '{"title": "Your Trust Is Our Foundation", "description": "We are committed to honoring every donation with integrity, transparency, and a deep sense of responsibility."}', 5, true)
ON CONFLICT (section_key) DO NOTHING;
INSERT INTO public.faqs (question, answer, category, sort_order, is_published) VALUES
  ('How do I sponsor a child?', 'To sponsor a child, browse our Students page to view profiles of children waiting for sponsorship. Select a child whose story resonates with you, then click "Sponsor this child" to begin the process.', 'Sponsorship', 1, true),
  ('How is my donation used?', 'Your donation goes directly to supporting our students'' education and welfare. We maintain complete transparency in our financial reporting.', 'Donations', 2, true),
  ('Can I choose a specific student to sponsor?', 'Yes! You can browse through our student profiles and select a specific child you''d like to sponsor. Each profile includes their background and sponsorship needs.', 'Sponsorship', 3, true),
  ('Can I track my sponsored child''s progress?', 'Absolutely! As a sponsor, you''ll have access to your Donor Dashboard where you can view updates on your sponsored child''s academic progress and personal development.', 'Sponsorship', 4, true),
  ('Can donors visit the school?', 'Yes, we welcome donors to visit Buddha Academy and see our work firsthand. Please contact us in advance to arrange a visit.', 'General', 5, true),
  ('Is a small donation accepted?', 'Yes! Every donation, no matter the size, makes a difference. Small donations add up and help provide meals, books, and educational materials.', 'Donations', 6, true),
  ('How do I volunteer?', 'We welcome volunteers from around the world! Visit our Volunteer page to learn about opportunities and how to apply.', 'Volunteering', 7, true),
  ('How does corporate partnership work?', 'Corporate partners can support Buddha Academy through sponsorship programs, matching gift programs, or in-kind donations. Contact us to discuss opportunities.', 'Partnerships', 8, true)
ON CONFLICT DO NOTHING;
