# Security

## Authentication

- **Supabase Auth** with PKCE flow no passwords transmitted to the frontend beyond the initial sign-in
- Auth emails (password reset, email verification) handled by Supabase Auth via SMTP
- Session auto-refresh handled by Supabase client with refresh token rotation
- Session recovery on page load via `supabase.auth.getSession()` and `onAuthStateChange` subscription
- Email confirmations required for signup (`enable_confirmations = true`)
- `secure_password_change = true` password change requires current password confirmation
- **Minimum password length: 8 characters** with complexity requirements (uppercase, lowercase, number, special character) enforced server-side
- **TOTP MFA** enabled for admin accounts (enrollment + verification) via Supabase Auth
- Unrecognized auth errors always return a generic message (`'Unable to complete this action. Please try again later.'`) never raw server errors
- Login history logged to `login_history` table (no user-agent tracking removed for privacy)

## Authorization (RBAC)

Access control is enforced at three independent layers:

| Layer | Mechanism | Bypass Protection |
|-------|-----------|-------------------|
| **Route** | `ProtectedRoute` fetches role from `AuthContext` on every navigation | Server-side role check; redirects denied users to their dashboard |
| **Client** | Permission helpers (`hasRole`, `hasPermission`, `canEdit`, ...) guard buttons and sections | Hides actions the user cannot perform |
| **Server** | RLS policies + guarded `SECURITY DEFINER` RPC functions | Client cannot bypass checks even with direct API calls |

- `super_admin` bypasses all checks by convention
- Suspended/banned users are detected server-side and signed out with access revoked message
- Self-role-escalation is prevented at the database level
- Last super_admin removal is protected by server-side constraints

## Row Level Security

All Supabase tables have RLS policies enabled:

- **Public tables** readable by anonymous (`anon`) role
- **Admin tables** mutations restricted to `role_level >= 90`
- **User data** users can only access their own records
- **Payment data** donors see their own; staff see all
- **Payment settings** SELECT available to all (display-only fields no API keys stored); mutations restricted to role >= 80
- **System tables** (audit_logs, user management) `super_admin` only

## Payment Security

- **No direct donation creation** frontend `createDonation()` throws; only the gateway-confirmation RPC
  (`stripe_confirm_payment`) can create donation records, and only after a server-verified gateway confirmation
- **Manual verification for eSewa/Khalti** the eSewa and Khalti callbacks mark `payment_sessions` as
  `payment_received` + `pending_verification`; Finance/Admin must manually verify via `verify_payment()`
  then approve via `approve_payment()` before a donation record is created
- **No client-trusted status** payments are never confirmed from the browser, URL/query params, or
  client-supplied status/amount/IDs. Confirmation requires a verified Stripe webhook signature, an eSewa
  HMAC-SHA256 signature + transaction status lookup, or a Khalti lookup API `Completed` status
- **Idempotency** `payment_sessions.idempotency_key` with unique partial index prevents duplicate session
  creation; confirmation RPCs early-return when a session is already `completed`; Stripe webhook events are
  deduplicated in `stripe_webhook_events` (PK `event_id`)
- **Separation of concerns** `initiate_payment_checkout()` creates a `payment_session` independently; the
  gateway RPCs create the `donations` row **only** on successful server-verified confirmation
- **Audit logging** every payment action (session creation, verification, failure) is logged to `audit_logs`
- Failed/cancelled/expired/abandoned sessions never create donation records

## Input Handling

- TypeScript strict mode enforces type safety at compile time
- Rich text content can be sanitized with **DOMPurify** (available in dependencies)
- File uploads sanitize filenames before storage (`${sessionId}-${Date.now()}.${fileExt}`)
- SQL injection prevented by using Supabase client (parameterized queries) and RPC functions
- Dynamic CSS/URL injection from CMS settings is mitigated via `isTrustedUrl()` validation before DOM injection

## Error Handling & Logging

- **Client** `src/lib/errors.ts` (`AppError`, `classifyError`, `getErrorMessage`) sanitizes errors before they reach the UI: sensitive details (SQL, Postgres codes, paths, API keys, stack traces) are mapped to generic messages. `src/lib/logger.ts` gates log output by level.
- **Global handlers** `src/entry-client.tsx` installs `unhandledrejection` and `error` listeners that log details and (in production only) show a throttled user-friendly toast.
- **SSR server** `server/index.mjs` writes structured JSON logs with a per-request `X-Request-Id`, logs uncaught exceptions and unhandled rejections, and serves a branded 500 page instead of partial HTML when a render fails. Edge functions log structured errors server-side and return only safe messages to clients.

## HTTP Security Headers

Set on both the Vite dev server (`vite.config.ts`) and the production SSR server (`server/index.mjs`):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |
| `X-Request-Id` | `randomUUID()` (server) | Request correlation ID in logs and responses |

## SPA Routing Security

