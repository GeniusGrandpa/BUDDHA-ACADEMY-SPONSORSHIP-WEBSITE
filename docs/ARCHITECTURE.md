# Architecture

## Data Flow

```
Browser ──▶ Node SSR Server (server/index.mjs) ──▶ React (entry-client / entry-server)
                │                                        │
                ├── Static assets (dist/client)          ├── Services Layer (src/services)
                ├── SSR render + status codes            ├── Context (auth, theme, language, confirm)
                └── Security headers, request IDs        └── Hooks (usePayment, useRole...)
                                                              │
                                              ┌───────────────┴───────────────┐
                                              ▼                               ▼
                                     Supabase (PostgreSQL + Auth + Storage)   Stripe API
                                              ▲                               ▲
                                              │  RPC / RLS / triggers         │  Edge Functions
                                              └── create-payment-intent ──────┘
                                                  stripe-webhook
```

The app is a Vite + React application with server-side rendering. A small Node.js
server (`server/index.mjs`) serves the production build in `NODE_ENV=production`:
it serves static assets, streams rendered HTML via `renderToPipeableStream`,
returns proper 404/500 pages, sets security headers, and writes structured JSON
logs with per-request IDs. In development, a Vite middleware plugin
(`devSsrMiddleware` in `vite.config.ts`) performs the same SSR on the Vite server.

Card payments are processed by Supabase Edge Functions that call the Stripe API;
webhook events are verified server-side and reconciled into `payment_sessions`.
Auth emails (password reset, email verification) are handled by Supabase Auth via SMTP.

## Provider Hierarchy

```
ErrorBoundary (client only)
  App
    HelmetProvider                      ── document head tags (SEO)
      LanguageProvider                  ── i18n via Google Translate + manual EN/NP/HI dict
        QueryClientProvider             ── React Query client
          ClientToaster                 ── toast notifications (react-hot-toast)
          AuthProvider                  ── user session, profile, signIn/signUp/signOut
            ThemeProvider               ── injects :root CSS vars from design_settings
              SiteBranding              ── dynamic branding (logo, favicon, fonts)
              CmsStringsProvider        ── CMS-driven UI string overrides
                ConfirmProvider         ── Promise-based useConfirm() for dialogs
                  RouterProvider        ── React Router (createBrowserRouter / createStaticRouter)
                    <Layout />          ── public pages (/, /about, /donate...)
                    <ProtectedRoute>    ── gated routes (/dashboard, /admin, /teacher...)
                      <AdminLayout />   ── admin sidebar + Outlet for /admin/*
                      <SuperAdminLayout /> ── super admin layout + Outlet
                      <DashboardPage /> ── donor/volunteer dashboard
```

## State Management

- **Server state** — fetched directly from Supabase in service layer functions, called from custom hooks in each dashboard/page
- **Auth state** — `AuthContext` holds `user`, `profile`, and provides `signIn`/`signUp`/`signOut`/`refreshProfile`
- **Theme state** — `ThemeContext` generates CSS custom properties from design tokens and injects them into `<head>` (URL-validated)
- **Language state** — `LanguageContext` manages the active language, provides `t(key)` for translations, and loads Google Translate for non-EN/NP/HI languages
- **Confirm state** — `ConfirmContext` provides a Promise-based `useConfirm()` used in place of `window.confirm()` for a consistent dialog UX
- **Local UI state** — React `useState`/`useReducer` in components

## Error Handling

- `src/lib/errors.ts` classifies and sanitizes errors (`AppError`, `getErrorMessage`, `classifyError`, `isRetryableError`). Sensitive details (SQL, paths, keys, traces) are never shown to users.
- `src/lib/logger.ts` provides level-gated client logging (`debug`/`info`/`warn`/`error`).
- `src/components/ErrorBoundary.tsx` catches render errors and logs them.
- `src/entry-client.tsx` installs global `unhandledrejection` and `error` handlers that log details and (in production) show a throttled toast.
- `server/index.mjs` logs uncaught exceptions/unhandled rejections and serves a branded 500 page instead of partial HTML.

## Code Splitting

Every page is lazy-loaded via `React.lazy()` + `Suspense` with a spinner fallback. The `LazyPage` wrapper component handles this consistently across all routes.

## Project Structure

```
src/
  ├── components/     # UI primitives (ui/), auth guards, donation/payment components
  ├── features/       # Auth, dashboards (donor, finance, sponsorship, volunteer, staff)
  ├── pages/          # Route pages (admin/, super-admin/, teacher/, 20+ public routes)
  ├── context/        # Auth, Language, Theme, CmsStrings, Confirm providers
  ├── hooks/          # useRole, usePayment, useDebounce, useWebsiteBuilder
  ├── lib/            # Supabase client, error handling, logger, permissions, audit, auth helpers
  ├── services/       # API layers (donations, payments, design, students, content, etc.)
  ├── types/          # Database, permissions, CMS, feature types
  ├── config/         # Navigation, layout definitions
  ├── routes.tsx      # Role-gated route definitions
  ├── App.tsx         # Provider hierarchy + Toaster
  ├── entry-client.tsx  # Client entry (hydration/render + global error handlers)
  └── entry-server.tsx  # Server entry (SSR with status codes)

server/
  └── index.mjs      # Production SSR server (static, gzip, headers, JSON logs, error pages)

supabase/
  ├── functions/     # Edge functions: create-payment-intent, stripe-webhook, _shared helpers
  ├── migrations/    # 80 database migrations (applied in timestamp order)
  └── config.toml    # Supabase project config (auth, storage, API, etc.)
```

## Directory Details

| Directory | Contents |
|-----------|----------|
| `src/components/ui/` | Reusable primitives: Button, Input, Textarea, Card, Badge, Tabs, LoadingSpinner, etc. |
| `src/features/auth/` | AuthProvider, ProtectedRoute, permission services, auth error handling |
| `src/features/donor-dashboard/` | Donor-specific layout, sidebar, topbar, and dashboard components |
| `src/pages/admin/` | Admin layout, dashboard, and sub-pages (students, donations, payments, website management, design) |
| `src/pages/admin/website/` | Website Management: WebsiteDashboard, WebsiteBuilder (3-panel live preview), editors (About, Contact, Campaigns, Privacy, Terms, SEO, Branding, HomePage), MediaLibrary |
| `src/pages/admin/cms/` | Collection managers (news, gallery, testimonials, FAQs, videos, navigation, etc.) |
| `src/pages/super-admin/` | Super Admin layout, user management, roles, audit logs, notifications |
| `src/services/` | 23 service files organized by domain (see SUPABASE.md) |
| `src/types/` | database.ts, permissions.ts, cms-content.ts, design.ts, payments.ts, features.ts |

## Conventions

- Named function exports, no default exports, no inline component definitions
- Functional updaters for state (`setState(prev => ...)`)
- Tailwind CSS with `cn()` for conditional classes
- `useCallback` for stable handlers, `useMemo` for derived data
- All content editable from one Website Management section — no blocks, JSON, or developer terminology
