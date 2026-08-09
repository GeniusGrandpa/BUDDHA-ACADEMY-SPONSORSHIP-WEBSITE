-- Additive Nepali translations for direct, user-facing database records.
-- Existing English data is intentionally left untouched; NULL/empty Nepali
-- values fall back to the corresponding English field in the frontend.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS name_ne text,
  ADD COLUMN IF NOT EXISTS grade_ne text,
  ADD COLUMN IF NOT EXISTS class_section_ne text,
  ADD COLUMN IF NOT EXISTS bio_ne text,
  ADD COLUMN IF NOT EXISTS family_background_ne text,
  ADD COLUMN IF NOT EXISTS hobbies_ne text[],
  ADD COLUMN IF NOT EXISTS dream_career_ne text,
  ADD COLUMN IF NOT EXISTS education_goals_ne text,
  ADD COLUMN IF NOT EXISTS achievements_ne text[];

ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS excerpt_ne text,
  ADD COLUMN IF NOT EXISTS content_ne text,
  ADD COLUMN IF NOT EXISTS tags_ne text[];

ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS caption_ne text,
  ADD COLUMN IF NOT EXISTS author_ne text;

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS author_role_ne text,
  ADD COLUMN IF NOT EXISTS content_ne text,
  ADD COLUMN IF NOT EXISTS quote_ne text;

ALTER TABLE public.donation_goals
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS description_ne text,
  ADD COLUMN IF NOT EXISTS category_ne text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS description_ne text,
  ADD COLUMN IF NOT EXISTS location_ne text;

ALTER TABLE public.student_stories
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS content_ne text,
  ADD COLUMN IF NOT EXISTS quote_ne text,
  ADD COLUMN IF NOT EXISTS achievements_ne text[];

ALTER TABLE public.faqs
  ADD COLUMN IF NOT EXISTS question_ne text,
  ADD COLUMN IF NOT EXISTS answer_ne text;

ALTER TABLE public.volunteer_events
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS description_ne text,
  ADD COLUMN IF NOT EXISTS location_ne text,
  ADD COLUMN IF NOT EXISTS requirements_ne text;

ALTER TABLE public.teacher_reports
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS summary_ne text,
  ADD COLUMN IF NOT EXISTS teacher_notes_ne text,
  ADD COLUMN IF NOT EXISTS achievements_ne text[],
  ADD COLUMN IF NOT EXISTS areas_for_improvement_ne text[];

ALTER TABLE public.student_progress
  ADD COLUMN IF NOT EXISTS subject_ne text,
  ADD COLUMN IF NOT EXISTS grade_ne text,
  ADD COLUMN IF NOT EXISTS notes_ne text,
  ADD COLUMN IF NOT EXISTS achievement_ne text;

ALTER TABLE public.sponsorship_timeline
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS description_ne text;

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS title_ne text,
  ADD COLUMN IF NOT EXISTS description_ne text;

-- CMS tables continue to use public.content_translations, which supports
-- translated scalar fields and nested JSON paths without duplicating JSONB.
