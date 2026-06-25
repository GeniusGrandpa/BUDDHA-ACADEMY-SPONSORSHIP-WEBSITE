# Architecture

## Data Flow

```
Browser ──▶ React SPA ──▶ Services Layer ──▶ Supabase (PostgreSQL + Auth + Storage)
                │                                   │
                ├── Pages (lazy-loaded routes)       ├── Row Level Security
                ├── Features (role dashboards)       ├── Database triggers
                ├── Context (auth, theme, language)  └── RPC functions
                └── Hooks (usePayment, useRole...)
```

The app is a single-page application (Vite + React) that communicates directly with Supabase — no custom backend server. Auth emails (password reset, email verification) are handled by Supabase Auth via SMTP.

## Provider Hierarchy

```
<ErrorBoundary>
  <App>
    <Toaster />                         ── toast notifications (react-hot-toast)
    <LanguageProvider>                  ── i18n via Google Translate + manual EN/NP/HI dict
      <AuthProvider>                    ── user session, profile, signIn/signUp/signOut
        <ThemeProvider>                 ── injects :root CSS vars from design_settings
          <RouterProvider>              ── React Router (createBrowserRouter)
            <Layout />                  ── public pages (/, /about, /donate...)
            <ProtectedRoute>            ── gated routes (/dashboard, /admin, /teacher...)
              <AdminLayout />           ── admin sidebar + Outlet for /admin/*
              <SuperAdminLayout />      ── super admin layout + Outlet
              <DashboardPage />         ── donor/volunteer dashboard
```

## State Management

- **Server state** — fetched directly from Supabase in service layer functions, called from custom hooks in each dashboard/page
- **Auth state** — `AuthContext` holds `user`, `profile`, and provides `signIn`/`signUp`/`signOut`/`refreshProfile`
- **Theme state** — `ThemeContext` generates CSS custom properties from design tokens and injects them into `<head>` (URL-validated)
- **Language state** — `LanguageContext` manages the active language, provides `t(key)` for translations, and loads Google Translate for non-EN/NP/HI languages
- **Local UI state** — React `useState`/`useReducer` in components

## Code Splitting

Every page is lazy-loaded via `React.lazy()` + `Suspense` with a spinner fallback. The `LazyPage` wrapper component handles this consistently across all routes.

## Project Structure

```
src/
  ├── components/     # UI primitives (ui/), auth guards, donation/payment components
  ├── features/       # Auth, dashboards (donor, finance, sponsorship, volunteer, staff)
  ├── pages/          # Route pages (admin/, super-admin/, teacher/, 20+ public routes)
  ├── context/        # Auth, Language (Google Translate), Theme providers
  ├── hooks/          # useRole, usePermissions, useProtectedAction, useToast, usePayment
  ├── lib/            # cn() utility, Supabase client, audit logger
  ├── services/       # API layers (donations, payments, design, students, content, etc.)
  ├── types/          # Database, permissions, CMS, feature types
  ├── config/         # Navigation, layout definitions
  ├── routes.tsx      # Role-gated route definitions
  ├── App.tsx         # Provider hierarchy + Toaster
  └── main.tsx        # Entry point with ErrorBoundary

supabase/
  ├── migrations/     # 50+ database migrations (applied in timestamp order)
  └── config.toml     # Supabase project config (auth, storage, API, etc.)
```

## Directory Details

| Directory | Contents |
|-----------|----------|
| `src/components/ui/` | Reusable primitives: Button, Input, Textarea, Card, Badge, Tabs, Modal, Toast, LoadingSpinner, etc. |
| `src/features/auth/` | AuthProvider, ProtectedRoute, LoginForm, SignupForm, permission services, auth error handling |
| `src/features/donor-dashboard/` | Donor-specific layout, sidebar, topbar, and dashboard components |
| `src/pages/admin/` | Admin layout, dashboard, and sub-pages (students, donations, payments, website management, design) |
| `src/pages/admin/website/` | Website Management: WebsiteDashboard, WebsiteBuilder (3-panel live preview), editors (About, Contact, Campaigns, Privacy, Terms, SEO, Branding), MediaLibrary |
| `src/pages/admin/cms/` | Legacy CMS editors (redirected to /admin/website/* but still usable) |
| `src/pages/super-admin/` | Super Admin layout, user management, roles, audit logs, notifications |
| `src/services/` | ~20 service files organized by domain (see SUPABASE.md) |
| `src/types/` | database.ts (auto-generated), permissions.ts, cms-content.ts, design.ts, payments.ts |

## Conventions

- Named function exports, no default exports, no inline component definitions
- Functional updaters for state (`setState(prev => ...)`)
- Tailwind CSS with `cn()` for conditional classes
- `useCallback` for stable handlers, `useMemo` for derived data
- All content editable from one Website Management section — no blocks, JSON, or developer terminology
