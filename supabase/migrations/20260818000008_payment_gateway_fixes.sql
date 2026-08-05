DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT gateway_name
    FROM payment_settings
    GROUP BY gateway_name
    HAVING COUNT(*) > 1
  LOOP
    DELETE FROM payment_settings ps
    WHERE ps.gateway_name = rec.gateway_name
      AND ps.id NOT IN (
        SELECT ps2.id
        FROM payment_settings ps2
        WHERE ps2.gateway_name = rec.gateway_name
        ORDER BY ps2.sort_order ASC, ps2.created_at DESC
        LIMIT 1
      );
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_settings_gateway_name
  ON public.payment_settings (gateway_name);

INSERT INTO payment_settings (gateway_name, gateway_display_name, gateway_description, account_name, account_number, instructions, is_active, sort_order)
VALUES
  ('khalti', 'Khalti', 'Pay via Khalti digital wallet', 'Buddha Academy', '9800000000', 'Send payment to this Khalti ID. Include your name in the transaction note so we can verify your donation.', true, 1),
  ('esewa', 'eSewa', 'Pay via eSewa online wallet', 'Buddha Academy', '9800000000', 'Send payment to this eSewa ID. Include your name in the transaction note so we can verify your donation.', true, 2),
  ('mobile_banking', 'Mobile Banking / Fonepay', 'Bank transfer or Fonepay', 'Buddha Academy', '1234567890123456', 'Transfer to our bank account. Use "Donation" as reference and include your name.', true, 3),
  ('stripe', 'Credit / Debit Card', 'Pay securely with your credit or debit card', '', '', 'Pay securely with your card. Your payment is processed automatically by Stripe.', true, 4)
ON CONFLICT (gateway_name) DO NOTHING;

UPDATE storage.buckets
SET public = true
WHERE id = 'payment-screenshots';

DROP POLICY IF EXISTS "admin_all_payment_settings" ON public.payment_settings;

INSERT INTO public.user_role_cache (id, role, role_level, status, updated_at)
SELECT p.id, p.role, public.compute_role_level(p.role), p.status, now()
FROM public.profiles p
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  role_level = EXCLUDED.role_level,
  status = EXCLUDED.status,
  updated_at = now();
