CREATE OR REPLACE FUNCTION submit_payment_confirmation(
  p_session_id UUID,
  p_screenshots TEXT[] DEFAULT '{}'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  SELECT d.donor_id INTO v_donor_id
  FROM payment_sessions ps
  JOIN donations d ON d.id = ps.donation_id
  WHERE ps.id = p_session_id;
  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this payment session';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE id = p_session_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Payment session is not in pending state';
  END IF;
  UPDATE payment_sessions
  SET status = 'processing',
      screenshots = array_cat(screenshots, p_screenshots),
      updated_at = now()
  WHERE id = p_session_id;
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (p_session_id, 'submitted', 'Donor submitted payment confirmation');
  UPDATE donations SET status = 'processing', updated_at = now()
  WHERE id = (SELECT donation_id FROM payment_sessions WHERE id = p_session_id);
  RETURN true;
END;
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_level TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_role TO anon;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active');
$$;
CREATE OR REPLACE FUNCTION public.current_user_has_role(role_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = role_name AND status = 'active');
$$;
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
END;
$$;
CREATE OR REPLACE FUNCTION get_donor_allocations(p_donor_id UUID)
RETURNS TABLE (
  donation_id UUID,
  category TEXT,
  allocation_percentage NUMERIC,
  amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  IF p_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you can only view your own allocations';
  END IF;
  RETURN QUERY
  SELECT da.donation_id, da.category, da.allocation_percentage, da.amount, da.created_at
  FROM donation_allocations da
  JOIN donations d ON d.id = da.donation_id
  WHERE d.donor_id = p_donor_id
  ORDER BY da.created_at DESC;
END;
$$;
CREATE OR REPLACE FUNCTION get_donor_dashboard_stats(p_donor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  result JSONB;
  v_total_donated NUMERIC;
  v_active_sponsorships INTEGER;
  v_total_students INTEGER;
  v_last_donation_date TIMESTAMPTZ;
  v_pending_notifications INTEGER;
BEGIN
  IF p_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM donations WHERE donor_id = p_donor_id AND status IN ('completed', 'verified');
  SELECT COUNT(*) INTO v_active_sponsorships
  FROM sponsorships WHERE donor_id = p_donor_id AND status = 'active';
  SELECT COUNT(DISTINCT student_id) INTO v_total_students
  FROM sponsorships WHERE donor_id = p_donor_id;
  SELECT MAX(created_at) INTO v_last_donation_date
  FROM donations WHERE donor_id = p_donor_id AND status IN ('completed', 'verified');
  SELECT COUNT(*) INTO v_pending_notifications
  FROM notifications WHERE user_id = p_donor_id AND read = false;
  result := jsonb_build_object(
    'total_donated', v_total_donated,
    'active_sponsorships', v_active_sponsorships,
    'total_students', v_total_students,
    'last_donation_date', v_last_donation_date,
    'unread_notifications', v_pending_notifications
  );
  RETURN result;
END;
$$;
