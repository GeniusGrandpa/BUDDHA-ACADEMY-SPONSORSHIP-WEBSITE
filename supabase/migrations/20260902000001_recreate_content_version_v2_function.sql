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
  INSERT INTO public.content_versions (entity_type, entity_id, content, version_number, created_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      ELSE row_to_json(NEW)::jsonb
    END,
    v_version_number,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
