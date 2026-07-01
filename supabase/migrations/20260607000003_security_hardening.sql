CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
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
DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text);
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
  target_status text;
BEGIN
  caller_id := COALESCE(p_assigner_id, auth.uid());
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, target_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF target_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0), p.status
  INTO target_level, target_status
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
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_read_own ON profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS profiles_read_all ON profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );
DROP POLICY IF EXISTS profiles_update_all ON profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS profiles_delete ON profiles;
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.delete'));
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
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS approvals_insert ON approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE OR REPLACE FUNCTION public.create_demo_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_country text,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can create users' USING ERRCODE = '42501';
  END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user,
    created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated', 'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name, 'country', p_country),
    false, false,
    now(), now(),
    '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id, v_user_id,
    p_email,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email',
    now(), now(), now()
  );
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (v_user_id, p_email, p_full_name, p_country, 'donor', 'active')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now();
  PERFORM public.log_audit_event(
    auth.uid(),
    'create_user',
    'auth.users',
    v_user_id::text,
    jsonb_build_object('email', p_email, 'role', p_role),
    NULL
  );
  RETURN v_user_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('suspended', 'banned') THEN
    UPDATE public.user_sessions
    SET is_active = false, expired_at = now()
    WHERE user_id = NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_profile_status_change ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_status_change ON profiles;
CREATE TRIGGER on_profile_status_change
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('suspended', 'banned'))
  EXECUTE FUNCTION public.validate_user_session();
CREATE OR REPLACE FUNCTION public.log_failed_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, severity, metadata)
  VALUES (
    'role_change_attempt',
    auth.uid(),
    'warning',
    jsonb_build_object(
      'target_user', NEW.id,
      'attempted_role', NEW.role,
      'previous_role', OLD.role
    )
  );
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(
  p_user_id uuid,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count integer;
  v_is_suspicious boolean := false;
BEGIN
  SELECT COUNT(*) INTO v_recent_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action = p_action
    AND created_at > now() - interval '5 minutes';
  IF v_recent_count > 10 THEN
    v_is_suspicious := true;
  END IF;
  RETURN v_is_suspicious;
END;
$$;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
DROP POLICY IF EXISTS roles_insert ON public.roles;
DROP POLICY IF EXISTS roles_update ON public.roles;
DROP POLICY IF EXISTS roles_delete ON public.roles;
DROP POLICY IF EXISTS roles_insert ON roles;
CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS roles_update ON roles;
CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS roles_delete ON roles;
CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_insert ON public.permissions;
DROP POLICY IF EXISTS permissions_update ON public.permissions;
DROP POLICY IF EXISTS permissions_delete ON public.permissions;
DROP POLICY IF EXISTS permissions_insert ON permissions;
CREATE POLICY permissions_insert ON public.permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_update ON permissions;
CREATE POLICY permissions_update ON public.permissions FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_delete ON permissions;
CREATE POLICY permissions_delete ON public.permissions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS role_permissions_insert ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_delete ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_insert ON role_permissions;
CREATE POLICY role_permissions_insert ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS role_permissions_delete ON role_permissions;
CREATE POLICY role_permissions_delete ON public.role_permissions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert ON user_roles;
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_roles_delete ON user_roles;
CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_sessions_delete_own ON public.user_sessions;
DROP POLICY IF EXISTS user_sessions_delete_all ON public.user_sessions;
DROP POLICY IF EXISTS user_sessions_delete_own ON user_sessions;
CREATE POLICY user_sessions_delete_own ON public.user_sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_sessions_delete_all ON user_sessions;
CREATE POLICY user_sessions_delete_all ON public.user_sessions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.suspend'));
DROP POLICY IF EXISTS departments_insert ON public.departments;
DROP POLICY IF EXISTS departments_update ON public.departments;
DROP POLICY IF EXISTS departments_delete ON public.departments;
DROP POLICY IF EXISTS departments_insert ON departments;
CREATE POLICY departments_insert ON public.departments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS departments_update ON departments;
CREATE POLICY departments_update ON public.departments FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS departments_delete ON departments;
CREATE POLICY departments_delete ON public.departments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS teams_insert ON public.teams;
DROP POLICY IF EXISTS teams_update ON public.teams;
DROP POLICY IF EXISTS teams_delete ON public.teams;
DROP POLICY IF EXISTS teams_insert ON teams;
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS teams_update ON teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS teams_delete ON teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS user_departments_insert ON public.user_departments;
DROP POLICY IF EXISTS user_departments_delete ON public.user_departments;
DROP POLICY IF EXISTS user_departments_insert ON user_departments;
CREATE POLICY user_departments_insert ON public.user_departments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS user_departments_delete ON user_departments;
CREATE POLICY user_departments_delete ON public.user_departments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS user_teams_insert ON public.user_teams;
DROP POLICY IF EXISTS user_teams_delete ON public.user_teams;
DROP POLICY IF EXISTS user_teams_insert ON user_teams;
CREATE POLICY user_teams_insert ON public.user_teams FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS user_teams_delete ON user_teams;
CREATE POLICY user_teams_delete ON public.user_teams FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS invitations_insert ON public.invitations;
DROP POLICY IF EXISTS invitations_update ON public.invitations;
DROP POLICY IF EXISTS invitations_insert ON invitations;
CREATE POLICY invitations_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS invitations_update ON invitations;
CREATE POLICY invitations_update ON public.invitations FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.invite'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS approvals_update ON public.approvals;
DROP POLICY IF EXISTS approvals_insert ON approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
DROP POLICY IF EXISTS approvals_update ON approvals;
CREATE POLICY approvals_update ON public.approvals FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS notifications_insert_system ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_system ON notifications;
CREATE POLICY notifications_insert_system ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('notifications.send'));
DROP POLICY IF EXISTS volunteer_assignments_insert ON public.volunteer_assignments;
DROP POLICY IF EXISTS volunteer_assignments_update ON public.volunteer_assignments;
DROP POLICY IF EXISTS volunteer_assignments_delete ON public.volunteer_assignments;
DROP POLICY IF EXISTS volunteer_assignments_insert ON volunteer_assignments;
CREATE POLICY volunteer_assignments_insert ON public.volunteer_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('volunteers.create'));
DROP POLICY IF EXISTS volunteer_assignments_update ON volunteer_assignments;
CREATE POLICY volunteer_assignments_update ON public.volunteer_assignments FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('volunteers.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('volunteers.update'));
DROP POLICY IF EXISTS volunteer_assignments_delete ON volunteer_assignments;
CREATE POLICY volunteer_assignments_delete ON public.volunteer_assignments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('volunteers.delete'));
DROP POLICY IF EXISTS students_insert ON public.students;
DROP POLICY IF EXISTS students_update ON public.students;
DROP POLICY IF EXISTS students_delete ON public.students;
DROP POLICY IF EXISTS students_insert ON students;
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('students.create'));
DROP POLICY IF EXISTS students_update ON students;
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('students.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS students_delete ON students;
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('students.delete'));
DROP POLICY IF EXISTS donations_insert ON public.donations;
DROP POLICY IF EXISTS donations_update ON public.donations;
DROP POLICY IF EXISTS donations_insert ON donations;
CREATE POLICY donations_insert ON public.donations FOR INSERT TO authenticated
  WITH CHECK (
    public.is_active_user()
    AND (donor_id = auth.uid() OR public.rls_has_permission('donations.create'))
  );
