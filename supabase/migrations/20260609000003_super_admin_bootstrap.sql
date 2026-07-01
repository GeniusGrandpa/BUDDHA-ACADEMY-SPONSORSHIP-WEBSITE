DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text);
DROP FUNCTION IF EXISTS public.admin_update_role(uuid, text, uuid);
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_level integer;
  caller_status text;
  target_level integer;
  target_role text;
  new_role_level integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = auth.uid();
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  IF caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, COALESCE(r.level, 0)
  INTO target_role, target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
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
  IF new_role = 'super_admin' AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can promote to super admin' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  INSERT INTO public.audit_logs (
    user_id, action, entity_type, entity_id, changes, metadata
  ) VALUES (
    auth.uid(),
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object(
      'previous_role', target_role,
      'new_role', new_role
    ),
    jsonb_build_object(
      'changed_by', auth.uid()::text,
      'caller_role', caller_role
    )
  );
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    target_user_id,
    'system',
    'Role Updated',
    format('Your role has been changed from %s to %s', target_role, new_role)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT ON public.donation_goals TO anon;
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.impact_metrics TO anon;
GRANT SELECT ON public.events TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.students TO authenticated;
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT SELECT ON public.sponsorships TO authenticated;
GRANT SELECT ON public.news TO authenticated;
GRANT SELECT ON public.gallery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contact_submissions TO authenticated;
GRANT SELECT ON public.donation_goals TO authenticated;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT SELECT ON public.impact_metrics TO authenticated;
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.sponsorship_timeline TO authenticated;
GRANT SELECT ON public.certificates TO authenticated;
GRANT SELECT, INSERT ON public.login_history TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT SELECT ON public.teacher_assignments TO authenticated;
GRANT SELECT ON public.student_progress TO authenticated;
GRANT SELECT ON public.attendance_records TO authenticated;
GRANT SELECT ON public.volunteer_assignments TO authenticated;
GRANT SELECT ON public.security_events TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'::text
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
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
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Donor'),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    'donor',
    'active'
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin ON profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin'));
DO $$
DECLARE
  demo_user RECORD;
  demo_uuid uuid;
BEGIN
  FOR demo_user IN
    SELECT id FROM auth.users
    WHERE email IN (
      'admin@buddhaacademy.test',
      'donor@buddhaacademy.test',
      'demo@buddhaacademy.test',
      'test@buddhaacademy.test',
      'admin@test.com',
      'donor@test.com'
    )
  LOOP
    DELETE FROM public.audit_logs WHERE user_id = demo_user.id;
    DELETE FROM public.security_events WHERE user_id = demo_user.id;
    DELETE FROM public.notifications WHERE user_id = demo_user.id;
    DELETE FROM public.login_history WHERE user_id = demo_user.id;
    DELETE FROM public.user_sessions WHERE user_id = demo_user.id;
    DELETE FROM public.user_roles WHERE user_id = demo_user.id;
    DELETE FROM public.certificates WHERE user_id = demo_user.id;
    DELETE FROM public.profiles WHERE id = demo_user.id;
    DELETE FROM auth.identities WHERE user_id = demo_user.id;
    DELETE FROM auth.sessions WHERE user_id = demo_user.id;
    DELETE FROM auth.users WHERE id = demo_user.id;
  END LOOP;
  FOREACH demo_uuid IN ARRAY ARRAY[
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002'
  ]::uuid[]
  LOOP
    DELETE FROM public.audit_logs WHERE user_id = demo_uuid;
    DELETE FROM public.security_events WHERE user_id = demo_uuid;
    DELETE FROM public.notifications WHERE user_id = demo_uuid;
    DELETE FROM public.login_history WHERE user_id = demo_uuid;
    DELETE FROM public.user_sessions WHERE user_id = demo_uuid;
    DELETE FROM public.user_roles WHERE user_id = demo_uuid;
    DELETE FROM public.certificates WHERE user_id = demo_uuid;
    DELETE FROM public.profiles WHERE id = demo_uuid;
    DELETE FROM auth.identities WHERE user_id = demo_uuid;
    DELETE FROM auth.sessions WHERE user_id = demo_uuid;
    DELETE FROM auth.users WHERE id = demo_uuid;
  END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
