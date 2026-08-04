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

## Stripe Webhook

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
