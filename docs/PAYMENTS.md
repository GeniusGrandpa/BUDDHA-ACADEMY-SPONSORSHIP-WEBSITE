# Payment System

Hybrid flow: manual confirmation + admin verification for bank / eSewa / Khalti, and automatic Stripe webhook verification for card payments.

## Flow

```
1. Donor selects amount, frequency, optional student sponsorship
        │
2. PaymentModal displays active gateways (QR codes, account details)
        │
3. initiate_payment_checkout RPC creates a payment_session
        │
4. Stripe → card flow:   PaymentModal creates a PaymentIntent with
        │                session_id in metadata, shows Stripe Payment Element
        │                → payment_intent.succeeded webhook fires
        │                → stripe_confirm_payment RPC marks the session
        │                  completed and creates donation/receipt/sponsorship
        │                (no manual admin review required for cards)
        │
   Manual → bank/eSewa/Khalti flow:
        │
5. Donor pays externally, submits transaction reference ID + screenshot
        │
6. AdminPaymentVerificationPage — admin reviews and verifies/rejects
        │
7. verify_payment RPC creates donations record + payment_receipt
        │
8. All steps are audit-logged
```

## Stripe Card Flow

### create-payment-intent Edge Function

- Edge function: `supabase/functions/create-payment-intent/index.ts`
- Called by `src/services/stripePayment.ts` (wrapped in `StripePaymentWrapper`)
- Validates the amount/frequency and creates a Stripe PaymentIntent with `metadata.session_id`, then returns `{ client_secret }` to the client
- Reads `STRIPE_SECRET_KEY` from Supabase function secrets (never exposed to the browser)

### Stripe Webhook

- Edge function: `supabase/functions/stripe-webhook/index.ts`
- Verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.
- Recorded in `stripe_webhook_events` (PK `event_id`) for idempotency — duplicate/retried events are ignored.
- Subscribed events:
  - `payment_intent.succeeded` → `stripe_confirm_payment` (session → `completed`, creates donation + receipt + allocations + sponsorship)
  - `payment_intent.payment_failed` → `stripe_fail_payment` (session → `failed`)
  - `payment_intent.canceled` → `stripe_fail_payment` (session → `cancelled`)
- The PaymentIntent carries the `payment_sessions.id` in `metadata.session_id`.
- Both webhook RPCs are `SECURITY DEFINER` and guarded so only `service_role`
  (never `anon`/`authenticated`) can execute them.
- `submit_payment_confirmation` and `stripe_confirm_payment` are idempotent, so
  the donor's browser and the webhook can race without double-creating records.

### Configure the webhook in Stripe Dashboard

1. Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
4. Copy the signing secret (`whsec_...`) and set `STRIPE_WEBHOOK_SECRET`:
   `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
5. Also set `STRIPE_SECRET_KEY` (for `create-payment-intent`) and `SUPABASE_SERVICE_ROLE_KEY` (for the webhook):
   `supabase secrets set STRIPE_SECRET_KEY=sk_... SUPABASE_SERVICE_ROLE_KEY=...`

### Error Handling

Both edge functions return a standardized JSON envelope — `{ success, message, errorCode }` — via `supabase/functions/_shared/response.ts`. The client (`src/services/stripePayment.ts`, `src/hooks/usePayment.ts`, `src/lib/errors.ts`) parses this envelope, maps Stripe card errors to friendly messages (e.g. "Your card was declined"), and never surfaces raw server/Stripe messages to the UI.

### Important: Stripe is geo-restricted and does not support Nepal

Stripe does not operate in Nepal. When a request is made from a Nepal IP address to any Stripe domain
(`dashboard.stripe.com`, `js.stripe.com`, or a hosted Checkout page), Stripe returns an `AccessDenied` XML error
and the card form / dashboard will not load. This affects:

- **Stripe Dashboard** — blocked outright from Nepal IPs.
- **Card payments in the browser** — the Stripe Payment Element loads `js.stripe.com` in the *donor's* browser.
  A donor located in Nepal will be blocked even if the app server is hosted in a supported region, because
  Stripe.js runs client-side on the donor's machine.

Practical implications:

- **For development/testing:** use a VPN in a supported region (US/EU/UK) and keep it on for the whole
  checkout flow, or you will get intermittent failures mid-payment.
- **For real donors in Nepal:** Stripe card payments are unreliable/blocked. Bank, eSewa, and Khalti (the
  manual verification gateways) are the reliable path for Nepal-based donors and are fully supported by this
  platform.
- **Server-side:** `STRIPE_SECRET_KEY` calls from Supabase Edge Functions work if the Supabase region is in a
  supported country — only client-side browser access from Nepal is blocked. `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` are never exposed to the browser.
- Do not market the Stripe card option to Nepal-based donors as a primary payment path.

## Key Design Decisions

- `initiate_payment_checkout()` creates `payment_sessions` independently — no pre-existing donation required
- `verify_payment()` RPC creates the `donations` row **only** on successful verification
- `stripe_confirm_payment()` (webhook) creates the `donations` row as soon as Stripe confirms the card charge
- `payment_sessions.idempotency_key` with unique partial index prevents duplicate session creation
- Direct `donations` table inserts are disabled — frontend `createDonation()` throws
- Failed/cancelled/expired/abandoned sessions never create donation records
- `updateDonationStatus()` also sets `verified_by` and `verified_at` when status changes to `completed`

## Payment Setting Fields

The `payment_settings` table stores only display-facing configuration (no API keys):
- `gateway_name`, `gateway_display_name`, `gateway_description`
- `qr_image_url`, `account_name`, `account_number`, `instructions`
- `is_active`, `sort_order`

Actual payment gateway secrets are stored server-side in Supabase project configuration, not in the database.

## Admin Payment Pages

| Page | Route | Purpose |
|------|-------|---------|
| Payment Verification | `/admin/payments/verify` | Review/verify/reject |
| Payment Settings | `/admin/payments/settings` | Gateway config, QR codes |
