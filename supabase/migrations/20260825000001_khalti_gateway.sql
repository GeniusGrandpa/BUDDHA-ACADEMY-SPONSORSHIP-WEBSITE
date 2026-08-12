-- ============================================================
-- Khalti Gateway: Manual Verification Migration
-- ============================================================
-- IMPORTANT:
-- Khalti payments will remain pending until an Admin/Finance
-- user manually verifies or rejects them.
--
-- The Edge Function (khalti-callback) now:
--   1. Looks up payment status with Khalti API
--   2. Verifies amount matches
--   3. Marks payment_session as payment_received
--   4. Sets verification_status = 'pending_verification'
--   5. Finance/Admin manually verifies via verify_payment()
--   6. Admin approves via approve_payment()
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Mark automated gateways so existing manual settings
--    don't conflict.
-- ============================================================
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS is_automated BOOLEAN NOT NULL DEFAULT false;

UPDATE public.payment_settings
SET is_automated = true
WHERE gateway_name IN ('khalti', 'stripe');

-- Refresh the existing Khalti payment setting row so the old
-- manual account/QR/instruction data does not surface anywhere
-- in checkout.
UPDATE public.payment_settings
SET gateway_display_name = 'Khalti',
    gateway_description = 'Pay securely with your Khalti digital wallet',
    account_name = '',
    account_number = '',
    qr_image_url = NULL,
    instructions = 'You will be redirected to Khalti to complete your donation securely.',
    updated_at = now()
WHERE gateway_name = 'khalti';


-- ============================================================
-- 2. Remove automatic Khalti confirmation function
-- ============================================================

DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n
            ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'khalti_confirm_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.khalti_confirm_payment(%s);',
            func.args
        );
    END LOOP;
END $$;


-- ============================================================
-- 3. Remove automatic Khalti failure function
-- ============================================================

DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n
            ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'khalti_fail_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.khalti_fail_payment(%s);',
            func.args
        );
    END LOOP;
END $$;


-- ============================================================
-- 4. Index for Admin/Finance pending-payment screen
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payment_sessions_khalti_verification
ON public.payment_sessions (verification_status)
WHERE gateway = 'khalti';


COMMIT;


-- ============================================================
-- VERIFICATION
-- ============================================================

-- khalti_confirm_payment and khalti_fail_payment should be GONE:
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'khalti_confirm_payment',
      'khalti_fail_payment'
  );

-- Existing manual verification functions should remain:
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'verify_payment',
      'approve_payment',
      'reject_payment'
  )
ORDER BY p.proname;
