CREATE TABLE IF NOT EXISTS teacher_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  subject TEXT,
  grade_achieved TEXT,
  attendance_rate NUMERIC(5,2),
  achievements TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  teacher_notes TEXT,
  report_card_url TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_reports_student ON teacher_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_teacher ON teacher_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_date ON teacher_reports(report_date DESC);

ALTER TABLE teacher_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_reports_teacher_insert" ON teacher_reports;
CREATE POLICY "teacher_reports_teacher_insert"
  ON teacher_reports FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "teacher_reports_teacher_select" ON teacher_reports;
CREATE POLICY "teacher_reports_teacher_select"
  ON teacher_reports FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = auth.uid() AND ta.student_id = teacher_reports.student_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "teacher_reports_donor_select" ON teacher_reports;
CREATE POLICY "teacher_reports_donor_select"
  ON teacher_reports FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM sponsorships s
      WHERE s.student_id = teacher_reports.student_id AND s.donor_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'donation_received', 'donation_verified', 'sponsorship_started',
    'report_uploaded', 'student_progress', 'achievement',
    'volunteer_signup', 'new_student', 'impact_update',
    'payment_verified', 'receipt_generated', 'milestone'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  entity_type TEXT,
  entity_id UUID,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_public ON activities(is_public, created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_select_own" ON activities;
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_public = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "activities_insert_admin" ON activities;
CREATE POLICY "activities_insert_admin"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS title TEXT;

DROP POLICY IF EXISTS "student_progress_select" ON student_progress;
DROP POLICY IF EXISTS "student_progress_select_enhanced" ON student_progress;
CREATE POLICY "student_progress_select_enhanced"
  ON student_progress FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = auth.uid() AND ta.student_id = student_progress.student_id)
    OR (
      is_public = true
      AND EXISTS (SELECT 1 FROM sponsorships s WHERE s.student_id = student_progress.student_id AND s.donor_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE INDEX IF NOT EXISTS idx_donations_donor_status ON donations(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsorships_donor_status ON sponsorships(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id, recorded_at DESC);

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
SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION get_donor_dashboard_stats(p_donor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teacher_reports') THEN ALTER PUBLICATION supabase_realtime ADD TABLE teacher_reports; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activities') THEN ALTER PUBLICATION supabase_realtime ADD TABLE activities; END IF; END $$;