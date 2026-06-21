# Buddha Academy Sponsorship Platform

NGO management platform for student sponsorships, donations, and community engagement.

**Stack**: React 18 · TypeScript · Vite 8 · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS, Storage) · React Router · Framer Motion · Recharts · Tiptap

## Quick Start

```sh
npm install
```

Create `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PUBLIC_BASE_URL=http://localhost:5174
```

```sh
npm run dev        # → http://localhost:5174
npm run build      # → dist/
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Documentation

| Doc | Description |
|-----|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Data flow, provider hierarchy, state management, project structure |
| [Routes](docs/ROUTES.md) | Full route table with guards (public, admin, super-admin, protected) |
| [RBAC](docs/RBAC.md) | Role/permission system, 7 roles, enforcement layers |
| [CMS & Design](docs/CMS.md) | Dynamic page builder, theme designer, content managers, design presets |
| [Payments](docs/PAYMENTS.md) | Manual verification workflow (Khalti/eSewa/banking) |
| [Security](docs/SECURITY.md) | Authentication, RBAC, RLS, payment security, audit logging, HTTP headers |
| [Supabase](docs/SUPABASE.md) | Schema, RLS, storage, RPC functions, migrations, audit logging |

## Key Capabilities

- **Dynamic CMS** — Admin/Super Admin can manage content, pages, navigation, announcements, partners, media, and design (colors, typography, layout) through the admin panel without touching code
- **Design System** — Design tokens stored as JSONB in Supabase, injected as CSS custom properties via `ThemeContext`. Draft/publish workflow with theme presets
- **Page Builder** — 18 block types (hero, text, gallery, CTA, donation, testimonials, FAQ, stats, etc.) rendered by `DynamicPage` component with SEO metadata
- **RBAC** — 7 roles with ~80 permission codes enforced at route, component, and function levels
- **Payments** — Manual verification workflow: payment session → donor submits proof → admin verifies → donation + receipt created
- **Dashboards** — Role-specific dashboards for donors, finance, sponsorship, volunteers, and staff
- **i18n** — Manual EN/NP/HI dictionaries + Google Translate for other languages, RTL support

## Deployment

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages. Set environment variables. Update Supabase Auth Site URL and redirect URLs to point to production. Configure SMTP for email verification.
