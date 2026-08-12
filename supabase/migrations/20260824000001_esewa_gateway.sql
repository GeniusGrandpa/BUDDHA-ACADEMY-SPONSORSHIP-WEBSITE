-- ============================================================
-- eSewa Manual Payment Verification Migration
-- ============================================================
-- IMPORTANT:
-- This migration does NOT delete student, sponsorship, donor,
-- or payment records.
--
-- eSewa payments will remain pending until an Admin/Finance
-- user manually verifies or rejects them.
--
-- The Edge Function (esewa-callback) now:
--   1. Verifies eSewa signature + amount + transaction status
--   2. Marks payment_session as payment_received
--   3. Sets verification_status = 'pending_verification'
--   4. Finance/Admin manually verifies via verify_payment()
--   5. Admin approves via approve_payment()
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Remove ALL old eSewa automatic confirmation functions
-- ============================================================

DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT
            p.oid,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n
            ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'esewa_confirm_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.esewa_confirm_payment(%s);',
            func.args
        );
    END LOOP;
END $$;


-- ============================================================
-- 2. Remove old eSewa-specific failure function if present
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
          AND p.proname = 'esewa_fail_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.esewa_fail_payment(%s);',
            func.args
        );
    END LOOP;
END $$;


-- ============================================================
-- 3. Index for Admin/Finance pending-payment screen
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payment_sessions_esewa_verification
ON public.payment_sessions (verification_status)
WHERE gateway = 'esewa';


-- ============================================================
-- 4. Remove automatic eSewa confirmation trigger if one exists
-- ============================================================

DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT
            tg.tgname,
            c.relname AS table_name
        FROM pg_trigger tg
        JOIN pg_class c
            ON c.oid = tg.tgrelid
        JOIN pg_namespace n
            ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND NOT tg.tgisinternal
          AND (
              tg.tgname ILIKE '%esewa%'
              OR tg.tgname ILIKE '%payment_confirmation%'
          )
    LOOP
        BEGIN
            EXECUTE format(
                'DROP TRIGGER IF EXISTS %I ON public.%I;',
                trigger_record.tgname,
                trigger_record.table_name
            );
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END LOOP;
END $$;


COMMIT;


-- ============================================================
-- VERIFICATION
-- ============================================================

-- esewa_confirm_payment and esewa_fail_payment should be GONE:
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'esewa_confirm_payment',
      'esewa_fail_payment'
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
