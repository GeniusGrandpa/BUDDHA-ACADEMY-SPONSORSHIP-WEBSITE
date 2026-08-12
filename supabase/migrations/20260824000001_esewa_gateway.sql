BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_payment_sessions_esewa_verification
ON public.payment_sessions (verification_status)
WHERE gateway = 'esewa';

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
