# Buddha Academy Sponsorship Platform

NGO management platform for student sponsorships, donations, and community engagement. Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase.

## Architecture

### Data Flow

```
Browser ──▶ React SPA ──▶ Services Layer ──▶ Supabase (PostgreSQL + Auth + Storage)
                │                                   │
                ├── Pages (lazy-loaded routes)       ├── Row Level Security
                ├── Features (role dashboards)       ├── Database triggers
                ├── Context (auth, theme, i18n)      └── RPC functions
                └── Hooks (usePayment, useRole...)
```

The app is a single-page application (Vite + React) that communicates directly with Supabase — no custom backend server. Every service file (`src/services/*.ts`) calls `getSupabaseClient()` to make authenticated requests. Supabase enforces Row Level Security on all tables and provides Auth (PKCE flow), PostgreSQL, and file storage.

### Component Hierarchy

```
<ErrorBoundary>                          ── catches runtime errors
  <App>
    <Toaster />                          ── toast notifications (react-hot-toast)
    <LanguageProvider>                   ── i18n via Google Translate + manual EN/NP/HI dict
      <AuthProvider>                     ── user session, profile, signIn/signUp/signOut
        <ThemeProvider>                  ── injects :root CSS vars from design_settings
          <RouterProvider>               ── React Router (createBrowserRouter)
            <Layout />                   ── public pages (/, /about, /donate...)
            <ProtectedRoute>             ── gated routes (/dashboard, /admin, /teacher...)
              <AdminLayout />            ── admin sidebar + Outlet for /admin/*
              <SuperAdminLayout />       ── super admin layout + Outlet
              <DashboardPage />          ── donor/volunteer dashboard
```

### Routing

All routes are defined in a single `createBrowserRouter` config with lazy-loaded pages:

- **Public routes** (under `<Layout />`): Home, About, Sponsorship, Students, Gallery, News, Contact, Donate, Transparency, FAQ, Volunteer, Login, Auth callback
- **Protected routes**: `/dashboard` (donor/volunteer), `/admin/*` (admin/finance), `/super-admin/*` (super_admin only), `/teacher` (teacher only)
- `ProtectedRoute` double-checks role against Supabase on every navigation; redirects denied users to their role-appropriate dashboard

### Code Splitting

Every page is lazy-loaded via `React.lazy()` + `Suspense` with a spinner fallback. The `LazyPage` wrapper component handles this consistently across all routes.

### State Management

- **Server state** — fetched directly from Supabase in service layer functions, called from custom hooks in each dashboard/page
- **Auth state** — `AuthContext` holds `user`, `profile`, and provides `signIn`/`signUp`/`signOut`/`refreshProfile`
- **Theme state** — `ThemeContext` generates CSS custom properties from design tokens and injects them into `<head>`
- **Language state** — `LanguageContext` manages the active language, provides `t(key)` for translations, and loads Google Translate for non-EN/NP/HI languages
- **Local UI state** — React `useState`/`useReducer` in components

### Supabase Layer

- **Client**: Singleton `getSupabaseClient()` with PKCE auth, auto-refresh, and typed queries via generated `Database` types
- **Services**: One file per domain (`src/services/payments.ts`, `design.ts`, `content.ts`, `students.ts`, etc.) each imports `getSupabaseClient()` locally
- **Auth**: Users stored in `auth.users` (Supabase managed); profiles in `public.profiles` table linked by UUID; role assigned via `admin_toggle_role` RPC
- **Storage**: Buckets for `media` (CMS uploads), `payment-screenshots`, `payment-qr-codes`
- **Row Level Security**: All tables have RLS policies; self-role-escalation is prevented at the DB level
- **Audit logging**: Every admin action calls `logAuditEvent()` which inserts into the `audit_logs` table
- **Migrations**: All schema changes in `supabase/migrations/`, applied in order

## Tech Stack

**React 18** · **TypeScript** · **Vite 8** · **Tailwind CSS** · **Supabase** (PostgreSQL, Auth, RLS, Storage) · **React Router** · **Framer Motion** · **Lucide React** · **Recharts** · **jsPDF** · **react-hot-toast** · **Tiptap** (rich text) · **@hello-pangea/dnd** (drag-and-drop)

## Features

### RBAC (7 roles)

Role-based access enforced at three layers:

- **Route level** — `ProtectedRoute` checks the user's role from Supabase `profiles` table on every navigation; redirects denied users to their role-appropriate dashboard. Handles suspended/banned users.
- **Component level** — `PermissionGuard` conditionally renders children based on `permission`, `anyPermission`, `allPermissions`, or `roles` props.
- **Function level** — `useProtectedAction` wraps callbacks and silently denies execution without the required permission.

