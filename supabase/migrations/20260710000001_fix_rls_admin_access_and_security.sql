DROP POLICY IF EXISTS "Admin full access donation_content" ON public.donation_content;
CREATE POLICY "Admin full access donation_content" ON public.donation_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access sponsorship_content" ON public.sponsorship_content;
CREATE POLICY "Admin full access sponsorship_content" ON public.sponsorship_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access volunteer_content" ON public.volunteer_content;
CREATE POLICY "Admin full access volunteer_content" ON public.volunteer_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access transparency_content" ON public.transparency_content;
CREATE POLICY "Admin full access transparency_content" ON public.transparency_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access hero_content" ON public.hero_content;
CREATE POLICY "Admin full access hero_content" ON public.hero_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access section_visibility" ON public.section_visibility;
CREATE POLICY "Admin full access section_visibility" ON public.section_visibility
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access site_images" ON public.site_images;
CREATE POLICY "Admin full access site_images" ON public.site_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access footer_content" ON public.footer_content;
CREATE POLICY "Admin full access footer_content" ON public.footer_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access seo_content" ON public.seo_content;
CREATE POLICY "Admin full access seo_content" ON public.seo_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access page_headers" ON public.page_headers;
CREATE POLICY "Admin full access page_headers" ON public.page_headers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
DROP POLICY IF EXISTS "Admin full access section_content" ON public.section_content;
CREATE POLICY "Admin full access section_content" ON public.section_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND status = 'active')
  );
REVOKE ALL ON public.donation_content FROM anon;
GRANT SELECT ON public.donation_content TO anon;
GRANT ALL ON public.donation_content TO authenticated;
REVOKE ALL ON public.sponsorship_content FROM anon;
GRANT SELECT ON public.sponsorship_content TO anon;
GRANT ALL ON public.sponsorship_content TO authenticated;
REVOKE ALL ON public.volunteer_content FROM anon;
GRANT SELECT ON public.volunteer_content TO anon;
GRANT ALL ON public.volunteer_content TO authenticated;
REVOKE ALL ON public.transparency_content FROM anon;
GRANT SELECT ON public.transparency_content TO anon;
GRANT ALL ON public.transparency_content TO authenticated;
REVOKE ALL ON public.hero_content FROM anon;
GRANT SELECT ON public.hero_content TO anon;
GRANT ALL ON public.hero_content TO authenticated;
REVOKE ALL ON public.section_visibility FROM anon;
GRANT SELECT ON public.section_visibility TO anon;
GRANT ALL ON public.section_visibility TO authenticated;
REVOKE ALL ON public.site_images FROM anon;
GRANT SELECT ON public.site_images TO anon;
GRANT ALL ON public.site_images TO authenticated;
REVOKE ALL ON public.footer_content FROM anon;
GRANT SELECT ON public.footer_content TO anon;
GRANT ALL ON public.footer_content TO authenticated;
REVOKE ALL ON public.seo_content FROM anon;
GRANT SELECT ON public.seo_content TO anon;
GRANT ALL ON public.seo_content TO authenticated;
REVOKE ALL ON public.page_headers FROM anon;
GRANT SELECT ON public.page_headers TO anon;
GRANT ALL ON public.page_headers TO authenticated;
REVOKE ALL ON public.section_content FROM anon;
GRANT SELECT ON public.section_content TO anon;
GRANT ALL ON public.section_content TO authenticated;
CREATE OR REPLACE FUNCTION public.get_section_visibility(p_section_key TEXT)
RETURNS TABLE(is_visible BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT sv.is_visible FROM public.section_visibility sv WHERE sv.section_key = p_section_key;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_page_header(p_slug TEXT)
RETURNS TABLE(id UUID, title TEXT, subtitle TEXT, background_image TEXT, is_visible BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT ph.id, ph.title, ph.subtitle, ph.background_image, ph.is_visible FROM public.page_headers ph WHERE ph.page_slug = p_slug;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_site_image(p_image_key TEXT)
RETURNS TABLE(image_url TEXT, alt_text TEXT, title TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT si.image_url, si.alt_text, si.title FROM public.site_images si WHERE si.image_key = p_image_key LIMIT 1;
END;
$$;
CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_versions (entity_type, entity_id, content, version_number, title, created_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      ELSE row_to_json(NEW)::jsonb
    END,
    COALESCE(NEW.updated_at, OLD.updated_at, now())::text,
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title, '')
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title, '')
      ELSE ''
    END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE OR REPLACE FUNCTION public.cms_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by, ip_address)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
         WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb
         ELSE NULL
    END,
    CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)::jsonb
         WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb
         ELSE NULL
    END,
    auth.uid(),
    current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for'
  );
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.create_content_version_v2()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_version_number INT;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM public.content_versions
  WHERE entity_type = TG_TABLE_NAME AND entity_id = COALESCE(NEW.id, OLD.id);
  INSERT INTO public.content_versions (entity_type, entity_id, content, version_number, title, created_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      ELSE row_to_json(NEW)::jsonb
    END,
    v_version_number,
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title, '')
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title, '')
      ELSE ''
    END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE OR REPLACE FUNCTION public.audit_page_blocks()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  page_slug TEXT;
BEGIN
  SELECT slug INTO page_slug FROM public.pages WHERE id = COALESCE(NEW.page_id, OLD.page_id);
  INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    'page_blocks',
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted', to_jsonb(OLD))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE jsonb_build_object('created', to_jsonb(NEW))
    END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE OR REPLACE FUNCTION public.sync_page_blocks_json(target_page_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  blocks_json JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pb.id,
      'type', pb.block_type,
      'title', pb.title,
      'content', pb.content,
      'settings', pb.settings,
      'is_visible', pb.is_visible,
      'is_draft', pb.is_draft
    ) ORDER BY pb.sort_order ASC
  ) INTO blocks_json
  FROM public.page_blocks pb
  WHERE pb.page_id = target_page_id;
  UPDATE public.pages
  SET blocks = COALESCE(blocks_json, '[]'::jsonb)
  WHERE id = target_page_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.migrate_homepage_sections_to_blocks()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  home_page_id UUID;
  section RECORD;
  block_id UUID;
  block_type_map text;
  total INTEGER := 0;
BEGIN
  SELECT id INTO home_page_id FROM public.pages WHERE slug = 'home';
  IF home_page_id IS NULL THEN
    INSERT INTO public.pages (slug, title, content, published)
    VALUES ('home', 'Homepage', '{}'::jsonb, true)
    RETURNING id INTO home_page_id;
  END IF;
  DELETE FROM public.page_blocks WHERE page_id = home_page_id;
  FOR section IN
    SELECT * FROM public.homepage_sections ORDER BY sort_order ASC
  LOOP
    block_type_map := CASE section.section_key
      WHEN 'hero' THEN 'hero'
      WHEN 'stats' THEN 'stats'
      WHEN 'features' THEN 'text'
      WHEN 'cta' THEN 'cta'
      WHEN 'impact' THEN 'stats'
      WHEN 'testimonials' THEN 'testimonials'
      WHEN 'news' THEN 'text'
      WHEN 'partners' THEN 'partners'
      ELSE 'custom_section'
    END;
    INSERT INTO public.page_blocks (page_id, block_type, title, content, sort_order, is_visible)
    VALUES (
      home_page_id,
      block_type_map,
      section.title,
      section.content,
      section.sort_order,
      section.is_active
    );
    total := total + 1;
  END LOOP;
  PERFORM public.sync_page_blocks_json(home_page_id);
  RETURN 'Migrated ' || total || ' homepage sections to blocks on page: home';
END;
$$;
