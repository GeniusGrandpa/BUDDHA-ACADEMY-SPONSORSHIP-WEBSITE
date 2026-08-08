# Payment System

Automatic, server-verified gateway confirmations only: Khalti, eSewa and Stripe are finalized by
gateway webhooks/callbacks (Stripe webhook, eSewa signed callback + status lookup, Khalti lookup API).
There is no manual "upload a screenshot" flow and no admin "mark as paid" button.

## Flow

```
1. Donor selects amount, frequency, optional student sponsorship
        │
2. PaymentModal displays active gateways
        │
3. initiate_payment_checkout RPC creates a payment_session
        │
4. Stripe → card flow:   PaymentModal creates a PaymentIntent with
        │                session_id in metadata, shows Stripe Payment Element
        │                → payment_intent.succeeded webhook fires
        │                → stripe_confirm_payment RPC marks the session
        │                  completed and creates donation/receipt/sponsorship
        │                → the modal polls the server session status before
        │                  showing the success screen (client-side PaymentIntent
        │                  success alone is never treated as confirmation)
        │
   eSewa → hosted redirect flow (see below): esewa-callback confirms server-side
        │
   Khalti → hosted redirect flow (see below): khalti-callback confirms server-side
        │
5. All steps are audit-logged
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
- Recorded in `stripe_webhook_events` (PK `event_id`) for idempotency duplicate/retried events are ignored.
- Subscribed events:
  - `payment_intent.succeeded` → `stripe_confirm_payment` (session → `completed`, creates donation + receipt + allocations + sponsorship)
  - `payment_intent.payment_failed` → `stripe_fail_payment` (session → `failed`)
  - `payment_intent.canceled` → `stripe_fail_payment` (session → `cancelled`)
- The PaymentIntent carries the `payment_sessions.id` in `metadata.session_id`.
- Both webhook RPCs are `SECURITY DEFINER` and guarded so only `service_role`
  (never `anon`/`authenticated`) can execute them.
- `stripe_confirm_payment` is idempotent (re-entry when already `completed` is a no-op), so
  the donor's browser polling and the webhook can race without double-creating records.
- The Stripe checkout form does **not** trust the `return_url` or the client-side
  `paymentIntent.status`. After `stripe.confirmPayment` succeeds the modal polls the
  `payment_sessions.status` (flipped by the webhook) before showing the success screen.

### Configure the webhook in Stripe Dashboard

1. Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
4. Copy the signing secret (`whsec_...`) and set `STRIPE_WEBHOOK_SECRET`:
   `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
5. Also set `STRIPE_SECRET_KEY` (for `create-payment-intent`) and `SUPABASE_SERVICE_ROLE_KEY` (for the webhook):
   `supabase secrets set STRIPE_SECRET_KEY=sk_... SUPABASE_SERVICE_ROLE_KEY=...`

### Error Handling

Both edge functions return a standardized JSON envelope `{ success, message, errorCode }` via `supabase/functions/_shared/response.ts`. The client (`src/services/stripePayment.ts`, `src/hooks/usePayment.ts`, `src/lib/errors.ts`) parses this envelope, maps Stripe card errors to friendly messages (e.g. "Your card was declined"), and never surfaces raw server/Stripe messages to the UI.

### Important: Stripe is geo-restricted and does not support Nepal

Stripe does not operate in Nepal. When a request is made from a Nepal IP address to any Stripe domain
(`dashboard.stripe.com`, `js.stripe.com`, or a hosted Checkout page), Stripe returns an `AccessDenied` XML error
and the card form / dashboard will not load. This affects:

- **Stripe Dashboard** blocked outright from Nepal IPs.
- **Card payments in the browser** the Stripe Payment Element loads `js.stripe.com` in the *donor's* browser.
  A donor located in Nepal will be blocked even if the app server is hosted in a supported region, because
  Stripe.js runs client-side on the donor's machine.

Practical implications:

- **For development/testing:** use a VPN in a supported region (US/EU/UK) and keep it on for the whole
  checkout flow, or you will get intermittent failures mid-payment.
- **For real donors in Nepal:** Stripe card payments are unreliable/blocked. Khalti and eSewa (the hosted
  redirect gateways) are the reliable path for Nepal-based donors and are
  fully supported by this platform.
- **Server-side:** `STRIPE_SECRET_KEY` calls from Supabase Edge Functions work if the Supabase region is in a
  supported country only client-side browser access from Nepal is blocked. `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` are never exposed to the browser.
