-- ============================================================
-- Fix eSewa payment flow
--
-- eSewa must NOT automatically confirm payments.
-- Existing payment_sessions / donations workflow is preserved.
--
-- Existing workflow:
--   payment_received
--        ↓
--   Finance verifies
--        ↓
--   Admin approves
--        ↓
--   completed
--
-- This migration only removes obsolete eSewa-specific
-- automatic confirmation functions.
-- ============================================================

BEGIN;


-- ============================================================
-- 1. Remove ALL overloaded esewa_confirm_payment functions
-- ============================================================

DO $$
DECLARE
    v_function RECORD;
BEGIN
    FOR v_function IN
        SELECT
            pg_get_function_identity_arguments(p.oid) AS arguments
        FROM pg_proc p
        JOIN pg_namespace n
            ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'esewa_confirm_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.esewa_confirm_payment(%s);',
            v_function.arguments
        );
    END LOOP;
END
$$;


-- ============================================================
-- 2. Remove an eSewa-specific failure function if present
-- ============================================================

DO $$
DECLARE
    v_function RECORD;
BEGIN
    FOR v_function IN
        SELECT
            pg_get_function_identity_arguments(p.oid) AS arguments
        FROM pg_proc p
        JOIN pg_namespace n
            ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'esewa_fail_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.esewa_fail_payment(%s);',
            v_function.arguments
        );
    END LOOP;
END
$$;


COMMIT;


-- ============================================================
-- VERIFICATION
-- ============================================================

-- Should return ZERO rows.
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


-- Existing manual verification functions should remain.
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