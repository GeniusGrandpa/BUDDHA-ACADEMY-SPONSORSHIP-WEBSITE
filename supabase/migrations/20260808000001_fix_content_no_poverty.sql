DROP TRIGGER IF EXISTS version_pages_changes ON public.pages;

UPDATE pages
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(content, '{timeline}', '[
      {"year": "1977", "title": "Founded", "desc": "Opened with 12 students."},
      {"year": "1985", "title": "First Graduation", "desc": "First batch of students completed their secondary education."},
      {"year": "1995", "title": "Permanent Campus", "desc": "Moved to a dedicated campus with proper classrooms."},
      {"year": "2005", "title": "Reaching Milestones", "desc": "Enrollment crossed 500 students with expanded programs."},
      {"year": "2015", "title": "Global Outreach", "desc": "International sponsorships began connecting students worldwide."},
      {"year": "2026", "title": "Today", "desc": "Serving over 2,000 children with free, quality education."}
    ]'::jsonb),
    '{vision}',
    '"We believe education transforms lives and builds stronger communities."'
  ),
  '{subtitle}',
  '"Providing free, quality education to children in need."'
)
WHERE slug = 'about';

CREATE TRIGGER version_pages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.create_content_version_v2();
