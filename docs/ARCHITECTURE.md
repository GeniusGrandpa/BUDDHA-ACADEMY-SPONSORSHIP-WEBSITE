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
- **Theme state** — `ThemeContext` generates CSS custom properties from design tokens and injects them into `<head>`
- **Language state** — `LanguageContext` manages the active language, provides `t(key)` for translations, and loads Google Translate for non-EN/NP/HI languages
- **Local UI state** — React `useState`/`useReducer` in components

## Code Splitting

Every page is lazy-loaded via `React.lazy()` + `Suspense` with a spinner fallback. The `LazyPage` wrapper component handles this consistently across all routes.

## Project Structure

```
src/
  ├── components/     # UI primitives (ui/), auth guards, blocks, donate, payments
  ├── features/       # Auth, dashboards (donor, finance, sponsorship, volunteer, staff)
  ├── pages/          # Route pages (admin/, super-admin/, teacher/, 20+ public routes)
  ├── context/        # Auth, Language (Google Translate), Theme providers
  ├── hooks/          # useRole, usePermissions, useProtectedAction, useToast, usePayment
  ├── lib/            # cn() utility, Supabase client, audit logger
  ├── services/       # API layers (donations, payments, design, students, content, etc.)
  ├── types/          # Database, permissions, feature types
  ├── config/         # Navigation, layout definitions
  ├── routes.tsx      # Role-gated route definitions
  ├── App.tsx         # Provider hierarchy + Toaster
  └── main.tsx        # Entry point with ErrorBoundary

supabase/
  ├── migrations/     # Database migrations (applied in order)
  └── config.toml     # Supabase project config
```

## Conventions

- Named function exports, no default exports, no inline component definitions
- Functional updaters for state (`setState(prev => ...)`)
- Tailwind CSS with `cn()` for conditional classes
- `useCallback` for stable handlers, `useMemo` for derived data
