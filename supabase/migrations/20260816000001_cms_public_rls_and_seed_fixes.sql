DROP POLICY IF EXISTS "Public can read visible sections" ON public.website_sections;
CREATE POLICY "Public can read visible sections"
  ON public.website_sections FOR SELECT
  USING (
    public.is_admin_or_super_admin()
    OR (
      is_visible = true
      AND is_draft = false
      AND EXISTS (
        SELECT 1 FROM public.website_pages wp
        WHERE wp.id = website_sections.page_id
          AND wp.status = 'published'
      )
    )
  );

DROP POLICY IF EXISTS "Public can read visible blocks" ON public.website_content_blocks;
CREATE POLICY "Public can read visible blocks"
  ON public.website_content_blocks FOR SELECT
  USING (
    public.is_admin_or_super_admin()
    OR (
      is_visible = true
      AND EXISTS (
        SELECT 1 FROM public.website_sections ws
        JOIN public.website_pages wp ON wp.id = ws.page_id
        WHERE ws.id = website_content_blocks.section_id
          AND ws.is_visible = true
          AND ws.is_draft = false
          AND wp.status = 'published'
      )
    )
  );

DO $$
DECLARE
  v_about_id UUID;
BEGIN
  SELECT id INTO v_about_id FROM public.website_pages WHERE slug = 'about' LIMIT 1;
  IF v_about_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.website_sections
    (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_about_id, 'about_values', 'about_values',
    'Our Core Values',
    'The principles that guide everything we do at Buddha Academy.',
    jsonb_build_object('cards', jsonb_build_array(
      jsonb_build_object('title', 'Compassion',  'description', 'We treat every child with kindness, understanding, and respect, fostering a nurturing environment.', 'icon', 'heart'),
      jsonb_build_object('title', 'Excellence',  'description', 'We strive for the highest standards in education, character development, and community service.', 'icon', 'star'),
      jsonb_build_object('title', 'Integrity',   'description', 'We operate with complete transparency, ensuring every donation is used effectively and ethically.', 'icon', 'shield'),
      jsonb_build_object('title', 'Empowerment', 'description', 'We believe in empowering children through education to break the cycle of poverty.', 'icon', 'users')
    )),
    4, true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    sort_order = EXCLUDED.sort_order,
    is_visible = true;
END $$;
