
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
  
  INSERT INTO public.content_versions (
    entity_type, 
    entity_id, 
    content, 
    version_number, 
    created_by,
    title,
    published
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      ELSE row_to_json(NEW)::jsonb
    END,
    v_version_number,
    auth.uid(),
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title, '')
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title, '')
      ELSE ''
    END,
    COALESCE(NEW.published, OLD.published, false)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  current_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO current_version
  FROM public.content_versions
  WHERE entity_type = TG_TABLE_NAME
  AND entity_id = COALESCE(NEW.id, OLD.id);
  
  INSERT INTO public.content_versions (
    entity_type,
    entity_id,
    entity_slug,
    version_number,
    title,
    content,
    published,
    created_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(
      (CASE 
        WHEN TG_TABLE_NAME = 'pages' THEN (NEW.content->>'slug')
        WHEN TG_TABLE_NAME = 'news' THEN (NEW.content->>'slug')
        ELSE NULL
      END),
      (SELECT slug FROM public.pages WHERE id = COALESCE(NEW.id, OLD.id))
    ),
    current_version,
    CASE 
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title, '')
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title, '')
      ELSE ''
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    COALESCE(NEW.published, OLD.published, false),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
