DROP TRIGGER IF EXISTS version_pages_changes ON public.pages;

UPDATE pages
SET content = jsonb_set(
  content,
  '{values}',
  '[
    {"title": "Compassion", "desc": "Every child deserves love and care."},
    {"title": "Education", "desc": "Quality education opens doors to a brighter future."},
    {"title": "Community", "desc": "Building strong communities together."},
    {"title": "Integrity", "desc": "Transparent and honest operations."}
  ]'::jsonb
)
WHERE slug = 'about';

CREATE TRIGGER version_pages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.create_content_version_v2();
