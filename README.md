# Buddha Academy Sponsorship Platform

Enterprise-grade NGO management system for student sponsorships, donations, and community engagement. Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase.

## Tech Stack

React 18, TypeScript, Vite 8, Tailwind CSS, shadcn/ui (Nova preset), React Router v7, Framer Motion, Supabase (PostgreSQL, Auth, RLS, Storage), Lucide React, Recharts, jsPDF, react-hot-toast

## Features

- **Public:** Home, About, Sponsorship, Students, Gallery, News, Contact, Donate, Transparency, FAQ, Volunteer, Login, Register
- **RBAC (7 roles):** Super Admin, Admin, Finance Manager, Teacher/Staff, Donor, Volunteer, Public User
- **Dashboards:** Super Admin, Finance, Sponsorship, Volunteer, Teacher, Donor, Admin Panel
- **Payments:** Khalti/eSewa/banking gateways, payment sessions, verification workflow, receipts, audit trail
- **Security:** Row Level Security on all tables, self-role-escalation prevention, audit logging, error sanitization
- **CMS:** Dynamic pages, media library, gallery, news, testimonials, FAQs, navigation manager, homepage editor
- **Design:** Full theme customization (colors, typography, layout, branding), theme presets
- **Internationalization:** 100+ languages via Google Translate; English/Nepali/Hindi fully translated
- **Multilingual:** 100+ languages via Google Translate with English/Nepali/Hindi fully translated

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
npm run dev        # http://localhost:5174
npm run build      # production build → dist/
npm run preview    # preview production build
npm run lint       # ESLint
npm run typecheck  # TypeScript checks
```

## Supabase

Apply migrations from `supabase/migrations/` in order via Dashboard SQL Editor. Configure Auth → Email with Site URL and redirect URLs. Create first admin:
```sql
SELECT public.admin_toggle_role(target_user_id := 'uuid', new_role := 'super_admin');
```

## Project Structure

```
src/
├── components/   # UI primitives (shadcn), auth components, guards
├── features/     # Auth, dashboards (donor, finance, sponsorship, volunteer, staff), RBAC
├── pages/        # Route pages (admin, teacher, super-admin, 30+ public routes)
├── context/      # Auth, Language, Theme providers
├── hooks/        # useRole, usePermissions, useProtectedAction, useToast, usePayment
├── lib/          # utils (cn), supabase client, audit logging
├── services/     # API service layers
├── types/        # Database, permissions, feature types
├── config/       # Navigation definitions
├── routes.tsx    # All routes with role-gated protection
├── App.tsx       # Provider hierarchy + Toaster
└── main.tsx      # Entry point with ErrorBoundary
```

## Deployment

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages. Set environment variables. Ensure Supabase Auth Site URL and Redirect URLs point to production domain, and SMTP is configured for email verification.

## Code Conventions

- Function components with named exports, no default exports, no inline component definitions
- Functional updaters for state (`setState(prev => ...)`)
- Tailwind CSS with `cn()` utility for conditional classes
- Light/admin theme: white cards, orange accents, icon-free, typography-focused
- `useCallback` for stable handlers, `useMemo` for derived data
