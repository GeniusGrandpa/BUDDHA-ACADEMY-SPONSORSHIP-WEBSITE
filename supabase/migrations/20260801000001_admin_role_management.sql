CREATE OR REPLACE FUNCTION public.admin_update_user_role(
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
  caller_status text;
  target_role text;
  new_role_level integer;
  caller_level integer;
  super_admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, p.status INTO caller_role, caller_status
  FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  IF caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT p.role INTO target_role
  FROM public.profiles p WHERE p.id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  SELECT level INTO caller_level
  FROM public.roles WHERE name = caller_role;
  IF caller_role != 'super_admin' THEN
    IF new_role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'You do not have permission to assign the % role', new_role USING ERRCODE = '42501';
    END IF;
    IF target_role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'You cannot change the role of an admin or super admin' USING ERRCODE = '42501';
    END IF;
    IF new_role_level >= caller_level THEN
      RAISE EXCEPTION 'Cannot assign a role with equal or higher level than your own' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF target_role = 'super_admin' AND new_role != 'super_admin' THEN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.profiles
    WHERE role = 'super_admin' AND status = 'active' AND id != target_user_id;
    IF super_admin_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last super admin. Promote another user first.'
        USING ERRCODE = '42501';
    END IF;
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
REVOKE ALL ON FUNCTION public.admin_update_user_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_user_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.admin_update_user_role IS 'Admin/Super Admin: change user role. Admin restricted from admin/super_admin roles. Full audit logging.';
CREATE OR REPLACE FUNCTION public.get_user_verification_status(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_status text;
  v_confirmed_at timestamptz;
  v_email text;
BEGIN
  SELECT p.role, p.status INTO caller_role, caller_status
  FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS NULL OR caller_status IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Only admins can view verification status' USING ERRCODE = '42501';
  END IF;
  SELECT email, email_confirmed_at INTO v_email, v_confirmed_at
  FROM auth.users WHERE id = target_user_id;
  RETURN jsonb_build_object(
    'email', v_email,
    'email_confirmed_at', v_confirmed_at,
    'is_verified', v_confirmed_at IS NOT NULL
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_user_verification_status(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_verification_status(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_verification_status(uuid) TO authenticated;
COMMENT ON FUNCTION public.get_user_verification_status IS 'Admin/Super Admin: check if a user has verified their email.';
CREATE OR REPLACE FUNCTION public.get_user_management_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  result jsonb;
BEGIN
  SELECT p.role INTO caller_role
  FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'super_admins', COUNT(*) FILTER (WHERE role = 'super_admin'),
    'admins', COUNT(*) FILTER (WHERE role = 'admin'),
    'finance_managers', COUNT(*) FILTER (WHERE role = 'finance_manager'),
    'teachers', COUNT(*) FILTER (WHERE role = 'teacher'),
    'donors', COUNT(*) FILTER (WHERE role = 'donor'),
    'volunteers', COUNT(*) FILTER (WHERE role = 'volunteer'),
    'public_users', COUNT(*) FILTER (WHERE role = 'public_user'),
    'active_users', COUNT(*) FILTER (WHERE status = 'active'),
    'suspended_users', COUNT(*) FILTER (WHERE status = 'suspended'),
    'banned_users', COUNT(*) FILTER (WHERE status = 'banned'),
    'inactive_users', COUNT(*) FILTER (WHERE status = 'inactive')
  ) INTO result
  FROM public.profiles;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_user_management_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_management_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_management_stats() TO authenticated;
COMMENT ON FUNCTION public.get_user_management_stats IS 'Admin/Super Admin: get aggregate user statistics.';
-- Note: profiles_select_all_admin policy is now created in:
-- 20260802000001_fix_rls_recursion_profiles.sql (using user_role_cache to avoid recursion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'admin_update_user_role'
      AND p.pronargs = 2
  ) THEN
    RAISE EXCEPTION 'admin_update_user_role function not created';
  END IF;
  RAISE NOTICE 'Admin role management migration applied successfully';
END $$;
