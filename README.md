# Buddha Academy Sponsorship Platform

NGO management platform for student sponsorships, donations, and community engagement. Built with React 18, TypeScript, Vite 8, Tailwind CSS, and Supabase.

## Architecture

The application is a single-page application that communicates directly with Supabase. There is no custom backend server. Authentication emails are handled by Supabase Auth via SMTP.

```
Browser -> React SPA -> Services Layer -> Supabase (PostgreSQL + Auth + Storage)
```

The provider hierarchy wraps the entire application:

```
ErrorBoundary > App > Toaster > LanguageProvider > AuthProvider > ThemeProvider > RouterProvider
```

- LanguageProvider manages i18n with manual dictionaries for English, Nepali, and Hindi, plus Google Translate for other languages
- AuthProvider holds the user session and profile, and provides signIn/signUp/signOut functions
- ThemeProvider fetches published design settings from Supabase, generates CSS custom properties, and injects them into the document head
- RouterProvider renders React Router routes with lazy-loaded pages

Every page is lazy-loaded via React.lazy with a Suspense spinner fallback. Page-level code splitting is handled by the LazyPage wrapper.

## Tech Stack

React 18, TypeScript, Vite 8, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS, Storage), React Router, Framer Motion, Lucide React, Recharts, jsPDF, react-hot-toast, Tiptap, @hello-pangea/dnd.

## Quick Start

```sh
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PUBLIC_BASE_URL=http://localhost:5174
```

```sh
npm run dev        # starts dev server at http://localhost:5174
npm run build      # produces dist/
npm run lint       # runs ESLint
npm run typecheck  # runs tsc --noEmit for type checking
```

## Documentation

Additional documentation is available in the docs/ directory:

| Document | Description |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | Data flow, provider hierarchy, state management, project structure |
| [Routes](docs/ROUTES.md) | Complete route table with guards for public, admin, super-admin, and protected routes |
| [RBAC](docs/RBAC.md) | Role and permission system with 7 roles and 3 enforcement layers |
| [CMS and Design](docs/CMS.md) | Dynamic page builder, theme designer, content managers, design presets |
| [Payments](docs/PAYMENTS.md) | Manual verification workflow for Khalti, eSewa, and mobile banking |
| [Security](docs/SECURITY.md) | Authentication, authorization, RLS, payment security, audit logging |
| [Supabase](docs/SUPABASE.md) | Database schema, RLS policies, storage buckets, RPC functions, migrations |

## Project Structure

```
src/
  components/      UI primitives, auth guards, block renderer, payment components
  features/        Auth system, role dashboards (donor, finance, sponsorship, volunteer, staff)
  pages/           Route pages: admin/, super-admin/, teacher/, and 20+ public routes
  context/         AuthContext, LanguageContext, ThemeContext providers
  hooks/           useRole, usePermissions, useProtectedAction, useToast, usePayment
  lib/             cn() utility, Supabase client, audit logger
  services/        API layer: donations, payments, design, students, content, settings
  types/           Database type definitions, permission types, feature types
  config/          Navigation configuration, layout definitions
  routes.tsx       Role-gated route definitions
  App.tsx          Provider hierarchy
  main.tsx         Application entry point with ErrorBoundary

supabase/
  migrations/      Database migrations applied in order
  config.toml      Supabase project configuration
```

## Key Areas

### Dynamic CMS

Admin and Super Admin users can manage website content through the admin panel without modifying code. The CMS includes a page builder with 18 block types (hero, text, gallery, CTA, donation, testimonials, FAQ, stats, timeline, video, partners, announcements, and more). Blocks are stored as JSONB, are reorderable, and have visibility toggles. The DynamicPage component fetches a page by slug and renders visible blocks through the BlockRenderer.

Content managers exist for news, gallery, videos, testimonials, student stories, FAQs, media library, navigation menus, site settings, announcements, partners, and transparency content. Header and Footer components load their data from the CMS with fallback to hardcoded defaults.

### Design System

Design tokens (colors, typography, layout, component styles) are stored as JSONB in the design_settings table with a draft/publish workflow. ThemeContext fetches published settings, generates CSS custom properties (--color-primary, --font-heading, --radius-md, etc.), and injects them into the document head. Google Fonts and favicon are loaded dynamically. Theme presets can be saved and applied from the presets management page.

### Role-Based Access Control

Seven roles with hierarchical levels: super_admin (100), admin (90), finance_manager (80), teacher (60), donor (40), volunteer (30), public_user (10). Approximately 80 permission codes follow the pattern entity.action (for example, users.read, students.create, content.pages, payments.verify). Access is enforced at three layers: route level (ProtectedRoute checks role on every navigation), component level (PermissionGuard conditionally renders children), and function level (useProtectedAction wraps callbacks).

### Payment System

Payments use a manual verification workflow without external SDKs. The donor selects an amount and gateway, the system creates a payment session, the donor pays externally and submits a transaction reference with screenshot, and an admin reviews and verifies or rejects the payment. Verified payments create a donation record and receipt. Direct donation creation is disabled at the database level.

### Dashboards

Each role has a dedicated dashboard in src/features/. The donor dashboard is the most built-out, with hooks for donations, sponsorships, impact metrics, notifications, activity feed, sponsorship timeline, teacher reports, and allocation breakdowns. Other dashboards (finance, sponsorship, volunteer, staff) follow the same pattern.

## Deployment

Deploy the dist/ directory to Vercel, Netlify, or Cloudflare Pages. Set the environment variables VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_PUBLIC_BASE_URL. Update the Supabase Auth Site URL and redirect URLs to point to the production domain. Configure SMTP for email verification.