DROP POLICY IF EXISTS donations_update ON donations;
CREATE POLICY donations_update ON public.donations FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('donations.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('donations.update'));
DROP POLICY IF EXISTS sponsorships_insert ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_update ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_delete ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_insert ON sponsorships;
CREATE POLICY sponsorships_insert ON public.sponsorships FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('sponsorships.create'));
DROP POLICY IF EXISTS sponsorships_update ON sponsorships;
CREATE POLICY sponsorships_update ON public.sponsorships FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('sponsorships.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('sponsorships.update'));
DROP POLICY IF EXISTS sponsorships_delete ON sponsorships;
CREATE POLICY sponsorships_delete ON public.sponsorships FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('sponsorships.delete'));
DROP POLICY IF EXISTS news_insert ON public.news;
DROP POLICY IF EXISTS news_update ON public.news;
DROP POLICY IF EXISTS news_delete ON public.news;
DROP POLICY IF EXISTS news_insert ON news;
CREATE POLICY news_insert ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('news.create'));
DROP POLICY IF EXISTS news_update ON news;
CREATE POLICY news_update ON public.news FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('news.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('news.update'));
DROP POLICY IF EXISTS news_delete ON news;
CREATE POLICY news_delete ON public.news FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('news.delete'));
DROP POLICY IF EXISTS gallery_insert ON public.gallery_items;
DROP POLICY IF EXISTS gallery_update ON public.gallery_items;
DROP POLICY IF EXISTS gallery_delete ON public.gallery_items;
DROP POLICY IF EXISTS gallery_insert ON gallery_items;
CREATE POLICY gallery_insert ON public.gallery_items FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('gallery.create'));
DROP POLICY IF EXISTS gallery_update ON gallery_items;
CREATE POLICY gallery_update ON public.gallery_items FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('gallery.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('gallery.update'));
DROP POLICY IF EXISTS gallery_delete ON gallery_items;
CREATE POLICY gallery_delete ON public.gallery_items FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('gallery.delete'));
DROP POLICY IF EXISTS contacts_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_update ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_update ON contact_submissions;
CREATE POLICY contacts_update ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('contacts.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('contacts.update'));
DROP POLICY IF EXISTS security_events_read ON public.security_events;
DROP POLICY IF EXISTS security_events_read ON security_events;
CREATE POLICY security_events_read ON public.security_events FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));
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
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
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
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'Cannot change your own status' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level INTO caller_role, caller_level
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
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