- Do not market the Stripe card option to Nepal-based donors as a primary payment path.

## eSewa ePay v2 Flow

eSewa uses a hosted redirect flow: the donor is sent to eSewa's login page, then returned
to the app's `success_url`/`failure_url`, where a signed callback is verified server-side
before the payment session is finalized (no manual admin review).

```
Donor picks eSewa in the PaymentModal
        │
1. /donate → PaymentModal → initiate_payment_checkout RPC (session = pending)
        │
2. EsewaPayment calls esewa-pay Edge Function (service_role)
        │        signs total_amount,transaction_uuid,product_code (HMAC-SHA256)
        │        returns { pay_url, fields }
3. Browser POSTs the hidden form to the eSewa host (sandbox rc-epay.esewa.com.np)
        │
4. Donor logs in to eSewa and confirms the payment
        │
5. eSewa redirects to success_url (/donate/esewa/return?session=…&data=<base64>)
        │        or failure_url (?session=…&failed=1)
        │
6. EsewaReturnPage calls esewa-callback Edge Function:
        │     decodes & verifies the signed callback,
        │     cross-checks total_amount vs the payment session,
        │     calls eSewa's transaction/status endpoint (requires COMPLETE),
        │     then calls esewa_confirm_payment RPC (session → completed + donation/receipt)
        │  failed → esewa_fail_payment (session → cancelled)
        │
7. Donor sees a success/failure page, then navigates to their donations
```

#### Apps

- `supabase/functions/esewa-pay/index.ts` — signs the request and returns the eSewa form.
- `supabase/functions/esewa-callback/index.ts` — verifies the callback + status, confirms.
- `src/services/esewaPay.ts` — client wrapper (`initiateEsewaPayment`, `confirmEsewaPayment`).
- `src/components/payments/esewa/EsewaPayment.tsx` — payment modal gateway UI.
- `src/pages/EsewaReturnPage.tsx` — return/confirmation page (`/donate/esewa/return`).
- DB: `esewa_confirm_payment` / `esewa_fail_payment` (migration `20260824000001_esewa_gateway.sql`)

#### Configure the eSewa gateway

The edge functions read the following Supabase function secrets (never exposed to the browser):

```sh
supabase secrets set \
  ESEWA_ENVIRONMENT=uat \
  ESEWA_MERCHANT_CODE=EPAYTEST \
  ESEWA_SECRET_KEY='8gBm/:&EnhH.1/q' \
  ESEWA_RETURN_URL=https://your-public-domain.example \
  SUPABASE_SERVICE_ROLE_KEY=...
```

- Sandbox form/status URLs are `https://rc-epay.esewa.com.np/...`; production uses
  `https://epay.esewa.com.np` and `https://esewa.com.np`.
- Sandbox test donor: eSewa ID `9711111111`, password `Nepal@123`, token `123456`,
  merchant code `EPAYTEST`.
- **Important:** eSewa redirects to a *publicly reachable* `success_url`/`failure_url`.
  `localhost` will not work in the sandbox — use a tunnel (ngrok) during local development.
- Return URL precedence: the frontend sends `VITE_PUBLIC_BASE_URL` (falling back to
  `window.location.origin`) to `esewa-pay`, which uses it as the base for
  `success_url`/`failure_url`. The `ESEWA_RETURN_URL` secret is only a fallback when the
  client sends no return URL. These are Edge Function secrets (`supabase secrets set`),
  not `.env` variables — see `.env.example`.
- The signed callback alone does not prevent replay; the status endpoint + amount
  cross-check is the authority before a session is confirmed.

## Khalti ePayment Flow

Khalti uses a server-to-server initiate + hosted redirect + lookup-verify flow (KPG-2):

```
Donor picks Khalti in the PaymentModal
        │
1. /donate → PaymentModal → initiate_payment_checkout RPC (session = pending)
        │
2. KhaltiPayment calls khalti-pay Edge Function (service_role)
        │        POSTs amount (in paisa) + purchase_order_id to Khalti /epayment/initiate/
        │        returns { pidx, payment_url }
3. Browser redirects (GET) the donor to payment_url (test-pay.khalti.com)
        │
4. Donor logs in to Khalti and confirms the payment
        │
5. Khalti redirects to return_url (/donate/khalti/return?session=…&pidx=…&status=…)
        │
6. KhaltiReturnPage calls khalti-callback Edge Function:
        │     POSTs pidx to Khalti /epayment/lookup/
        │     requires lookup status = Completed
        │     cross-checks total_amount (paisa→NPR) vs the payment session
        │     then calls khalti_confirm_payment RPC (session → completed + donation/receipt)
        │  canceled/expired → khalti_fail_payment (session → cancelled/failed)
        │  pending/initiated → session held for later confirmation
        │
7. Donor sees a success/failure page, then navigates to their donations
```

