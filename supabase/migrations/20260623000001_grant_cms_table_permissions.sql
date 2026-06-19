GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT ON public.pages TO anon;
GRANT SELECT ON public.videos TO anon;
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT ON public.student_stories TO anon;
GRANT SELECT ON public.media_library TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_stories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;