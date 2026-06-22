# Buddha Academy Sponsorship Platform

A production-focused NGO management platform for student sponsorships, donations, transparency reporting, content management, and community impact operations.

Built with React 18, TypeScript, Vite 8, Tailwind CSS, Supabase, and a role-based administration system designed for donors, staff, finance teams, teachers, volunteers, and public visitors.


## Project Overview

Buddha Academy Sponsorship Platform is a full-stack web application that supports the operational needs of an education-focused nonprofit organization. It provides a public-facing website, donor portal, administration dashboard, content management system, manual payment verification workflow, and transparency tooling for managing student sponsorship programs.

The platform was created to help Buddha Academy present student stories, collect and verify donations, manage sponsorship activity, publish updates, and improve accountability between the organization and its supporters.

It serves:

- **Students** who need educational support and long-term sponsorship.
- **Donors and sponsors** who want clear visibility into their contributions and impact.
- **Administrators** who manage students, donations, content, reports, and operations.
- **Finance staff** who verify payments, issue receipts, and maintain financial records.
- **Teachers and volunteers** who contribute progress updates and community activities.
- **Public visitors** who want to learn about the academy, donate, volunteer, or follow impact stories.

The platform solves common NGO challenges such as fragmented donor communication, manual sponsorship tracking, unclear donation allocation, content update bottlenecks, and limited transparency into financial and educational outcomes.


## Mission

The mission of this platform is to strengthen educational opportunities for underprivileged children by making sponsorship programs easier to manage, easier to trust, and easier to scale.

It supports:

- **Educational access** by documenting student needs, stories, progress, and sponsorship status.
- **Donor transparency** by recording donations, payment evidence, receipts, allocation history, and impact updates.
- **NGO operations** by centralizing administration, content publishing, reporting, role management, and audit trails.
- **Community engagement** by offering public pages, gallery updates, testimonials, volunteer pathways, and news announcements.



## Key Features

### Public Website

- Dynamic public pages for home, about, sponsorship, students, gallery, news, contact, donation, transparency, FAQ, volunteer, privacy, and terms.
- Student stories and sponsorship-focused profile pages.
- News and announcements for organizational updates.
- Testimonials, success stories, activity updates, and gallery content.
- Donation and sponsorship entry points designed for public visitors and returning donors.
- Multilingual language selector with local translations for English, Nepali, and Hindi, plus browser-loaded translation support for additional languages.

### Donor Portal

- Donor dashboard for authenticated users.
- Sponsorship and donation visibility.
- Donation history and receipt-oriented workflows.
- Impact reporting concepts for progress, allocation, and sponsorship timelines.
- Email verification and password reset support through Supabase Auth.

### Administration

- Student management.
- Donor and profile management.
- Donation and payment verification management.
- News, gallery, contact inquiry, and content administration.
- CMS tools for page content, media, announcements, partners, transparency content, FAQs, testimonials, and student stories.
- Reporting and finance-oriented views for operational review.

### Super Admin

- Platform-level user management.
- Role and permission management.
- Audit log access.
- System notification management.
- Design system and theme governance through admin-controlled design settings.



## Architecture

The application is a single-page React application that communicates directly with Supabase. There is no custom backend server in the current architecture.

```text
Browser -> React SPA -> Service Layer -> Supabase
                                -> PostgreSQL
                                -> Auth
                                -> Storage
                                -> RPC Functions
                                -> Row Level Security
```

### Frontend Architecture

- Built with React 18, TypeScript, Vite 8, and Tailwind CSS.
- Uses React Router with `createBrowserRouter`.
- Pages are lazy-loaded with `React.lazy()` and `Suspense`.
- Shared UI primitives live under `src/components`.
- Domain-specific dashboards and workflows live under `src/features`.
- Data access is routed through service modules under `src/services`.

### Supabase Integration

- Supabase Auth manages authentication, sessions, email verification, password reset, and SMTP-delivered auth emails.
- Supabase PostgreSQL stores users, profiles, students, donations, sponsorships, CMS content, design settings, payments, and audit logs.
- Supabase Storage supports media uploads, payment screenshots, and payment QR codes.
- RPC functions handle sensitive workflows such as payment initiation, payment verification, permission retrieval, and role changes.
- Row Level Security protects table access at the database layer.

### Provider Hierarchy

```text
ErrorBoundary
  App
    Toaster
    LanguageProvider
      AuthProvider
        ThemeProvider
          RouterProvider
```

- `LanguageProvider` manages language state, translation strings, and browser-loaded translation support.
- `AuthProvider` manages session state, user profile data, and auth actions.
- `ThemeProvider` loads published design settings and injects CSS variables.
- `RouterProvider` renders public, protected, admin, and super-admin routes.