- In development, Vite serves the app (with SSR middleware); in production, the Node SSR server (`server/index.mjs`) serves static assets and streamed HTML with proper 404 responses for unknown paths no blind SPA fallback that returns HTTP 200 for missing routes
- Auth callback URLs validated server-side by Supabase against configured redirect URL whitelist

## Audit Logging

Every admin/mutation action calls `logAuditEvent()` which inserts into the `audit_logs` table with:
- `action`  description of what was done
- `entity_type`  the affected table
- `entity_id` the affected row ID
- Performed by the authenticated user (via session)

Audit logs are readable only by `super_admin`.

## Database Connection Security (SSL)

The application never connects to PostgreSQL directly the browser and the SSR
server talk to Supabase exclusively over HTTPS (REST/PostgREST), which is always
TLS-encrypted. The CA certificate below is only required for **direct
PostgreSQL connections** (psql, pgAdmin, DBeaver, or a server-side `pg` client)
so the database server certificate can be validated with `sslmode=verify-full`.

- **CA bundle**: `server/certs/prod-ca-2021.crt` (Supabase Root 2021 CA)
- **Connection string pattern** (transaction pooler, port 6543):

  ```
  postgresql://postgres.<project-ref>@<region>.pooler.supabase.com:6543/postgres?sslmode=verify-full&sslrootcert=server/certs/prod-ca-2021.crt
  ```

- Connection strings are kept out of source code; use the `DATABASE_URL`
  variable documented in `.env.example`.
- **SSL enforcement**: enable "Enforce SSL" in Supabase Dashboard →
  Database → Connection security so the server rejects any non-TLS connection.

### Restricting remote database access

"Only the app can reach the database" is enforced at the platform level not in
application code. Complete these in Supabase Dashboard → Project Settings →
Database:

1. **Disable the public session pooler / direct connection** unless an
   admin tool (psql/pgAdmin) needs it. Keep only the transaction pooler if any
   backend must connect, and restrict it by IP.
2. **IPv4-only mode** blocks IPv6 direct connections.
3. **Network restrictions** add an IP allowlist containing only your
   deployment hosts' egress IPs (e.g. Vercel/Netlify/Railway/Render). Leave
   the allowlist empty only if all direct connections are disabled.
4. Keep **`postgres` superuser and service-role secrets** out of any client
   bundle; only the anon key is public and it is scoped by RLS.

Verification:
```bash
psql "postgresql://postgres.<project-ref>@<region>.pooler.supabase.com:6543/postgres?sslmode=verify-full&sslrootcert=server/certs/prod-ca-2021.crt"
```

## Database Security Hardening

From migrations `20260607000003`–`20260803000001`:

- `search_path` is fixed on all functions to prevent search-path hijacking
- Functions use `SECURITY INVOKER` (not `DEFINER`) by default to prevent privilege escalation
- `REVOKE ALL ... FROM PUBLIC` applied to all tables and functions
- Anonymous role only has `EXECUTE` on specific safe RPCs
- No function relies on `public` schema being in the search path
- Old `auth.role() = 'authenticated'` policies replaced with `profile.role IN ('super_admin','admin')` prevents any authenticated user from accessing admin data
- Demo accounts and `create_demo_user` function removed in production hardening
- `admin_toggle_role` function removed; replaced by `admin_update_user_role` with strict hierarchy and audit

## Storage Security

Two Supabase storage buckets with RLS:

| Bucket | Read | Write |
|--------|------|-------|
| `media` | Public (authenticated for admin operations) | Admin only |
| `payment-qr-codes` | Admin only | Admin only (role >= 80) |

## Environment Variables

Sensitive configuration is stored in environment variables (see `.env.example`):
- `VITE_SUPABASE_URL` Supabase project URL
- `VITE_SUPABASE_ANON_KEY` Supabase anonymous key (safe for client-side by design)
- `VITE_PUBLIC_BASE_URL` Public base URL for auth redirects
- `VITE_STRIPE_PUBLISHABLE_KEY` Stripe publishable key (browser)
- `STRIPE_SECRET_KEY` Stripe secret key (Edge Function secret, server-side only)
- `STRIPE_WEBHOOK_SECRET` Stripe webhook signing secret (Edge Function secret, server-side only)
- `SUPABASE_SERVICE_ROLE_KEY` Supabase service role key (Edge Function secret, server-side only)
- `KHALTI_ENVIRONMENT` Khalti environment (`test`/`production`) (Edge Function secret, server-side only)
- `KHALTI_SECRET_KEY` Khalti secret key (Edge Function secret, server-side only)
- `KHALTI_WEBSITE_URL` / `KHALTI_RETURN_URL` Khalti public URLs
- `SUPABASE_JWKS_URL` Optional JWKS URL used by the SSR server

No secrets, API keys, or tokens are hardcoded in the source code. The Supabase service role key and Stripe secret keys are never exposed to the frontend.

## Security Events

All sensitive authentication and authorization events are logged:
- Login attempts(success/failure)
- Password resets
- Role changes (audited via `admin_update_user_role`)
- Suspended/banned account access attempts
- All payment verification actions
