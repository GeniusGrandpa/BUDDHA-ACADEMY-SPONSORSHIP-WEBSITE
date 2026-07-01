DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_sessions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.audit_logs
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.security_events
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.notifications
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_departments
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_teams
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.profiles
WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test');
DELETE FROM auth.users
WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test');
DELETE FROM auth.identities WHERE user_id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM public.profiles WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DROP FUNCTION IF EXISTS public.create_demo_user(uuid, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_demo_user(text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_demo_user;
DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text);
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.get_user_role()
    AND status = public.get_user_status()
  );
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;
DROP POLICY IF EXISTS profiles_read_all ON profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS profiles_update_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_all ON profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'
  );
$$;
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT status FROM public.profiles WHERE id = auth.uid()),
    'inactive'
  );
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.rls_has_permission(permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.code = permission_code AND p.status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy User'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    'donor',
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now()
  WHERE
    public.profiles.status = 'active';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.gallery_items TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.donations FROM anon;
REVOKE ALL ON public.sponsorships FROM anon;
REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.permissions FROM anon;
REVOKE ALL ON public.role_permissions FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_sessions FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;
REVOKE ALL ON public.security_events FROM anon;
REVOKE ALL ON public.departments FROM anon;
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.invitations FROM anon;
REVOKE ALL ON public.approvals FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.volunteer_assignments FROM anon;
REVOKE ALL ON public.user_departments FROM anon;
REVOKE ALL ON public.user_teams FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text,
  p_assigner_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
  new_role_level integer;
  caller_status text;
BEGIN
  caller_id := COALESCE(p_assigner_id, auth.uid());
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0), p.status
  INTO target_level, caller_status
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= 90 AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign admin-level roles' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role, 'previous_level', target_level),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
  caller_status text;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'Cannot change your own status' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0) INTO target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'status_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_status', new_status),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_changes, p_metadata, v_ip, v_ua)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, severity, metadata)
  VALUES (p_event_type, p_user_id, v_ip, v_ua, p_severity, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS profiles_read_own ON profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS approvals_insert ON approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