### Data Flow

1. A page or dashboard loads through React Router.
2. The component calls a domain hook or service function.
3. The service function uses the Supabase client.
4. Supabase applies authentication, RLS policies, and RPC rules.
5. Data returns to the component and is rendered through UI primitives and feature components.

### Route Management

Routes are defined in `src/routes.tsx` and grouped into:

- Public routes under the main layout.
- Protected user routes.
- Admin routes.
- Super Admin routes.
- Auth callback and password recovery routes.
- Not found fallback route.

### Service Layer

The service layer keeps Supabase access organized by domain:

- Authentication
- Students
- Donations
- Payments
- Design settings
- CMS content
- Site settings
- Navigation
- Announcements
- Partners
- Page blocks


## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 8 |
| Styling | Tailwind CSS, dynamic CSS variables |
| Routing | React Router |
| Backend Services | Supabase |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth with PKCE, email verification, password reset |
| Authorization | Role-Based Access Control, permission guards, protected actions, RLS |
| Storage | Supabase Storage buckets for media and payment evidence |
| UI Libraries | Lucide React, Framer Motion, Recharts, Tiptap, react-hot-toast |
| Documents & Reports | jsPDF, jsPDF AutoTable, html2canvas |
| Drag and Drop | `@hello-pangea/dnd` |
| Tooling | ESLint, TypeScript, Vite build pipeline |


## User Roles

| Role | Responsibilities | System Access |
| --- | --- | --- |
| Super Admin | Owns platform governance, user roles, permissions, audit logs, system-level settings, and design governance. | Full system access across public, admin, finance, CMS, design, security, and audit modules. |
| Admin | Manages day-to-day NGO operations, students, donors, content, contacts, sponsorships, and reports. | Admin dashboard, CMS, student management, donor management, donation review, reports, and operational settings. |
| Finance Manager | Reviews donation records, verifies payment evidence, manages receipts, and supports financial reporting. | Finance dashboard, payment verification, donation records, financial reports, payment settings where permitted. |
| Teacher | Supports student progress reporting, academic updates, and assigned student records. | Teacher dashboard, assigned student records, limited progress and report actions. |
| Donor | Sponsors students, tracks giving history, views impact, and manages their personal dashboard. | Donor dashboard, own profile, own donations, own sponsorship activity. |
| Volunteer | Supports events, activities, community engagement, and volunteer-related updates. | Volunteer dashboard, assigned tasks, events, own profile, limited public-facing content access. |
| Public User | Browses public pages, reads stories, views transparency content, submits contact forms, and starts donation or sponsorship journeys. | Public website, public student stories, news, gallery, donation pages, contact forms. |


## Platform Modules

### Authentication

- Supabase Auth sign-in, sign-up, sign-out, email verification, password reset, and auth callback handling.
- Session auto-refresh through Supabase client behavior.
- Auth profile linked from Supabase `auth.users` to `public.profiles`.

### User Management

- Role assignment through controlled admin workflows and RPC functions.
- Profile records for donors, admins, staff, volunteers, and public users.
- Protection against role escalation through database policies and permission checks.

### Student Management

- Student profiles, family background, sponsorship status, sponsorship amount, current sponsorship progress, and public student pages.
- Administrative CRUD workflows for student records.

### Sponsorship Management

- Sponsorship records linking donors to students.
- Active, paused, and ended sponsorship states.
- Sponsorship visibility through donor and admin dashboards.

### Donation Management

- Donation records tied to donors, students, status, frequency, and messages.
- Donor-visible donation history.
- Admin and finance review workflows.

### Payment Verification

- Manual payment session workflow for external payment methods.
- Transaction reference and screenshot submission.
- Admin review, verification, rejection, and receipt-oriented workflows.
- Verified payments create donation records through controlled RPC logic.

### CMS

- Page builder with JSONB content blocks.
- Structured editors for predefined pages.
- Dedicated managers for news, gallery, testimonials, videos, FAQs, student stories, media, navigation, announcements, partners, and transparency content.

### Design System

- Database-driven design tokens.
- Draft and publish workflow for theme settings.
- Branding, colors, typography, layout, components, config, and presets management.

### Notifications

- Notification pages for admin and super-admin workflows.
- Dashboard notification patterns for user-facing updates.

### Reporting

- Admin and finance reporting concepts for donations, sponsorships, payments, and organizational activity.
- Export-oriented dependencies are available through PDF generation libraries.

### Audit Logs

