CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  current_target_role TEXT;
  current_target_status TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can change user roles';
  END IF;
  IF new_role NOT IN ('super_admin', 'admin', 'finance_manager', 'teacher', 'donor', 'volunteer', 'public_user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  SELECT role, status INTO current_target_role, current_target_status
  FROM profiles WHERE id = target_user_id;
  IF current_target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
  IF new_role != 'super_admin' THEN
    IF current_target_role = 'super_admin' THEN
      IF (SELECT COUNT(*) FROM profiles WHERE role = 'super_admin' AND status = 'active') <= 1 THEN
        RAISE EXCEPTION 'Cannot remove the last active super administrator';
      END IF;
    END IF;
  END IF;
  UPDATE profiles SET role = new_role WHERE id = target_user_id;
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (
    auth.uid(),
    'role.changed',
    'profile',
    target_user_id,
    jsonb_build_object(
      'previous_role', current_target_role,
      'new_role', new_role,
      'previous_status', current_target_status,
      'changed_by', auth.uid()
    ),
    now()
  );
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  current_status TEXT;
  current_user_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can change user status';
  END IF;
  IF new_status NOT IN ('active', 'inactive', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  SELECT status, role INTO current_status, current_user_role
  FROM profiles WHERE id = target_user_id;
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
  IF current_user_role = 'super_admin' AND new_status IN ('suspended', 'banned') THEN
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'super_admin' AND status = 'active') <= 1 THEN
      RAISE EXCEPTION 'Cannot suspend or ban the last active super administrator';
    END IF;
  END IF;
  UPDATE profiles SET status = new_status WHERE id = target_user_id;
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (
    auth.uid(),
    'status.' || new_status,
    'profile',
    target_user_id,
    jsonb_build_object(
      'previous_status', current_status,
      'new_status', new_status,
      'current_role', current_user_role,
      'changed_by', auth.uid()
    ),
    now()
  );
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.get_role_change_history(INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.get_role_change_history(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  actor_id UUID,
  actor_name TEXT,
  actor_email TEXT,
  target_id UUID,
  target_name TEXT,
  target_email TEXT,
  action TEXT,
  entity_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles p WHERE p.id = auth.uid();
  IF caller_role IS NULL OR (caller_role != 'super_admin' AND caller_role != 'admin') THEN
    RAISE EXCEPTION 'Only administrators can view audit history';
  END IF;
  RETURN QUERY
  SELECT
    al.id,
    al.user_id AS actor_id,
    COALESCE(ap.full_name, 'Unknown') AS actor_name,
    COALESCE(ap.email, '') AS actor_email,
    al.entity_id::uuid AS target_id,
    COALESCE(tp.full_name, 'Unknown') AS target_name,
    COALESCE(tp.email, '') AS target_email,
    al.action,
    al.entity_type,
    al.metadata,
    al.created_at
  FROM audit_logs al
  LEFT JOIN profiles ap ON ap.id = al.user_id
  LEFT JOIN profiles tp ON tp.id = al.entity_id::uuid
  WHERE al.action LIKE 'role.%' OR al.action LIKE 'status.%'
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS public.get_user_role_history(UUID, INTEGER);
CREATE OR REPLACE FUNCTION public.get_user_role_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  actor_id UUID,
  actor_name TEXT,
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles p WHERE p.id = auth.uid();
  IF caller_role IS NULL OR (caller_role != 'super_admin' AND caller_role != 'admin') THEN
    RAISE EXCEPTION 'Only administrators can view role history';
  END IF;
  RETURN QUERY
  SELECT
    al.id,
    al.user_id AS actor_id,
    COALESCE(ap.full_name, 'Unknown') AS actor_name,
    al.action,
    al.metadata,
    al.created_at
  FROM audit_logs al
  LEFT JOIN profiles ap ON ap.id = al.user_id
  WHERE al.entity_id = p_user_id::text
    AND (al.action LIKE 'role.%' OR al.action LIKE 'status.%')
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_change_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_history TO authenticated;
