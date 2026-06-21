# Supabase Integration

## Client

Singleton `getSupabaseClient()` with PKCE auth flow, auto-refresh, and type-safe queries via generated `Database` types.

## Service Layer

One file per domain under `src/services/`. Each imports `getSupabaseClient()` locally:

| Service File        | Domain                   |
|---------------------|--------------------------|
| `auth.ts`           | Authentication           |
| `students.ts`       | Student management       |
| `donations.ts`      | Donation records         |
| `payments.ts`       | Payment sessions         |
| `design.ts`         | Design settings, presets |
| `content.ts`        | CMS content (pages, news, gallery, etc.) |
| `settings.ts`       | Site settings            |
| `navigation.ts`     | Navigation items         |
| `announcements.ts`  | Announcements            |
| `partners.ts`       | Partners                 |
| `pageBlocks.ts`     | Page blocks and SEO      |

## Auth

- Users stored in `auth.users` (Supabase managed)
- Profiles in `public.profiles` table linked by UUID
- Role assigned via `admin_toggle_role` RPC
- Auth emails (password reset, email verification) via Supabase Auth SMTP

## Row Level Security

All tables have RLS policies:
- Self-role-escalation is prevented at the DB level
- Public tables are readable by anonymous users
- Admin tables require role_level >= 90
- All mutations are restricted to authenticated + authorized roles

## Storage

| Bucket               | Purpose                  |
|----------------------|--------------------------|
| `media`              | CMS uploads              |
| `payment-screenshots`| Payment proof screenshots|
| `payment-qr-codes`   | Payment gateway QR codes |

## Audit Logging

Every admin action calls `logAuditEvent()` which inserts into `audit_logs` table with:
- `action` — description of the action
- `entity_type` — the affected table/entity
- `entity_id` — the affected row ID
- Performed by the authenticated user

## Migrations

All schema changes in `supabase/migrations/`, applied in order. Each migration is timestamped and idempotent.

## RPC Functions

| Function                          | Purpose                                  |
|-----------------------------------|------------------------------------------|
| `admin_toggle_role`               | Assign/change user roles                 |
| `initiate_payment_checkout`       | Create payment session                   |
| `verify_payment`                  | Verify payment + create donation record  |
| `get_user_permissions`            | Fetch custom permissions for a user      |
| `reset_design_settings`           | Reset design to defaults                 |
