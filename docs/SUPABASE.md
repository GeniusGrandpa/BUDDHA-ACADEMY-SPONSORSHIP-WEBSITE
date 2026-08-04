# Supabase Integration

## Client

Singleton `getSupabaseClient()` in `src/lib/supabase.ts` with PKCE auth flow, auto-refresh, and type-safe queries via generated `Database` types. Uses `detectSessionInUrl: true` for OAuth/email verification callback handling.

## Service Layer

One file per domain under `src/services/`. Each imports `getSupabaseClient()` locally:

| Service File | Domain |
|-------------|--------|
| `students.ts` | Student management |
| `donations.ts` | Donation records |
| `payments.ts` | Payment sessions, verification |
| `stripePayment.ts` | Stripe PaymentIntent creation (edge function) |
| `paymentSettings.ts` | Payment gateway settings |
| `profiles.ts` | User profiles |
| `design.ts` | Design settings, presets |
| `content.ts` | CMS content (pages, news, gallery, media library, etc.) |
| `cms-content.ts` | CMS page content, headers, sections, site images, strings |
| `settings.ts` | Site settings |
| `navigation.ts` | Navigation items |
| `announcements.ts` | Announcements |
| `partners.ts` | Partners |
| `news.ts` | News articles |
| `gallery.ts` | Gallery items |
| `activities.ts` | Activity log |
| `contact.ts` | Contact form submissions |
| `legal-pages.ts` | Privacy/terms legal pages |
| `volunteerEvents.ts` | Volunteer event management |
| `volunteerApplications.ts` | Volunteer applications |
| `notifications.ts` | User notifications |
| `allocations.ts` | Donation allocations |
| `website-builder.ts` | Website builder sections/state |

## Auth

- Users stored in `auth.users` (Supabase managed)
- Profiles in `public.profiles` table linked by UUID
- Role assigned via `admin_update_user_role` RPC (replaces old `admin_toggle_role`)
- Auth emails (password reset, email verification) via Supabase Auth SMTP
- PKCE flow with auto-refresh token rotation
- Email confirmations required for signup
- Session recovery on page load via `getSession()` and `onAuthStateChange`

## Row Level Security

All tables have RLS policies enforced:
- Self-role-escalation prevented at DB level
- Public tables readable by anonymous users
- Admin tables require `role_level >= 90`
- All mutations restricted to authenticated + authorized roles
- `payment_settings` SELECT available to all (public display fields only); mutations require role >= 80
- `audit_logs` readable only by super_admin

## Storage

| Bucket | Purpose | Read | Write |
|--------|---------|------|-------|
| `media` | CMS uploads | Public (authenticated for admin operations) | Admin only |
| `payment-screenshots` | Payment proof screenshots | Admin/staff only | Authenticated users (own files) |
| `payment-qr-codes` | Payment gateway QR codes | Admin only | Admin only (role >= 80) |

## Security Hardening (from migrations)

| Migration | Fix |
|-----------|-----|
| `20260607000003` | Initial security hardening: RLS on all tables, `handle_new_user()` trigger |
| `20260608000001` | Production hardening: removes demo accounts, drops `create_demo_user`, drops `admin_toggle_role` |
| `20260703000001-003` | Database linter fixes: `search_path` on functions, `SECURITY INVOKER`, `REVOKE ALL ... FROM PUBLIC` |
| `20260710000001` | Fixes admin access: `auth.role() = 'authenticated'` → `profile.role IN ('super_admin','admin')`; `GRANT ALL TO anon` → `GRANT SELECT TO anon` |
| `20260801000001` | Admin role management: `admin_update_user_role()` with hierarchy checks, last-super-admin protection, full audit logging |
| `20260802000001` | RLS recursion fix: `user_role_cache` table + `trg_sync_user_role_cache` trigger; repoints critical policies to cache |
| `20260803000001` | Audit fix: missing `updated_at` triggers on 21 tables; FK indexes on 8 tables; drops 7 legacy tables |

## Audit Logging

Every admin action calls `logAuditEvent()` which inserts into `audit_logs` table with:
- `action` — description of the action
- `entity_type` — the affected table/entity
- `entity_id` — the affected row ID
- Performed by the authenticated user

Audit logs are readable only by `super_admin`.

## Edge Functions

Deno edge functions live under `supabase/functions/` and share helpers in `supabase/functions/_shared/response.ts` (JSON response envelopes `{ success, message, errorCode }`, CORS, structured logging).

| Function | Purpose |
|----------|---------|
| `create-payment-intent` | Creates a Stripe PaymentIntent for the donor session; returns `client_secret` |
| `stripe-webhook` | Verifies Stripe webhook signatures; handles `payment_intent.succeeded/failed/canceled` and runs the corresponding RPC |

Deploy with `supabase functions deploy <name>`. Set secrets with `supabase secrets set` (see README → Supabase Setup).

## Migrations

All schema changes in `supabase/migrations/` (75 files), applied in timestamp order. Each migration is idempotent. Cumulative migration at `all_migrations.sql`.

## RPC Functions

| Function | Purpose |
|----------|---------|
| `admin_update_user_role` | Assign/change user roles with hierarchy enforcement |
| `initiate_payment_checkout` | Create payment session |
| `verify_payment` | Verify payment + create donation record |
| `stripe_confirm_payment` | Webhook: confirm card payment + create donation record |
| `stripe_fail_payment` | Webhook: mark payment failed/cancelled |
| `cancel_payment_session` | Cancel an abandoned payment session |
| `submit_payment_confirmation` | Submit manual payment reference/screenshots |
| `get_user_permissions` | Fetch custom permissions for a user |
| `reset_design_settings` | Reset design to defaults |
| `handle_new_user` | Trigger function: creates profile on signup |
| `get_user_role_level` | Returns numeric role level for RLS policies |
| `get_my_role` | Returns current user's role for RLS policies |
| `sync_user_role_cache` | Manual trigger of `user_role_cache` refresh |
| `admin_get_user_role` | Fetches a user's role (used by admin interface) |
| `get_donor_allocations` | Returns donation allocation breakdown for a donor |
| `get_donor_dashboard_stats` | Returns aggregated dashboard stats for a donor |
