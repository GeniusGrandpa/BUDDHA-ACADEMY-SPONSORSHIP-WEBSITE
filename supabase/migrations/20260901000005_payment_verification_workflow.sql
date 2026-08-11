ALTER TABLE payment_sessions
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending_verification'
  CHECK (verification_status IN ('pending_verification', 'verified', 'rejected'));

ALTER TABLE payment_sessions
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_notes text;

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending_verification'
  CHECK (verification_status IN ('pending_verification', 'verified', 'rejected'));

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_notes text;

ALTER TABLE payment_sessions
  DROP CONSTRAINT IF EXISTS payment_sessions_status_check;
ALTER TABLE payment_sessions
  ADD CONSTRAINT payment_sessions_status_check
  CHECK (status IN ('pending', 'processing', 'payment_received', 'completed', 'failed', 'cancelled'));

ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations
  ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'processing', 'payment_received', 'verified', 'completed', 'failed', 'rejected', 'cancelled'));

UPDATE payment_sessions
SET status = 'payment_received', verification_status = 'pending_verification',
    verified_by = NULL, verified_at = NULL, verification_notes = NULL
WHERE status = 'completed';

UPDATE donations
SET status = 'payment_received', verification_status = 'pending_verification',
    verified_by = NULL, verified_at = NULL
WHERE status = 'completed';
