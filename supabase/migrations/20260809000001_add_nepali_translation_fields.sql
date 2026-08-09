ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS name_ne TEXT,
ADD COLUMN IF NOT EXISTS bio_ne TEXT,
ADD COLUMN IF NOT EXISTS family_background_ne TEXT,
ADD COLUMN IF NOT EXISTS hobbies_ne TEXT[],
ADD COLUMN IF NOT EXISTS dream_career_ne TEXT,
ADD COLUMN IF NOT EXISTS education_goals_ne TEXT,
ADD COLUMN IF NOT EXISTS achievements_ne TEXT[];

ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ne TEXT;

ALTER TABLE public.gallery_items 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS caption_ne TEXT,
ADD COLUMN IF NOT EXISTS author_ne TEXT;

ALTER TABLE public.faqs 
ADD COLUMN IF NOT EXISTS question_ne TEXT,
ADD COLUMN IF NOT EXISTS answer_ne TEXT;

ALTER TABLE public.student_stories 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS student_name_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne TEXT,
ADD COLUMN IF NOT EXISTS quote_ne TEXT,
ADD COLUMN IF NOT EXISTS achievements_ne TEXT[];

ALTER TABLE public.donation_content 
ADD COLUMN IF NOT EXISTS hero_title_ne TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS currency_label_ne TEXT,
ADD COLUMN IF NOT EXISTS impact_cards_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS impact_stories_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS process_steps_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sections_ne JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.sponsorship_content 
ADD COLUMN IF NOT EXISTS hero_title_ne TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS section_title_ne TEXT,
ADD COLUMN IF NOT EXISTS section_description_ne TEXT,
ADD COLUMN IF NOT EXISTS cta_title_ne TEXT,
ADD COLUMN IF NOT EXISTS cta_description_ne TEXT,
ADD COLUMN IF NOT EXISTS cta_button_text_ne TEXT,
ADD COLUMN IF NOT EXISTS steps_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS benefits_ne JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.volunteer_content 
ADD COLUMN IF NOT EXISTS hero_title_ne TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS section_title_ne TEXT,
ADD COLUMN IF NOT EXISTS section_description_ne TEXT,
ADD COLUMN IF NOT EXISTS success_message_ne TEXT,
ADD COLUMN IF NOT EXISTS opportunities_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skill_options_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS form_fields_ne JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.transparency_content 
ADD COLUMN IF NOT EXISTS hero_title_ne TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS allocation_title_ne TEXT,
ADD COLUMN IF NOT EXISTS allocation_description_ne TEXT,
ADD COLUMN IF NOT EXISTS verification_title_ne TEXT,
ADD COLUMN IF NOT EXISTS verification_description_ne TEXT,
ADD COLUMN IF NOT EXISTS impact_report_title_ne TEXT,
ADD COLUMN IF NOT EXISTS receipt_policy_title_ne TEXT,
ADD COLUMN IF NOT EXISTS receipt_policy_text_ne TEXT,
ADD COLUMN IF NOT EXISTS donor_privacy_title_ne TEXT,
ADD COLUMN IF NOT EXISTS donor_privacy_text_ne TEXT,
ADD COLUMN IF NOT EXISTS allocation_data_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS verification_steps_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS impact_report_items_ne JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.hero_content 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS highlight_ne TEXT,
ADD COLUMN IF NOT EXISTS description_ne TEXT,
ADD COLUMN IF NOT EXISTS cta_primary_text_ne TEXT,
ADD COLUMN IF NOT EXISTS cta_secondary_text_ne TEXT,
ADD COLUMN IF NOT EXISTS statistics_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badges_ne JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne TEXT;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS name_ne TEXT,
ADD COLUMN IF NOT EXISTS description_ne TEXT;

ALTER TABLE public.legal_pages 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne TEXT;

ALTER TABLE public.media_library 
ADD COLUMN IF NOT EXISTS alt_text_ne TEXT;

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS site_name_ne TEXT,
ADD COLUMN IF NOT EXISTS site_tagline_ne TEXT;

ALTER TABLE public.navigation_items 
ADD COLUMN IF NOT EXISTS label_ne TEXT,
ADD COLUMN IF NOT EXISTS description_ne TEXT;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.homepage_sections 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS description_ne TEXT;

CREATE INDEX IF NOT EXISTS idx_students_name_ne ON public.students(name_ne);
CREATE INDEX IF NOT EXISTS idx_news_title_ne ON public.news(title_ne);
CREATE INDEX IF NOT EXISTS idx_gallery_items_title_ne ON public.gallery_items(title_ne);
CREATE INDEX IF NOT EXISTS idx_faqs_question_ne ON public.faqs(question_ne);
CREATE INDEX IF NOT EXISTS idx_student_stories_title_ne ON public.student_stories(title_ne);