Only `status == Completed` from the lookup API is treated as success. `User canceled`,
`Expired` are treated as failed; other statuses are held.

#### Apps

- `supabase/functions/khalti-pay/index.ts` — initiates the payment with Khalti and returns `payment_url`.
- `supabase/functions/khalti-callback/index.ts` — verifies via the lookup API, confirms/fails.
- `src/services/khaltiPay.ts` — client wrapper (`initiateKhaltiPayment`, `confirmKhaltiPayment`).
- `src/components/payments/khalti/KhaltiPayment.tsx` — payment modal gateway UI (auto-redirect).
- `src/pages/KhaltiReturnPage.tsx` — return/confirmation page (`/donate/khalti/return`).
- DB: `khalti_confirm_payment` / `khalti_fail_payment` (migration `20260825000001_khalti_gateway.sql`)

#### Configure the Khalti gateway

The edge functions read the following Supabase function secrets (never exposed to the browser):

```sh
supabase secrets set \
  KHALTI_ENVIRONMENT=test \
  KHALTI_SECRET_KEY=live_secret_key_... \
  KHALTI_WEBSITE_URL=https://your-public-domain.example \
  KHALTI_RETURN_URL=https://your-public-domain.example \
  SUPABASE_SERVICE_ROLE_KEY=...
```

- Sandbox API base is `https://dev.khalti.com/api/v2`; production uses `https://khalti.com/api/v2`.
- In `test` mode the payment page is `https://test-pay.khalti.com`; in production `https://pay.khalti.com`.
- Sandbox test donor: Khalti test ID `9800000000`, MPIN `1111`, OTP `987654`
  (use your `live_secret_key` from `admin.khalti.com` / `test-admin.khalti.com`).
- The `return_url` must be a **publicly reachable** URL. `localhost` will not work — use a tunnel (ngrok)
  during local development. Return URL precedence: the frontend sends `VITE_PUBLIC_BASE_URL`
  (falling back to `window.location.origin`) to `khalti-pay`; `KHALTI_RETURN_URL` is only a
  fallback secret (`supabase secrets set`) when the client sends none — see `.env.example`.
- The lookup API is the authoritative confirmation; the client-passed `status` is only informational.

#### Payment setting: `is_automated`

All supported gateways (Khalti, eSewa, Stripe) are `is_automated = true` — they redirect to a hosted
gateway and are confirmed server-side by webhook/callback, so the admin UI hides the account/QR/instructions
fields for them. The manual `mobile_banking` gateway (bank transfer / Fonepay) was removed as a public
payment option; its `payment_settings` row is deactivated (`is_active = false`) and historical
`payment_sessions`/`donations` rows are retained.

## Key Design Decisions

- `initiate_payment_checkout()` creates `payment_sessions` independently no pre-existing donation required
- `stripe_confirm_payment()` / `esewa_confirm_payment()` / `khalti_confirm_payment()` create the `donations`
  row **only** after a server-verified gateway confirmation (signature verified, amount/currency matched,
  idempotent, service_role only)
- `payment_sessions.idempotency_key` with unique partial index prevents duplicate session creation
- Direct `donations` table inserts are disabled frontend `createDonation()` throws
- Failed/cancelled/expired/abandoned sessions never create donation records
- `updateDonationStatus()` also sets `verified_by` and `verified_at` when status changes to `completed`

## Payment Setting Fields

The `payment_settings` table stores only display-facing configuration (no API keys):
- `gateway_name`, `gateway_display_name`, `gateway_description`
- `qr_image_url`, `account_name`, `account_number`, `instructions`
- `is_active`, `is_automated`, `sort_order`

Actual payment gateway secrets are stored server-side in Supabase project configuration, not in the database.

## Admin Payment Pages

| Page | Route | Purpose |
|------|-------|---------|
| Payment Transactions | `/admin/payments/verify` | Read-only view of gateway-confirmed transaction/status history |
| Payment Settings | `/admin/payments/settings` | Gateway config (automated gateways only) |
