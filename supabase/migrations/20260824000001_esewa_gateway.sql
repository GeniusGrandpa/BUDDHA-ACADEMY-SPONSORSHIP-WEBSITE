-- ============================================================
-- eSewa Manual Payment Verification Migration
-- ============================================================
-- IMPORTANT:
-- This migration does NOT delete student, sponsorship, donor,
-- or payment records.
--
-- eSewa payments will remain pending until an Admin/Finance
-- user manually verifies or rejects them.
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
-- 2. Add manual verification fields to payments
-- ============================================================

DO $$
BEGIN

    -- Verification status
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN verification_status TEXT
        DEFAULT 'pending';
    END IF;


    -- Who verified/rejected the payment
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN verified_by UUID;
    END IF;


    -- Verification timestamp
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN verified_at TIMESTAMPTZ;
    END IF;


    -- Admin/Finance notes
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'verification_notes'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN verification_notes TEXT;
    END IF;

END $$;


-- ============================================================
-- 3. Make sure verification status is valid
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payments_verification_status_check'
          AND conrelid = 'public.payments'::regclass
    ) THEN
        ALTER TABLE public.payments
        ADD CONSTRAINT payments_verification_status_check
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected'
            )
        );
    END IF;
END $$;


-- ============================================================
-- 4. Existing payments become pending unless already verified
-- ============================================================

UPDATE public.payments
SET verification_status = 'pending'
WHERE verification_status IS NULL;


-- ============================================================
-- 5. Function: Admin/Finance verifies an eSewa payment
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_esewa_payment(
    p_payment_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN

    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;


    -- Make sure the payment exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.payments
        WHERE id = p_payment_id
    ) THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;


    -- Only eSewa payments
    IF NOT EXISTS (
        SELECT 1
        FROM public.payments
        WHERE id = p_payment_id
          AND LOWER(COALESCE(payment_method, '')) = 'esewa'
    ) THEN
        RAISE EXCEPTION 'Payment is not an eSewa payment';
    END IF;


    UPDATE public.payments
    SET
        verification_status = 'verified',
        verified_by = current_user_id,
        verified_at = NOW(),
        verification_notes = p_notes
    WHERE id = p_payment_id;


    RETURN TRUE;

END;
$$;


-- ============================================================
-- 6. Function: Admin/Finance rejects an eSewa payment
-- ============================================================

CREATE OR REPLACE FUNCTION public.reject_esewa_payment(
    p_payment_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN

    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;


    -- Make sure the payment exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.payments
        WHERE id = p_payment_id
    ) THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;


    -- Only eSewa payments
    IF NOT EXISTS (
        SELECT 1
        FROM public.payments
        WHERE id = p_payment_id
          AND LOWER(COALESCE(payment_method, '')) = 'esewa'
    ) THEN
        RAISE EXCEPTION 'Payment is not an eSewa payment';
    END IF;


    UPDATE public.payments
    SET
        verification_status = 'rejected',
        verified_by = current_user_id,
        verified_at = NOW(),
        verification_notes = p_notes
    WHERE id = p_payment_id;


    RETURN TRUE;

END;
$$;


-- ============================================================
-- 7. Index for Admin/Finance pending-payment screen
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payments_esewa_verification_status
ON public.payments (verification_status)
WHERE LOWER(COALESCE(payment_method, '')) = 'esewa';


-- ============================================================
-- 8. Remove automatic eSewa confirmation trigger if one exists
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


-- ============================================================
-- 9. Explicitly remove the old automatic function again
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
          AND p.proname = 'esewa_confirm_payment'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS public.esewa_confirm_payment(%s);',
            func.args
        );
    END LOOP;
END $$;


COMMIT;


-- ============================================================
-- 10. Verification queries
-- ============================================================

-- This should return ZERO rows:
SELECT
    p.oid,
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'esewa_confirm_payment';


-- Check the new verification functions:
SELECT
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'verify_esewa_payment',
      'reject_esewa_payment'
  );


-- Check the payment verification columns:
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payments'
  AND column_name IN (
      'verification_status',
      'verified_by',
      'verified_at',
      'verification_notes'
  )
ORDER BY column_name;