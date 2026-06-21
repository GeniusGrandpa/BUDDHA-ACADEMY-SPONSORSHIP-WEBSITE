DO $$ DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT policyname, tablename, schemaname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'students', 'donations', 'sponsorships',
        'news', 'gallery_items', 'contact_submissions',
        'payment_sessions', 'payment_verifications', 'payment_settings', 'payment_receipts',
        'teacher_assignments', 'student_progress', 'attendance_records', 'teacher_reports',
        'donation_allocations', 'activities'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.get_user_role_level()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN CASE v_role
    WHEN 'super_admin' THEN 100
    WHEN 'admin' THEN 90
    WHEN 'finance_manager' THEN 80
    WHEN 'teacher' THEN 60
    WHEN 'donor' THEN 40
    WHEN 'volunteer' THEN 30
    WHEN 'public_user' THEN 10
    ELSE 0
  END;
END;
$$;
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "profiles_read_staff"
  ON profiles FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role IS NULL OR role = (SELECT role FROM profiles WHERE id = auth.uid())));
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "profiles_delete_super_admin"
  ON profiles FOR DELETE
  USING (public.get_user_role_level() >= 100);
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "students_select_public"
  ON students FOR SELECT
  USING (true);
CREATE POLICY "students_select_staff"
  ON students FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "students_insert_admin"
  ON students FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "students_update_admin"
  ON students FOR UPDATE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "students_delete_admin"
  ON students FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "donations_select_own"
  ON donations FOR SELECT
  USING (auth.uid() = donor_id);
CREATE POLICY "donations_select_staff"
  ON donations FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "donations_insert_own"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "donations_update_staff"
  ON donations FOR UPDATE
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "sponsorships_select_own"
  ON sponsorships FOR SELECT
  USING (auth.uid() = donor_id);
CREATE POLICY "sponsorships_select_staff"
  ON sponsorships FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "sponsorships_insert_admin"
  ON sponsorships FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "sponsorships_update_admin"
  ON sponsorships FOR UPDATE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "news_select_public"
  ON news FOR SELECT
  USING (published = true);
CREATE POLICY "news_select_admin"
  ON news FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "news_insert_admin"
  ON news FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "news_update_admin"
  ON news FOR UPDATE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "news_delete_admin"
  ON news FOR DELETE
  USING (public.get_user_role_level() >= 90);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;
CREATE POLICY "gallery_items_select_public"
  ON gallery_items FOR SELECT
  USING (is_published = true);
CREATE POLICY "gallery_items_select_admin"
  ON gallery_items FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "gallery_items_insert_admin"
  ON gallery_items FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "gallery_items_update_admin"
  ON gallery_items FOR UPDATE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "gallery_items_delete_admin"
  ON gallery_items FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "contact_submissions_insert_public"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);
CREATE POLICY "contact_submissions_select_admin"
  ON contact_submissions FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "contact_submissions_update_admin"
  ON contact_submissions FOR UPDATE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "contact_submissions_delete_admin"
  ON contact_submissions FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "payment_sessions_select_staff"
  ON payment_sessions FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_sessions_insert_staff"
  ON payment_sessions FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);
CREATE POLICY "payment_sessions_update_staff"
  ON payment_sessions FOR UPDATE
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_sessions_delete_admin"
  ON payment_sessions FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "payment_verifications_select_staff"
  ON payment_verifications FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_verifications_insert_staff"
  ON payment_verifications FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);
CREATE POLICY "payment_verifications_update_staff"
  ON payment_verifications FOR UPDATE
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_verifications_delete_admin"
  ON payment_verifications FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "payment_settings_select_staff"
  ON payment_settings FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_settings_insert_admin"
  ON payment_settings FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "payment_settings_update_staff"
  ON payment_settings FOR UPDATE
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_settings_delete_admin"
  ON payment_settings FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "payment_receipts_select_own"
  ON payment_receipts FOR SELECT
  USING (auth.uid() = (SELECT donor_id FROM donations WHERE id = payment_receipts.donation_id));
CREATE POLICY "payment_receipts_select_staff"
  ON payment_receipts FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "payment_receipts_insert_staff"
  ON payment_receipts FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);
CREATE POLICY "teacher_assignments_select_own"
  ON teacher_assignments FOR SELECT
  USING (teacher_id = auth.uid());
CREATE POLICY "teacher_assignments_select_admin"
  ON teacher_assignments FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "teacher_assignments_insert_admin"
  ON teacher_assignments FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
CREATE POLICY "teacher_assignments_delete_admin"
  ON teacher_assignments FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "student_progress_select_teacher"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = student_progress.student_id
    )
  );
CREATE POLICY "student_progress_select_admin"
  ON student_progress FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "student_progress_insert_teacher"
  ON student_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = student_progress.student_id
    )
  );
CREATE POLICY "student_progress_update_teacher"
  ON student_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = student_progress.student_id
    )
  );
CREATE POLICY "student_progress_delete_admin"
  ON student_progress FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "attendance_records_select_teacher"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = attendance_records.student_id
    )
  );
CREATE POLICY "attendance_records_select_admin"
  ON attendance_records FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "attendance_records_insert_teacher"
  ON attendance_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = attendance_records.student_id
    )
  );
CREATE POLICY "attendance_records_update_teacher"
  ON attendance_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_id = auth.uid() AND student_id = attendance_records.student_id
    )
  );
CREATE POLICY "attendance_records_delete_admin"
  ON attendance_records FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "teacher_reports_select_teacher"
  ON teacher_reports FOR SELECT
  USING (teacher_id = auth.uid());
CREATE POLICY "teacher_reports_select_admin"
  ON teacher_reports FOR SELECT
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "teacher_reports_insert_teacher"
  ON teacher_reports FOR INSERT
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher_reports_update_teacher"
  ON teacher_reports FOR UPDATE
  USING (teacher_id = auth.uid());
CREATE POLICY "teacher_reports_delete_admin"
  ON teacher_reports FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "donation_allocations_select_staff"
  ON donation_allocations FOR SELECT
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "donation_allocations_insert_staff"
  ON donation_allocations FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 80);
CREATE POLICY "donation_allocations_update_staff"
  ON donation_allocations FOR UPDATE
  USING (public.get_user_role_level() >= 80);
CREATE POLICY "donation_allocations_delete_admin"
  ON donation_allocations FOR DELETE
  USING (public.get_user_role_level() >= 90);
CREATE POLICY "activities_select_staff"
  ON activities FOR SELECT
  USING (public.get_user_role_level() >= 60);
CREATE POLICY "activities_insert_admin"
  ON activities FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);
DROP FUNCTION IF EXISTS public.admin_update_role(UUID, TEXT);
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
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can change user roles';
  END IF;
  IF new_role NOT IN ('super_admin', 'admin', 'finance_manager', 'teacher', 'donor', 'volunteer', 'public_user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF new_role != 'super_admin' THEN
    SELECT role INTO current_target_role FROM profiles WHERE id = target_user_id;
    IF current_target_role = 'super_admin' THEN
      IF (SELECT COUNT(*) FROM profiles WHERE role = 'super_admin' AND status = 'active') <= 1 THEN
        RAISE EXCEPTION 'Cannot remove the last active super administrator';
      END IF;
    END IF;
  END IF;
  UPDATE profiles SET role = new_role WHERE id = target_user_id;
  RETURN true;
END;
$$;
DROP FUNCTION IF EXISTS public.admin_update_user_status(UUID, TEXT);
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
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can change user status';
  END IF;
  IF new_status NOT IN ('active', 'inactive', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  UPDATE profiles SET status = new_status WHERE id = target_user_id;
  RETURN true;
END;
$$;