-- =============================================================
-- Fix all Supabase database linter warnings
-- Categories:
--   1. function_search_path_mutable     (11 functions)
--   2. rls_policy_always_true           (3 policies)
--   3. public_bucket_allows_listing     (1 bucket policy)
--   4. anon_security_definer_function_executable
--   5. authenticated_security_definer_function_executable
-- =============================================================

-- =============================================================
-- SECTION 1: Fix function_search_path_mutable
-- Add SET search_path = public to all functions missing it
-- =============================================================

-- generate_transaction_id() - from 20260610000001
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 8));
    new_id := 'BA-' || year_part || '-' || random_part;
    IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE transaction_id = new_id) THEN
      RETURN new_id;
    END IF;
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique transaction ID';
    END IF;
  END LOOP;
END;
$$;

-- generate_receipt_number() - from 20260610000001
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 6));
    new_id := 'RCT-' || year_part || '-' || random_part;
    IF NOT EXISTS (SELECT 1 FROM payment_receipts WHERE receipt_number = new_id) THEN
      RETURN new_id;
    END IF;
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique receipt number';
    END IF;
  END LOOP;
END;
$$;

-- assign_donation_allocations() - from 20260611000001
CREATE OR REPLACE FUNCTION assign_donation_allocations(
  p_donation_id UUID,
  p_allocations JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor_role TEXT;
  v_allocation RECORD;
  v_total_percentage NUMERIC;
  v_donation_amount NUMERIC;
BEGIN
  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can assign allocations';
  END IF;
  SELECT amount INTO v_donation_amount FROM donations WHERE id = p_donation_id;
  IF v_donation_amount IS NULL THEN
    RAISE EXCEPTION 'Donation not found';
  END IF;
  SELECT SUM((value->>'percentage')::NUMERIC) INTO v_total_percentage
  FROM jsonb_array_elements(p_allocations) AS value;
  IF v_total_percentage != 100 THEN
    RAISE EXCEPTION 'Allocation percentages must total 100%%';
  END IF;
  DELETE FROM donation_allocations WHERE donation_id = p_donation_id;
  FOR v_allocation IN
    SELECT
      (value->>'category')::TEXT AS category,
      (value->>'percentage')::NUMERIC AS percentage
    FROM jsonb_array_elements(p_allocations) AS value
  LOOP
    INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
    VALUES (
      p_donation_id,
      v_allocation.category,
      v_allocation.percentage,
      v_donation_amount * (v_allocation.percentage / 100)
    );
  END LOOP;
  RETURN true;
END;
$$;

-- get_donor_allocations() - from 20260611000001
CREATE OR REPLACE FUNCTION get_donor_allocations(p_donor_id UUID)
RETURNS TABLE (
  donation_id UUID,
  category TEXT,
  allocation_percentage NUMERIC,
  amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- get_donor_dashboard_stats() - from 20260612000001
CREATE OR REPLACE FUNCTION get_donor_dashboard_stats(p_donor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- log_activity() (regular function, not trigger) - from 20260612000001
CREATE OR REPLACE FUNCTION log_activity(
  p_activity_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO activities (user_id, activity_type, title, description, entity_type, entity_id, is_public, metadata)
  VALUES (v_user_id, p_activity_type, p_title, p_description, p_entity_type, p_entity_id, p_is_public, p_metadata)
  RETURNING id INTO v_activity_id;
  RETURN v_activity_id;
END;
$$;

-- update_updated_at_column() - from 20260620000001 (overwrites 20260607000003 version)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- set_published_at() - from 20260620000001
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- generate_slug() - from 20260620000001
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT, table_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(BOTH '-' FROM base_slug);
  final_slug := base_slug;
  LOOP
    IF table_name = 'news' THEN
      IF NOT EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) THEN
        EXIT;
      END IF;
    END IF;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$;

-- is_admin_or_super_admin() - from 20260620000001
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN
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

-- log_content_change() - from 20260620000001
CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  entity_name TEXT;
  action_type TEXT;
  changes_json JSONB;
BEGIN
  entity_name := TG_TABLE_NAME;
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    changes_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    changes_json := to_jsonb(OLD);
  END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata)
  VALUES (
    auth.uid(),
    action_type || ' ' || entity_name,
    entity_name,
    COALESCE(NEW.id, OLD.id)::TEXT,
    changes_json,
    jsonb_build_object('table', entity_name, 'op', TG_OP)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- create_content_version() - from 20260701000003
CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO current_version
  FROM public.content_versions
  WHERE entity_type = TG_TABLE_NAME
  AND entity_id = COALESCE(NEW.id, OLD.id);
  INSERT INTO public.content_versions (
    entity_type, entity_id, entity_slug, version_number, title, content, published, created_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(
      (CASE
        WHEN TG_TABLE_NAME = 'pages' THEN (NEW.content->>'slug')
        WHEN TG_TABLE_NAME = 'news' THEN (NEW.content->>'slug')
        ELSE NULL
      END),
      (SELECT slug FROM public.pages WHERE id = COALESCE(NEW.id, OLD.id))
    ),
    current_version,
    CASE
      WHEN TG_TABLE_NAME = 'pages' THEN COALESCE(NEW.title, OLD.title)
      WHEN TG_TABLE_NAME = 'news' THEN COALESCE(NEW.title, OLD.title)
      ELSE ''
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    COALESCE(NEW.published, OLD.published, false),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================================
-- SECTION 2: Fix rls_policy_always_true
-- Tighten policies that use USING(true) or WITH CHECK(true)
-- =============================================================

-- contact_submissions_insert_public: require non-empty required fields
DROP POLICY IF EXISTS "contact_submissions_insert_public" ON contact_submissions;
CREATE POLICY "contact_submissions_insert_public"
  ON contact_submissions FOR INSERT
  WITH CHECK (
    name IS NOT NULL AND name != '' AND
    email IS NOT NULL AND email != '' AND
    message IS NOT NULL AND message != ''
  );

-- system_insert_email_logs: restrict to admin/super_admin users
DROP POLICY IF EXISTS "system_insert_email_logs" ON email_logs;
CREATE POLICY "system_insert_email_logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role_level() >= 80);

-- payment_audit_logs_insert: restrict to finance roles
DROP POLICY IF EXISTS "payment_audit_logs_insert" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_insert"
  ON payment_audit_logs FOR INSERT
  WITH CHECK (get_user_role_level() >= 80);

-- =============================================================
-- SECTION 3: Fix public_bucket_allows_listing
-- Restrict media bucket SELECT to authenticated users only
-- (bucket is public so direct URL access still works)
-- =============================================================

DROP POLICY IF EXISTS "media_select_public" ON storage.objects;
CREATE POLICY "media_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- =============================================================
-- SECTION 4: Fix anon_security_definer_function_executable
-- Revoke EXECUTE from anon for all functions, re-grant only
-- safe read-only functions needed by the frontend
-- =============================================================

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Re-grant only safe read-only functions that the frontend may
-- call before authentication
GRANT EXECUTE ON FUNCTION public.get_user_role_level TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_role TO anon;

-- =============================================================
-- SECTION 5: Fix authenticated_security_definer_function_executable
-- Add authorization checks to functions that lack them
-- =============================================================

-- assign_role_permissions() - added auth check (was unprotected)
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

-- expire_abandoned_payment_sessions() - add admin check
CREATE OR REPLACE FUNCTION expire_abandoned_payment_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF public.get_my_role() NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Only admins can expire payment sessions';
  END IF;
  UPDATE payment_sessions
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending'
  AND created_at < now() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