- Administrative and mutation actions can be recorded in `audit_logs`.
- Audit log visibility is restricted to high-privilege roles.


## Student Sponsorship Workflow

1. **Student registration** — Admins add student details, academic context, sponsorship needs, background information, and visibility data.
2. **Sponsorship availability** — Student records are marked as available, partially sponsored, or fully sponsored.
3. **Sponsor selection** — Donors browse student profiles and select a student whose story aligns with their giving intent.
4. **Donation process** — Donors begin a donation or sponsorship payment workflow through the donation interface.
5. **Progress reporting** — Teachers and staff can support future updates about academic progress, milestones, and needs.
6. **Sponsorship tracking** — Donors and admins review active sponsorship records, donation activity, and status.
7. **Impact reporting** — Impact content, transparency updates, student stories, and dashboards communicate outcomes back to supporters.


## Donation Workflow

1. **Donation creation** — A donor selects a donation amount, sponsorship context, or general donation pathway.
2. **Payment submission** — The donor pays through an external/manual payment method and submits a transaction reference and proof screenshot.
3. **Verification process** — Admin or finance staff review payment evidence.
4. **Financial review** — Finance staff validate records, confirm status, and identify rejected, pending, or verified payments.
5. **Receipt generation** — Verified payment records support receipt-oriented donor communication and reporting.
6. **Audit logging** — Sensitive payment and verification actions are logged for accountability.


## Transparency & Accountability

The platform is designed around trust, traceability, and nonprofit accountability.

- **Audit logs** record sensitive administrative and financial actions.
- **Donation tracking** links giving activity to donors, students, and status.
- **Financial transparency** is supported through payment verification, reporting, and transparency content management.
- **Verification workflows** prevent unreviewed payment submissions from becoming confirmed donations.
- **Allocation visibility** supports impact reporting and future donor-facing breakdowns.
- **Reporting** provides a foundation for operational review, financial summaries, and public transparency pages.


## Dynamic CMS

The CMS allows authorized admins to manage public website content without code changes.

### Page Builder

Dynamic pages store content as blocks and render them through a block renderer. Supported block types include hero, text, rich content, image, gallery, CTA, donation, student cards, testimonials, FAQ, stats, timeline, video, sponsors, partners, announcements, and custom sections.

### Advanced Block System

- Blocks are stored in a normalized `page_blocks` table (FK → `pages.id`) for type-safe querying.
- A `sync_page_blocks_json()` trigger function keeps `pages.blocks` JSONB in sync for backward compatibility.
- AdminBlockEditor component provides drag-and-drop reorder, add/delete/duplicate, visibility/draft toggles, and inline content editing.
- Blocks can be reordered, toggled visible/hidden, and set to draft mode.
- Full RLS policies enforce editor+ access; all block CRUD operations are audit-logged.
- Supports block types: hero, text, rich content, image, gallery, CTA, donation, student cards, testimonials, FAQ, stats, timeline, video, sponsors, partners, announcements, and custom sections.

### Content Management

Dedicated admin managers support:

- News
- Gallery
- Videos
- Testimonials
- Student stories
- FAQs
- Media library
- Navigation menus
- Site settings
- Announcements
- Partners
- Transparency content
- Version history
- Content analytics

### Media Library

Media assets are stored through Supabase Storage and organized through CMS workflows.

### Navigation Management

Header and footer navigation can be managed dynamically with fallback defaults.

### Draft and Publish Workflow

Design settings and CMS content support controlled publishing patterns so draft changes can be reviewed before going live.


## Design System

The platform includes a database-driven design management system.

- **Theme management** — Published theme settings are loaded at runtime.
- **Design tokens** — Colors, typography, layout, component styles, spacing, shadows, radii, and breakpoints are represented as structured settings.
- **Color management** — Admins can manage a full design palette and generated CSS variables.
- **Typography** — Font families, sizes, weights, letter spacing, line height, and heading styles can be configured.
- **Layout customization** — Container widths, spacing, radii, shadows, and animation toggles can be controlled.
- **Presets** — Theme presets can be saved, restored, and applied.


## Dashboards

| Dashboard | Purpose |
| --- | --- |
| Donor Dashboard | Sponsorship visibility, donation history, impact updates, and personal account activity. |
| Finance Dashboard | Donation review, payment status, payment verification, receipts, and financial reporting. |
| Sponsorship Dashboard | Sponsorship status, student-to-donor relationships, and sponsorship lifecycle monitoring. |
| Volunteer Dashboard | Volunteer tasks, event participation, activities, and profile-oriented workflows. |
| Teacher Dashboard | Student progress, assigned student context, and academic update workflows. |
| Admin Dashboard | Operational management for students, donors, content, payments, reports, and site administration. |
| Super Admin Dashboard | User management, roles, permissions, audit logs, notifications, and platform governance. |


