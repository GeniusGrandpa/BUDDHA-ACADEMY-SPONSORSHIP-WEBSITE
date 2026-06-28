-- Audit fix migration: missing indexes and updated_at triggers
-- Generated from production readiness audit

-- 1. Add missing updated_at triggers on tables that have the column but no trigger
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT DISTINCT c.table_name::text
    FROM information_schema.columns c
    WHERE c.column_name = 'updated_at'
      AND c.table_schema = 'public'
      AND c.table_name NOT IN (
        SELECT tgrelid::regclass::text
        FROM pg_trigger
        WHERE tgname LIKE 'trg_%_updated_at'
      )
      AND c.table_name NOT IN ('profiles', 'students', 'donations', 'sponsorships', 'news')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I; CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- 2. Add missing indexes on foreign key columns for frequently-joined tables
CREATE INDEX IF NOT EXISTS idx_payment_sessions_verified_by ON payment_sessions(verified_by);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_donation_id ON payment_sessions(donation_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_student_id ON payment_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_payment_session_id ON payment_verifications(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_verified_by ON payment_verifications(verified_by);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_session_id ON payment_receipts(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_donation_id ON payment_receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_payment_session_id ON payment_audit_logs(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_actor_id ON payment_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_session_id ON donations(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_donations_verified_by ON donations(verified_by);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_student_id ON teacher_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_teacher_id ON student_progress(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_teacher_id ON teacher_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_student_id ON teacher_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- 3. Drop legacy tables if they still exist
DROP TABLE IF EXISTS public.user_teams;
DROP TABLE IF EXISTS public.user_departments;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.departments;
DROP TABLE IF EXISTS public.approvals;
DROP TABLE IF EXISTS public.invitations;
DROP TABLE IF EXISTS public.user_roles;
