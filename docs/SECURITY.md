# Security

## Authentication

- **Supabase Auth** with PKCE flow — no passwords transmitted to the frontend beyond the initial sign-in
- Auth emails (password reset, email verification) handled by Supabase Auth via SMTP
- Session auto-refresh handled by Supabase client with refresh token rotation
- Session recovery on page load via `supabase.auth.getSession()` and `onAuthStateChange` subscription
- Email confirmations required for signup (`enable_confirmations = true`)
- `secure_password_change = true` — password change requires current password confirmation
- **Minimum password length: 8 characters** with complexity requirements (uppercase, lowercase, number, special character) enforced server-side
- **TOTP MFA** enabled for admin accounts (enrollment + verification) via Supabase Auth
- Unrecognized auth errors always return a generic message (`'Unable to complete this action. Please try again later.'`) — never raw server errors
- Login history logged to `login_history` table (no user-agent tracking — removed for privacy)

## Authorization (RBAC)

Access control is enforced at three independent layers:

| Layer | Mechanism | Bypass Protection |
|-------|-----------|-------------------|
| **Route** | `ProtectedRoute` fetches role from `profiles` table on every navigation | Server-side role check; redirects denied users to their dashboard |
| **Component** | `PermissionGuard` conditionally renders UI | Hides actions the user cannot perform |
| **Function** | `useProtectedAction` wraps callbacks | Silently denies execution without permission |

- `super_admin` bypasses all checks by convention
- Suspended/banned users are detected server-side and signed out with access revoked message
- Self-role-escalation is prevented at the database level
- Last super_admin removal is protected by server-side constraints

## Row Level Security

All Supabase tables have RLS policies enabled:

- **Public tables** — readable by anonymous (`anon`) role
- **Admin tables** — mutations restricted to `role_level >= 90`
- **User data** — users can only access their own records
- **Payment data** — donors see their own; staff see all
- **Payment settings** — SELECT available to all (display-only fields — no API keys stored); mutations restricted to role >= 80
- **System tables** (audit_logs, user management) — `super_admin` only

## Payment Security

- **No direct donation creation** — frontend `createDonation()` throws; only the `verify_payment` RPC (server-side) can create donation records
- **Idempotency** — `payment_sessions.idempotency_key` with unique partial index prevents duplicate session creation
- **Separation of concerns** — `initiate_payment_checkout()` creates a `payment_session` independently; `verify_payment()` creates the `donations` row **only** on successful admin verification
- **Audit logging** — every payment action (session creation, verification, rejection) is logged to `audit_logs`
- Failed/cancelled/expired/abandoned sessions never create donation records

## Input Handling

- TypeScript strict mode enforces type safety at compile time
- Rich text content can be sanitized with **DOMPurify** (available in dependencies)
- File uploads sanitize filenames before storage (`${sessionId}-${Date.now()}.${fileExt}`)
- SQL injection prevented by using Supabase client (parameterized queries) and RPC functions
- Dynamic CSS/URL injection from CMS settings is mitigated via `isTrustedUrl()` validation before DOM injection

## HTTP Security Headers

Configured in `vite.config.ts` (dev/preview server only — production platform must replicate these):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |

## SPA Routing Security

- All routes serve `index.html` via Vite's built-in dev/preview server (no platform-specific configs)
- Auth callback URLs validated server-side by Supabase against configured redirect URL whitelist

## Audit Logging

Every admin/mutation action calls `logAuditEvent()` which inserts into the `audit_logs` table with:
- `action` — description of what was done
- `entity_type` — the affected table
- `entity_id` — the affected row ID
- Performed by the authenticated user (via session)

Audit logs are readable only by `super_admin`.

## Database Connection Security (SSL)

The application never connects to PostgreSQL directly — the browser and the SSR
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

"Only the app can reach the database" is enforced at the platform level — not in
application code. Complete these in Supabase Dashboard → Project Settings →
Database:

1. **Disable the public session pooler / direct connection** unless an
   admin tool (psql/pgAdmin) needs it. Keep only the transaction pooler if any
   backend must connect, and restrict it by IP.
2. **IPv4-only mode** — blocks IPv6 direct connections.
3. **Network restrictions** — add an IP allowlist containing only your
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
- Old `auth.role() = 'authenticated'` policies replaced with `profile.role IN ('super_admin','admin')` — prevents any authenticated user from accessing admin data
- Demo accounts and `create_demo_user` function removed in production hardening
- `admin_toggle_role` function removed; replaced by `admin_update_user_role` with strict hierarchy and audit

## Storage Security

Three Supabase storage buckets with RLS:

| Bucket | Read | Write |
|--------|------|-------|
| `media` | Public (authenticated for admin operations) | Admin only |
| `payment-screenshots` | Admin/staff only | Authenticated users (own files) |
| `payment-qr-codes` | Admin only | Admin only (role >= 80) |

## Environment Variables

Sensitive configuration is stored in environment variables:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (safe for client-side by design)
- `VITE_PUBLIC_BASE_URL` — Public base URL for auth redirects

No secrets, API keys, or tokens are hardcoded in the source code. The Supabase service role key is never exposed to the frontend.

## Security Events

All sensitive authentication and authorization events are logged:
- Login attempts (success/failure)
- Password resets
- Role changes (audited via `admin_update_user_role`)
- Suspended/banned account access attempts
- All payment verification actions