Permissions are defined as a static map (`DEFAULT_ROLE_PERMISSIONS: Role -> PermissionCode[]`) with optional server-side overrides via `supabase.rpc('get_user_permissions')`. Super admin bypasses all checks. Navigation sidebar is filtered per role via `getNavigationForRole()`.

### Payment System (Khalti / eSewa / Mobile Banking)

No external SDKs , it uses a manual confirmation + admin verification workflow:

1. **DonationForm** lets the user select amount, frequency, and optional student sponsorship.
2. **PaymentModal** displays active gateways (QR codes, account details) from the `payment_settings` table.
3. **usePayment** hook drives the state machine: `initiate_payment_checkout` (RPC) creates a `payment_session`, user pays externally, then submits a transaction reference ID + screenshot.
4. **AdminPaymentVerificationPage** lets admins review and verify/reject pending sessions via `verify_payment` (RPC), which creates a `donations` record and `payment_receipt` server-side.
5. All steps are audit-logged.

### Theme Designer (CSS Variables)

Design tokens are stored as JSONB in the `design_settings` Supabase table with a draft/publish workflow:

- **ThemeContext** fetches published settings, generates `:root { --color-primary: ...; --font-heading: ... }` CSS, and injects it into `<head>`. Google Fonts are loaded dynamically.
- **8 admin pages** (Branding, Colors, Typography, Layout, Components, Config, Presets) allow granular control over 40+ color variables, font settings, spacing, radii, shadows, and animation toggles.
- `theme_presets` table stores named presets; `applyThemePreset()` copies values into `design_settings`.

### CMS & Page Builder

Two approaches for content management:

- **Dynamic page builder** — `DynamicPage` component fetches a `pages` row by slug, renders each `PageBlock` through `BlockRenderer` (16 block types: hero, text, image, gallery, cta, donation, student_cards, testimonials, faq, stats, timeline, video, partners, announcements, custom_section). Blocks are reorderable, have visibility toggles, and store content as JSONB.
- **Structured static pages** — `AdminPageEditor` provides form-based editing for predefined pages (about, contact, volunteer, privacy, terms) using a `PAGE_META` config per page.
- **Homepage editor** — section-based editor for homepage sections (hero, stats, features, cta) from the `homepage_sections` table.
- **Dedicated managers** for news, gallery, video, testimonials, student stories, FAQs, partners, announcements, navigation, media library, and transparency content — all following the same pattern: query Supabase table → render form → persist with audit logging.

### Internationalization

Hybrid approach:

- **Manual dictionary** — `LanguageContext` provides a `t(key)` function that looks up ~50 UI string keys from hardcoded dictionaries for English, Nepali, and Hindi. Falls back to English, then the raw key.
- **Google Translate** — for all other languages, the app dynamically loads Google Translate's widget, sets the `googtrans` cookie, and programmatically triggers translation.
- RTL support for Arabic, Persian, Hebrew, and Urdu.
- Language preference persisted to `localStorage`.

### Dashboards

Each dashboard is a self-contained feature directory under `src/features/`:

```
{role}-dashboard/
  components/   view-specific components
  hooks/        custom data-fetching hooks (Supabase queries with loading/error states)
  pages/        main DashboardPage
  layouts/      responsive sidebar + topbar layout
  charts/       Recharts components
  types/        feature-specific types
```

**Donor dashboard** is the most built-out: ~10 hooks coordinate donations, sponsorships, impact metrics, notifications, activity feed, sponsorship timeline, teacher reports, and allocation breakdowns. Other dashboards (sponsorship, staff, volunteer) follow the same pattern.

### Supabase Integration

- **Singleton client** with PKCE auth flow, auto-refresh, and type-safe queries via generated `Database` types.
- **Service layer** each domain (payments, content, design) has its own service file that calls `getSupabaseClient()` locally.
- **Row Level Security** on all tables with self-role-escalation prevention.
- Audit logging on all admin actions via `logAuditEvent()`.

## Setup

```bash
npm install
```

Create `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev        # → http://localhost:5174
npm run build      # → dist/
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

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
```

## Deployment

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages. Set environment variables. Update Supabase Auth Site URL and redirect URLs to point to production. Configure SMTP for email verification.

## Conventions

- Named function exports, no default exports, no inline component definitions
- Functional updaters for state (`setState(prev => ...)`)
- Tailwind CSS with `cn()` for conditional classes
- `useCallback` for stable handlers, `useMemo` for derived data
