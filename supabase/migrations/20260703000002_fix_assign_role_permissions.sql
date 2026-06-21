CREATE OR REPLACE FUNCTION public.assign_role_permissions(p_role_name text, p_permission_codes text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role_id uuid;
  v_permission_id uuid;
BEGIN
  IF public.get_my_role() != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign role permissions';
  END IF;
  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found', p_role_name;
  END IF;
  DELETE FROM public.role_permissions WHERE role_id = v_role_id;
  FOREACH v_permission_id IN ARRAY ARRAY(
    SELECT id FROM public.permissions WHERE code = ANY(p_permission_codes)
  )
  LOOP
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
END;
$$;
