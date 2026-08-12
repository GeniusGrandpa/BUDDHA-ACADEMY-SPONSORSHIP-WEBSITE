-- ============================================================
-- esewa_confirm_payment and khalti_confirm_payment REMOVED
--
-- Both Edge Functions (esewa-callback, khalti-callback) now
-- do direct table updates to mark payment_sessions as
-- payment_received with verification_status = 'pending_verification'.
-- Finance/Admin manually verifies via verify_payment() then
-- approves via approve_payment().
-- ============================================================

-- Verification queries:
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
      'khalti_confirm_payment',
      'esewa_fail_payment',
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