## Security Features

- **Supabase Authentication** with PKCE flow, session management, email verification, and password recovery.
- **Role-Based Access Control** across seven roles.
- **Protected Routes** through route-level guards.
- **Row Level Security** on Supabase tables.
- **Audit Logging** for sensitive administrative actions.
- **Secure Payment Verification** through controlled RPC workflows and manual review.
- **File Upload Validation** for payment screenshots and media assets.
- **HTTP Security Headers** configured through Vite.
- **Database hardening** through restricted table/function access and safer function search paths.

## Database Overview

Major data entities include:

| Entity | Purpose |
| --- | --- |
| `profiles` | Application user profiles linked to Supabase Auth users. |
| `users` / `auth.users` | Supabase-managed authentication users. |
| `students` | Student records, profile details, and sponsorship status. |
| `sponsorships` | Donor-to-student sponsorship relationships. |
| `donations` | Confirmed or tracked donation records. |
| `payments` / `payment_sessions` | Manual payment workflow state, references, screenshots, and verification status. |
| `content` / `pages` | CMS page records, structured content, and SEO metadata. |
| `media` | Uploaded CMS and platform media assets. |
| `design_settings` | Published and draft design tokens. |
| `audit_logs` | Security and operational audit records. |

See [`docs/SUPABASE.md`](docs/SUPABASE.md) for the Supabase integration notes.

## Project Structure

```text
src/
  components/      UI primitives, auth guards, block renderer, donation and payment components
  config/          Navigation configuration and layout definitions
  context/         AuthContext, LanguageContext, ThemeContext providers
  features/        Auth flows and role dashboards for donor, finance, sponsorship, volunteer, and staff workflows
  hooks/           useRole, useToast, usePayment, and dashboard hooks
  lib/             Supabase client, audit logger, shared helpers
  pages/           Route pages including public, admin, super-admin, teacher, and auth callback pages
  services/        Domain service layer for Supabase access
  types/           Database types, permission types, CMS types, and feature types
  App.tsx          Application provider hierarchy
  main.tsx         Application entry point and ErrorBoundary setup
  routes.tsx       Route definitions and access guards

docs/
  ARCHITECTURE.md  Architecture, provider hierarchy, data flow, conventions
  CMS.md           CMS, design system, content managers, dynamic page builder
  PAYMENTS.md      Manual payment verification workflow
  RBAC.md          Roles, permissions, enforcement layers
  ROUTES.md        Public, protected, admin, and super-admin route map
  SECURITY.md      Auth, authorization, RLS, payment security, audit logging
  SUPABASE.md      Supabase client, services, storage, RPCs, migrations

supabase/
  migrations/      Timestamped database migrations
  config.toml      Supabase project configuration

dist/
  Production build output generated by Vite
```


## Environment Variables

Create a `.env` file in the project root.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL used by the frontend client. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key. Safe for browser use when RLS is configured correctly. |
| `VITE_PUBLIC_BASE_URL` | Recommended | Public base URL used for auth redirects and deployment-specific links. Example: `http://localhost:5174`. |

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
VITE_PUBLIC_BASE_URL=http://localhost:5174
```

Do not commit production secrets. Supabase anonymous keys are public by design, but table access must be protected through RLS policies.

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` in the project root and provide the Supabase values listed above.

### 3. Run Development Server

```bash
npm run dev
```

The development server runs with Vite. The current script uses `vite --host`, so Vite will show the local URL in the terminal.

### 4. Type Checking

```bash
npm run typecheck
```

### 5. Linting

```bash
npm run lint
```

