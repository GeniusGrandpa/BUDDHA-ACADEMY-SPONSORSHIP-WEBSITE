-- ========================================
-- RLS Hardening: Lock down all tables to enforce strict RBAC
-- Ensures anon key compromise doesn't expose data
-- ========================================

-- 1. Revoke dangerous default grants: authenticated should not have blanket ALL
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'donation_content', 'sponsorship_content', 'volunteer_content',
      'transparency_content', 'hero_content', 'section_visibility',
      'site_images', 'footer_content', 'seo_content', 'page_headers',
      'section_content', 'payment_settings', 'audit_logs',
      'notifications', 'login_history', 'content_versions',
      'block_templates', 'page_blocks', 'pages',
      'ui_strings', 'media_library', 'page_drafts'
    ])
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM authenticated, anon', tbl);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', tbl);
  END LOOP;
END $$;

-- 2. Strengthen profiles RLS to prevent role self-escalation
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid())
    AND status IS NOT DISTINCT FROM (SELECT status FROM profiles WHERE id = auth.uid())
  );

-- 3. Add FOR ALL admin policies as catch-all on sensitive tables
CREATE POLICY "admin_all_payment_settings"
  ON payment_settings FOR ALL
  USING (public.get_user_role_level() >= 80)
  WITH CHECK (public.get_user_role_level() >= 80);

CREATE POLICY "admin_all_audit_logs"
  ON audit_logs FOR ALL
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "admin_all_notifications"
  ON notifications FOR ALL
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

-- 4. Create an RPC to check auth before sensitive operations (defense in depth)
CREATE OR REPLACE FUNCTION public.require_role(p_min_level INTEGER DEFAULT 90)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF public.get_user_role_level() < p_min_level THEN
    RAISE EXCEPTION 'Insufficient role level. Required: %, user has: %',
      p_min_level, public.get_user_role_level()
      USING ERRCODE = '42501';
  END IF;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.require_role TO authenticated;

-- 5. Super admin-only escalation protection
CREATE OR REPLACE FUNCTION public.prevent_super_admin_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'super_admin' AND OLD.role IS DISTINCT FROM 'super_admin' THEN
    IF public.get_user_role_level() < 100 THEN
      RAISE EXCEPTION 'Only a super admin can assign super_admin role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_super_admin_escalation ON profiles;
CREATE TRIGGER trg_prevent_super_admin_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.role IS DISTINCT FROM OLD.role)
  EXECUTE FUNCTION public.prevent_super_admin_escalation();

-- 6. Verify all core tables have RLS enabled
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'students', 'donations', 'sponsorships',
      'news', 'gallery_items', 'contact_submissions',
      'payment_sessions', 'payment_verifications', 'payment_settings',
      'payment_receipts', 'teacher_assignments', 'student_progress',
      'attendance_records', 'donation_allocations', 'activities',
      'donation_content', 'sponsorship_content', 'volunteer_content',
      'transparency_content', 'hero_content', 'section_visibility',
      'site_images', 'footer_content', 'seo_content', 'page_headers',
      'section_content', 'media_library', 'pages', 'page_blocks',
      'ui_strings', 'notifications', 'audit_logs', 'login_history',
      'content_versions', 'block_templates', 'page_drafts'
    ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
