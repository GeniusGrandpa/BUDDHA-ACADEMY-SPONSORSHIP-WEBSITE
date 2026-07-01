DROP POLICY IF EXISTS notifications_insert_system ON public.notifications;
CREATE POLICY notifications_insert_system ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
    )
  );
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_caller_status TEXT;
  v_notification_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, p.status
  INTO v_caller_role, v_caller_status
  FROM public.profiles p
  WHERE p.id = auth.uid();
  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  IF v_caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  IF v_caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can send notifications. Your role: %', v_caller_role
      USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_notification FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_notification FROM anon;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
COMMENT ON FUNCTION public.create_notification IS
  'Super admin only: create a notification for a user. Enforces role check inside SECURITY DEFINER context.';
