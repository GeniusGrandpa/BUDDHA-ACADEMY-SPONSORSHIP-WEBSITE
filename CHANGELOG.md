## [Unreleased]

### Auth system audit & hardening
- **AuthContext `onAuthStateChange`**: `setLoading(false)` now fires on null session too — fixes perpetual loading on sign-out
- **LoginPage signup mode**: added country select field with 13 options; fixed hardcoded `'Nepal'` bug
- **AuthCallbackPage**: added `processed` ref to prevent double-processing, converted `setTimeout` to `await` with cancellation guard
- **Login history**: `navigator.userAgent` now logged on every sign-in attempt
- **Stale `.d.ts` files**: removed 157 auto-generated declaration files from source tree
- **tsconfig**: declarations now emit to `dist/types/` instead of cluttering source

### Auth restructuring
- Moved auth code into enterprise folder structure under `src/features/auth/`:
  - `providers/AuthContext.tsx` — Auth state provider
  - `guards/ProtectedRoute.tsx` — Route guard
  - `services/permissions.ts` — Permission logic
  - `types/permissions.ts` — Role/permission types
  - `utils/*.ts` — Auth helpers (validation, errors, password, session, redirect)
- Backward-compatible re-exports at all old locations — zero import changes needed

### Database linter fixes
- Applied 3 migration files resolving all `supabase db lint --linked` security warnings:
  - `20260703000001` — `search_path`, RLS, bucket policies, anon EXECUTE grants
  - `20260703000002` — fixed `assign_role_permissions` column name bug
  - `20260703000003` — `REVOKE ALL ... FROM PUBLIC`, switched safe functions to `SECURITY INVOKER`
- Result: `function_search_path_mutable`, `anon_security_defender_function_executable`, `authenticated_security_defender_function_executable` — zero remaining

### Payment workflow fix
- **Bug**: old `create_payment_session()` required a pre-existing `donations` row, allowing frontend-driven creation before verification
- **Fix**: `initiate_payment_checkout()` creates `payment_sessions` independently; `verify_payment()` RPC creates the `donations` row **only** on successful verification
- **Idempotency**: `payment_sessions.idempotency_key` with unique partial index prevents duplicate session creation
- **Frontend guard**: `createDonation()` in `src/services/donations.ts` throws — direct donation creation is disabled
- **Workflow**: Payment session created → Donor submits confirmation → Staff verifies → Donation & receipt created
- Failed/cancelled/expired/abandoned sessions never create donation records
