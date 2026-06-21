# Security

## Authentication

- **Supabase Auth** with PKCE flow — no passwords transmitted to the frontend beyond the initial sign-in
- Auth emails (password reset, email verification) handled by Supabase Auth via SMTP
- Session auto-refresh handled by Supabase client

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

## Row Level Security

All Supabase tables have RLS policies enabled:

- **Public tables** — readable by anonymous (`anon`) role
- **Admin tables** — mutations restricted to `role_level >= 90`
- **User data** — users can only access their own records
- **Payment data** — donors see their own; staff see all
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

## HTTP Security Headers

Configured in `vite.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |

## Audit Logging

Every admin/mutation action calls `logAuditEvent()` which inserts into the `audit_logs` table with:
- `action` — description of what was done
- `entity_type` — the affected table
- `entity_id` — the affected row ID
- Performed by the authenticated user (via session)

Audit logs are readable only by `super_admin`.

## Database Security Hardening

From migration `20260703000001`–`20260703000003`:

- `search_path` is fixed on all functions to prevent search-path hijacking
- Functions use `SECURITY INVOKER` (not `DEFINER`) by default to prevent privilege escalation
- `REVOKE ALL ... FROM PUBLIC` applied to all tables and functions
- Anonymous role only has `EXECUTE` on specific safe RPCs
- No function relies on `public` schema being in the search path

## Storage Security

Three Supabase storage buckets with RLS:

| Bucket | Read | Write |
|--------|------|-------|
| `media` | Public (authenticated for admin operations) | Admin only |
| `payment-screenshots` | Admin/staff only | Authenticated users (own files) |
| `payment-qr-codes` | Admin only | Admin only |

## Environment Variables

Sensitive configuration is stored in environment variables:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (safe for client-side by design)
- `VITE_PUBLIC_BASE_URL` — Public base URL for auth redirects

No secrets, API keys, or tokens are hardcoded in the source code.
