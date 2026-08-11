

CREATE OR REPLACE FUNCTION public.cms_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata, ip_address)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    CASE 
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
      WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)::jsonb
      WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb
      ELSE NULL
    END,
    current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for'
  );
  RETURN NEW;
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
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    'page_blocks',
    COALESCE(NEW.id, OLD.id)::text,
    CASE
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted', to_jsonb(OLD))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE jsonb_build_object('created', to_jsonb(NEW))
    END,
    jsonb_build_object('page_slug', page_slug)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
