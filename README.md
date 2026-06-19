# Buddha Academy Sponsorship Platform

NGO management platform for student sponsorships, donations, and community engagement. Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase.

## Tech Stack

**React 18** · **TypeScript** · **Vite 8** · **Tailwind CSS** · **Supabase** (PostgreSQL, Auth, RLS, Storage) · **React Router** · **Framer Motion** · **Lucide React** · **Recharts** · **jsPDF** · **react-hot-toast** · **Tiptap** (rich text) · **@hello-pangea/dnd** (drag-and-drop)

## Features

- **Public pages:** Home, About, Sponsorship, Students, Gallery, News, Contact, Donate, Transparency, FAQ, Volunteer, Login, Register
- **7-role RBAC:** Super Admin, Admin, Finance Manager, Teacher/Staff, Donor, Volunteer, Public User
- **Dashboards:** Super Admin, Finance, Sponsorship, Volunteer, Teacher, Donor, Admin CMS
- **Payment system:** Khalti/eSewa/banking gateways, manual verification workflow, receipts, audit trail
- **Security:** Row Level Security on all tables, self-role-escalation prevention, audit logging
- **CMS:** Dynamic pages, media library, gallery, news, testimonials, FAQs, navigation manager, homepage editor
- **Theme designer:** Custom colors, typography, layout, branding with presets
- **Internationalization:** Google Translate widget (100+ languages) + manual EN/NP/HI translations
- **Finance tools:** Reporting, expense tracking, donation analytics
- **Drag-and-drop page builder** for homepage sections

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

## Supabase

Apply migrations from `supabase/migrations/` in order. Configure Auth → Email with Site URL and redirect URLs. Create the first admin:

```sql
SELECT public.admin_toggle_role(target_user_id := 'uuid', new_role := 'super_admin');
```

## Project Structure

```
src/
├── components/     # UI primitives (ui/), auth guards, blocks, donate, payments
├── features/       # Dashboards: donor, finance, sponsorship, volunteer, staff
├── pages/          # Route pages (admin/, super-admin/, teacher/, 20+ public routes)
├── context/        # Auth, Language (Google Translate), Theme providers
├── hooks/          # useRole, usePermissions, useProtectedAction, useToast, usePayment
├── lib/            # cn() utility, Supabase client, audit logger
├── services/       # API layers (donations, payments, design, students, etc.)
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