### 6. Production Build

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```

## Supabase Setup

1. Create or open a Supabase project.
2. Apply migrations from `supabase/migrations/` in timestamp order.
3. Configure Supabase Auth email provider and SMTP.
4. Enable email confirmations for account verification.
5. Add local and production redirect URLs.
6. Configure storage buckets and RLS policies.
7. Confirm required RPC functions are available.

Recommended local redirect URL:

```text
http://localhost:5174/auth/callback
```

For deployed environments, replace the domain with the production URL.

## Deployment

The application builds to static assets in `dist/` and can be deployed to any standard static hosting platform (Netlify, Cloudflare Pages, AWS S3, self-hosted nginx, etc.).

### Build

```bash
npm run build
```

Output: `dist/`

### Platform Configuration

For any hosting platform:

1. Set the **build command** to `npm run build`.
2. Set the **publish/output directory** to `dist`.
3. Configure a **single-page application (SPA) fallback** — all routes should serve `dist/index.html` (handled automatically by most platforms; for nginx use `try_files $uri $uri/ /index.html`).
4. Add environment variables (see checklist below).
5. Add the deployment URL to Supabase Auth settings (Site URL + redirect URLs).

### Examples

| Platform | Notes |
| --- | --- |
| **Netlify** | Create site from repo; set build command `npm run build`, publish dir `dist`; add `_redirects` file for SPA fallback is automatic. |
| **Cloudflare Pages** | Connect repo; framework preset = Vite; build command `npm run build`, build output dir `dist`. |
| **AWS S3 + CloudFront** | Upload `dist/` to S3; configure S3 static website hosting or CloudFront with error page pointing to `/index.html`. |
| **nginx** | Copy `dist/` to web root; configure `try_files $uri $uri/ /index.html;`. |

### Deployment Checklist

- Set `VITE_SUPABASE_URL`.
- Set `VITE_SUPABASE_ANON_KEY`.
- Set `VITE_PUBLIC_BASE_URL`.
- Configure Supabase Auth Site URL (set to your deployment URL).
- Configure Supabase Auth redirect URLs (include `https://your-domain.com/auth/callback`).
- Configure SMTP provider for auth emails.
- Apply database migrations (`supabase/migrations/`).
- Confirm storage bucket policies and RLS policies are enabled.
- Test email verification, sign-in, and password reset in production.


## Screenshots

Add screenshots to `docs/screenshots/` or a similar directory when available.

| Screen | Placeholder |
| --- | --- |
| Homepage | `docs/screenshots/homepage.png` |
| Donation Page | `docs/screenshots/donation-page.png` |
| Donor Dashboard | `docs/screenshots/donor-dashboard.png` |
| CMS Dashboard | `docs/screenshots/cms-dashboard.png` |
| Student Management | `docs/screenshots/student-management.png` |
| Payment Verification | `docs/screenshots/payment-verification.png` |


## Future Roadmap

### Sponsorship

- Enhanced progress tracking.
- Sponsorship renewal workflows.
- Academic reporting and term-based progress summaries.

### Transparency

- Public transparency portal.
- Donation allocation tracking.
- Downloadable financial reports.

### Communication

- Donor notifications.
- Teacher-to-sponsor updates.
- Newsletter system.

### Finance

- Budget planning.
- Expense tracking.
- Advanced financial reporting.

### Volunteers

- Volunteer management.
- Activity tracking.
- Volunteer certificates.

### Platform

- Mobile application.
- Multi-school support.
- Offline capabilities.
- Expanded multilingual support with more local translation dictionaries.

## Contributing

Contributions should improve reliability, transparency, accessibility, maintainability, or nonprofit operational value.

### Recommended Workflow

1. Fork the repository.
2. Create a feature branch.
3. Install dependencies with `npm install`.
4. Make focused changes.
5. Run checks:

```bash
npm run typecheck
npm run lint
npm run build
```

6. Open a pull request with:
   - Clear summary.
   - Screenshots for UI changes.
   - Notes about database migrations, RLS changes, or environment variables.
   - Testing performed.

### Contribution Guidelines

- Keep changes focused and reviewable.
- Preserve role-based access control behavior.
- Do not bypass RLS, permission guards, or protected actions.
- Document new environment variables.
- Add or update documentation for new modules.
- Avoid committing build output unless the repository intentionally tracks deployment artifacts.

## License

License information has not yet been finalized.

Recommended placeholder:

```text
Copyright (c) Buddha Academy.
All rights reserved unless a LICENSE file states otherwise.
```

Add a formal `LICENSE` file before distributing, accepting external contributions, or publishing the project as open source.

## Author

**Anil Tamang**  
Kathmandu, Nepal

## Additional Documentation

| Document | Description |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Data flow, provider hierarchy, state management, and project conventions. |
| [`docs/ROUTES.md`](docs/ROUTES.md) | Public, protected, admin, and super-admin routes. |
| [`docs/RBAC.md`](docs/RBAC.md) | Role matrix, permission system, and enforcement layers. |
| [`docs/CMS.md`](docs/CMS.md) | Dynamic CMS, design system, content managers, and page builder. |
| [`docs/PAYMENTS.md`](docs/PAYMENTS.md) | Manual payment verification workflow. |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Authentication, authorization, RLS, payment security, and audit logging. |
| [`docs/SUPABASE.md`](docs/SUPABASE.md) | Supabase client, services, storage, RPC functions, and migrations. |
