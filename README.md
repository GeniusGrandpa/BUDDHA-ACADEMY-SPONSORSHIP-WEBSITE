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
- Multilingual UI with localized routes (`/en`, `/ne`, ...) and static translations for English, Nepali, Japanese, Chinese, Arabic, French, Spanish, and German via react-i18next.

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

The application is a React application with server-side rendering (SSR). In production a small Node.js server (`server/index.mjs`) serves the built client assets, streams rendered HTML, and returns proper 404/500 pages. The client and server both talk to Supabase, and card payments are handled by Supabase Edge Functions that call the Stripe API.

```text
Browser -> Node SSR Server (server/index.mjs)
               -> React (src/entry-client.tsx / src/entry-server.tsx)
               -> Service Layer (src/services)
               -> Supabase (PostgreSQL + Auth + Storage + RPC + RLS)
               -> Supabase Edge Functions (create-payment-intent, stripe-webhook)
               -> Stripe API
```

### Frontend Architecture

- Built with React 18, TypeScript, Vite 8, and Tailwind CSS.
- Uses React Router with `createBrowserRouter` (client) and static handlers + `renderToPipeableStream` (server).
- Client entry is `src/entry-client.tsx` (hydration or client render); server entry is `src/entry-server.tsx` (SSR with status codes), which sets the i18next language from the URL path before rendering to avoid hydration mismatches.
- Pages are lazy-loaded with `React.lazy()` and `Suspense`.
- Shared UI primitives live under `src/components`.
- Domain-specific dashboards and workflows live under `src/features`.
- Data access is routed through service modules under `src/services`.
- Global error handling lives in `src/lib/errors.ts` (error classification and sanitization), `src/lib/logger.ts` (client log levels), and the `ErrorBoundary` in `src/components/ErrorBoundary.tsx`.

### Supabase Integration

- Supabase Auth manages authentication, sessions, email verification, password reset, and SMTP-delivered auth emails.
- Supabase PostgreSQL stores users, profiles, students, donations, sponsorships, CMS content, design settings, payments, and audit logs.
- Supabase Storage supports media uploads and payment QR codes.
- Supabase Edge Functions (`create-payment-intent`, `stripe-webhook`, `esewa-pay`, `esewa-callback`, `khalti-pay`, `khalti-callback`) process payments and verify gateway confirmations.
- RPC functions handle sensitive workflows such as payment initiation, gateway payment confirmation, permission retrieval, and role changes.
- Row Level Security protects table access at the database layer.

### Provider Hierarchy

```text
ErrorBoundary (client only)
  App
    HelmetProvider
      LanguageProvider
        I18nextProvider
          QueryClientProvider
            ClientToaster
            AuthProvider
              ThemeProvider
                SiteBranding
                CmsStringsProvider
                  ConfirmProvider
                    RouterProvider
```

- `HelmetProvider` manages document head tags (title, meta, links) for SEO.
- `LanguageProvider` manages the active locale, keeps i18next, the cookie, and the `<html lang/dir>` attributes in sync, and drives localized route URLs.
- `I18nextProvider` supplies the react-i18next instance initialized from the static locale JSON dictionaries in `src/i18n`.
- `QueryClientProvider` provides the React Query client used by data hooks.
- `AuthProvider` manages session state, user profile data, and auth actions.
- `ThemeProvider` loads published design settings and injects CSS variables.
- `CmsStringsProvider` exposes `t()` for UI strings, delegating to the react-i18next instance.
- `ConfirmProvider` provides a Promise-based `useConfirm()` replacement for native `window.confirm()` dialogs.
- `RouterProvider` renders public, protected, admin, and super-admin routes.

### Data Flow

1. A page or dashboard loads through React Router.
2. The component calls a domain hook or service function.
3. The service function uses the Supabase client.
4. Supabase applies authentication, RLS policies, and RPC rules.
5. Data returns to the component and is rendered through UI primitives and feature components.

### Route Management

Routes are defined in `src/routes.tsx` and grouped into:

- Public routes under the main layout, prefixed with a locale segment (`/:locale`, e.g. `/en/about`, `/ne/donate`); `/` redirects to the default locale.
- Protected user routes.
- Admin routes.
- Super Admin routes.
- Auth callback and password recovery routes.
- Not found fallback route.

Localized routes are driven by `src/i18n` (react-i18next init, supported locales, dictionaries) and helpers in `src/lib/locale.ts`. App-level areas (admin, dashboard, super-admin, teacher) stay at their root paths and are not localized.

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
- CMS content (page content, headers, sections, images, strings)


## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 8 |
| Styling | Tailwind CSS, dynamic CSS variables |
| Routing | React Router (createBrowserRouter + SSR static handlers) |
| Localization | react-i18next with static JSON dictionaries and localized routes |
| Server | Node.js HTTP server (`server/index.mjs`) with gzip, request IDs, structured JSON logs |
| Backend Services | Supabase |
| Edge Functions | Deno (`create-payment-intent`, `stripe-webhook`) |
| Payments | Stripe (PaymentIntents, Payment Element, webhooks) |
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

- Automatic gateway verification only: Stripe webhook, eSewa signed callback + status lookup, and Khalti lookup API are the only paths that mark a payment as paid.
- Server-verified payments create donation records through controlled, service_role-only RPC logic (`stripe_confirm_payment`, `esewa_confirm_payment`, `khalti_confirm_payment`).
- Donors are redirected to hosted gateways; the app auto-confirms via server-side lookup/callback Edge Functions.
- Every payment action is audit-logged; card failures surface sanitized, user-friendly error messages.
- **Stripe is geo-restricted and does not support Nepal** — Nepal IPs are blocked from Stripe's domains (Dashboard and the browser-based Payment Element). Nepal-based donors should use Khalti/eSewa (hosted redirect); use a VPN in a supported region for Stripe testing. See [`docs/PAYMENTS.md`](docs/PAYMENTS.md).

### CMS

- **Website Dashboard** (`/admin/website`) organizes tools into 9 categorized groups: Home Page, About Page, Sponsorship Page, Donation Page, Contact Page, Student Sections, Content Collections, Global Settings, Other Pages.
- **WebsiteBuilder** (`/admin/website/builder`): 3-panel live preview editor with 10 pages, 30+ section types, inline editing, drag-and-drop reorder, section visibility toggles, add/duplicate/hide/delete section actions, and draft/publish workflow.
- **5 dedicated editors**: AboutPageEditor (mission, vision, stats, values, timeline, images), ContactPageEditor (details + 21 form label strings), CampaignsEditor (donation goals CRUD), PrivacyPageEditor, TermsPageEditor.
- Dedicated content editors for donation, sponsorship, volunteer, footer, and transparency pages.
- Collection managers for news, gallery, testimonials, videos, FAQs, student stories, and media library.
- Theme & Branding customization panel (colors, fonts, button radius/style) with instant preview via CSS custom properties.
- Device preview toggles (Desktop, Tablet, Mobile).
- Navigation, announcements, partners, site settings, and version history tools.
- Legacy `/admin/content/*` routes redirect to `/admin/website/*` via `<Navigate>`.

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

1. **Student registration** Admins add student details, academic context, sponsorship needs, background information, and visibility data.
2. **Sponsorship availability** Student records are marked as available, partially sponsored, or fully sponsored.
3. **Sponsor selection** Donors browse student profiles and select a student whose story aligns with their giving intent.
4. **Donation process** Donors begin a donation or sponsorship payment workflow through the donation interface.
5. **Progress reporting** Teachers and staff can support future updates about academic progress, milestones, and needs.
6. **Sponsorship tracking** Donors and admins review active sponsorship records, donation activity, and status.
7. **Impact reporting** Impact content, transparency updates, student stories, and dashboards communicate outcomes back to supporters.


## Donation Workflow

1. **Donation creation** A donor selects a donation amount, sponsorship context, or general donation pathway.
2. **Payment** The donor pays through a hosted gateway (Stripe card, eSewa, or Khalti).
3. **Server verification** A gateway webhook/callback (Stripe signature, eSewa signature + status lookup, Khalti lookup API) confirms the payment server-side.
4. **Financial review** Finance staff view real transaction status; no manual payment is ever "marked paid".
5. **Receipt generation** Confirmed payments generate receipts for donor communication and reporting.
6. **Audit logging** Sensitive payment and verification actions are logged for accountability.


## Transparency & Accountability

The platform is designed around trust, traceability, and nonprofit accountability.

- **Audit logs** record sensitive administrative and financial actions.
- **Donation tracking** links giving activity to donors, students, and status.
- **Financial transparency** is supported through payment verification, reporting, and transparency content management.
- **Verification workflows** prevent unreviewed payment submissions from becoming confirmed donations.
- **Allocation visibility** supports impact reporting and future donor-facing breakdowns.
- **Reporting** provides a foundation for operational review, financial summaries, and public transparency pages.


## Dynamic CMS

The CMS allows authorized admins to manage public website content without code changes. All sections are accessible from the Website Dashboard at `/admin/website`.

### Website Dashboard

The [`WebsiteDashboard`](src/pages/admin/website/WebsiteDashboard.tsx) at `/admin/website` presents a categorized dashboard with 9 groups:

| Group | Items |
|-------|-------|
| **Home Page** | Hero, About preview, Stats, Features, Impact, CTA, Partners, Gallery preview, Testimonials |
| **About Page** | Mission, Vision, Stats, Core Values, Timeline, About Images |
| **Sponsorship Page** | Hero, Packages, How It Works, Benefits, CTA |
| **Donation Page** | Hero, Impact Cards, Process Steps, CTA |
| **Contact Page** | Header, Contact Details, 21 Form Labels |
| **Student Sections** | Student Stories, Testimonials, Gallery, News & Updates, Videos |
| **Content Collections** | FAQs, Media Library, Navigation, Site Settings, Announcements, Partners, Section Visibility, Site Images, Version History |
| **Global Settings** | Branding, Colors, Typography, Layout, Components, Config, Presets, SEO |
| **Other Pages** | Volunteer, Privacy Policy, Terms of Service, Footer, Transparency, Campaigns |

### WebsiteBuilder 3-Panel Live Preview

The [`WebsiteBuilder`](src/pages/admin/website/WebsiteBuilder.tsx) is the main visual editor at `/admin/website/homepage`:

- **Left sidebar**: 10 pages with expandable section trees; drag-and-drop reorder via framer-motion `Reorder.Group`; hover-to-reveal eye icon for visibility toggles; "Add Section" button that opens a grid of 8 available section types
- **Center preview**: Renders real database content for the selected page/section; selected section gets amber ring + glow + "Currently Editing" badge with auto-scroll; hidden sections show dimmed overlay + "Hidden" badge; inline editing (click any text → Enter/blur saves)
- **Right properties panel**: Dynamic fields for the selected section; About/Privacy/Terms inline editors; theme & branding panel (color pickers, font selectors, button radius slider, button style toggle)
- **Top bar**: Device preview toggles (Desktop/Tablet/Mobile) with width transitions; Save Draft / Publish Changes / Discard buttons; unsaved changes indicator (amber pulse dot)
- **Data flow**: Loads ALL real data from ALL service functions on mount; bulk-saves via `Promise.all(upsert*())`

### Dedicated Page Editors

| Editor | Route | Purpose |
|--------|-------|---------|
| AboutPageEditor | `/admin/website/about` | Mission, vision, stats, values, timeline, images |
| ContactPageEditor | `/admin/website/contact` | Contact details, 21 form label strings from `cms_strings` |
| CampaignsEditor | `/admin/website/campaigns` | Donation goals CRUD |
| PrivacyPageEditor | `/admin/website/privacy` | Privacy policy header + body |
| TermsPageEditor | `/admin/website/terms` | Terms of service header + body |
| HomePageEditor | `/admin/website/homepage` | Section-based homepage editor |
| BrandingEditor | `/admin/website/branding` | Unified branding/colors/typography/layout/components |
| SEOEditor | `/admin/website/seo` | Per-page SEO meta tags |

### Collection Managers

| Manager | Route | Purpose |
|---------|-------|---------|
| News | `/admin/website/news` | Create/edit/publish news articles |
| Gallery | `/admin/website/gallery` | Photos, videos, and testimonials with thumbnail previews |
| Videos | `/admin/website/videos` | YouTube/Vimeo embeds, or video file uploads (MP4/WebM/Ogg with MIME validation), descriptions |
| Testimonials | `/admin/website/testimonials` | Donor/teacher/student testimonials |
| Student Stories | `/admin/website/stories` | Success stories, achievements |
| FAQs | `/admin/website/faqs` | FAQ CRUD + reorder |
| Media Library | `/admin/website/media` | Upload/organize media assets via Supabase Storage |
| Navigation | `/admin/website/navigation` | Header/footer menus (drag-and-drop) |
| Site Settings | `/admin/website/settings` | Global site name, logo, SEO, social links |
| Announcements | `/admin/website/announcements` | Announcement banners |
| Partners | `/admin/website/partners` | Partner/sponsor logos |
| Section Visibility | `/admin/website/sections` | Show/hide sections across pages |
| Site Images | `/admin/website/images` | Manage site-wide images/backgrounds |
| Version History | `/admin/website/versions` | Content version history & restore |

### Draft and Publish Workflow

All CMS content and design settings support controlled publishing patterns so draft changes can be reviewed before going live. The WebsiteBuilder provides Save Draft / Publish Changes / Discard buttons that bulk-save all modified content.

### Legacy System

The old block-based page builder (`BlockRenderer`, `AdminBlockEditor`) has been removed from the UI layer all routes redirect to `/admin/website/*`. The `page_blocks` table remains in the schema for backward compatibility. The `content.blocks` permission code is vestigial.


## Design System

The platform includes a database-driven design management system.

- **Theme management** Published theme settings are loaded at runtime.
- **Design tokens** Colors, typography, layout, component styles, spacing, shadows, radii, and breakpoints are represented as structured settings.
- **Color management** Admins can manage a full design palette and generated CSS variables.
- **Typography** Font families, sizes, weights, letter spacing, line height, and heading styles can be configured.
- **Layout customization** Container widths, spacing, radii, shadows, and animation toggles can be controlled.
- **Presets** Theme presets can be saved, restored, and applied.


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
- **Secure Payment Verification** through server-verified gateway confirmations (Stripe webhook, eSewa/Khalti callback lookups) — no client-trusted status and no manual review path.
- **Sanitized Error Handling** sensitive details (SQL, paths, keys, traces) are never shown to users; errors surface as friendly messages via a centralized error library (`src/lib/errors.ts`).
- **Structured Logging** the SSR server writes JSON logs with per-request IDs (`X-Request-Id`) and crash handlers for uncaught exceptions and unhandled rejections.
- **File Upload Validation** for media assets.
- **HTTP Security Headers** configured on both the Vite dev server and the production SSR server.
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
| `payments` / `payment_sessions` | Gateway-initiated payment sessions and their server-verified status. |
| `content` / `pages` | CMS page records, structured content, and SEO metadata. |
| `media` | Uploaded CMS and platform media assets. |
| `design_settings` | Published and draft design tokens. |
| `audit_logs` | Security and operational audit records. |

See [`docs/SUPABASE.md`](docs/SUPABASE.md) for the Supabase integration notes.

## Project Structure

```text
src/
  components/      UI primitives, auth guards, donation and payment components
  config/          Navigation configuration and layout definitions
  context/         AuthContext, LanguageContext, ThemeContext, CmsStringsContext, ConfirmContext providers
  features/        Auth flows and role dashboards for donor, finance, sponsorship, volunteer, and staff workflows
  hooks/           useRole, usePayment, useDebounce, useWebsiteBuilder, useLocalizePath, and feature hooks
  i18n/            react-i18next init, supported locales, and static locale dictionaries
  lib/             Supabase client, audit logger, error handling, logger, permissions, locale helpers, auth helpers
  pages/           Route pages including public, admin, super-admin, teacher, and auth callback pages
  services/        Domain service layer for Supabase access (23 files)
  types/           Database types, permission types, CMS types, and feature types
  App.tsx          Application provider hierarchy
  entry-client.tsx Client entry point (hydration + global error handlers)
  entry-server.tsx Server entry point (SSR with status codes)
  routes.tsx       Route definitions and access guards

server/
  index.mjs        Production SSR server: static assets, streaming render, 404/500 pages, security headers

supabase/
  functions/       Edge functions: create-payment-intent, stripe-webhook, shared helpers
  migrations/      Timestamped database migrations
  config.toml      Supabase project configuration

docs/
  ARCHITECTURE.md  Architecture, provider hierarchy, data flow, conventions
  CMS.md           CMS, design system, content managers, dynamic page builder
  PAYMENTS.md      Payment verification workflow (manual + Stripe)
  RBAC.md          Roles, permissions, enforcement layers
  ROUTES.md        Public, protected, admin, and super-admin route map
  SECURITY.md      Auth, authorization, RLS, payment security, audit logging
  SUPABASE.md      Supabase client, services, storage, RPCs, migrations

dist/
  Production build output generated by Vite (client + server)
```


## Environment Variables

Create a `.env` file in the project root (see `.env.example` for the full template).

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL used by the frontend client. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key. Safe for browser use when RLS is configured correctly. |
| `VITE_PUBLIC_BASE_URL` | Recommended | Public base URL used for auth redirects and deployment-specific links. Example: `http://localhost:5174`. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes (Stripe) | Stripe publishable key used by the Payment Element in the browser. |
| `STRIPE_SECRET_KEY` | Yes (Stripe) | Stripe secret key used by the `create-payment-intent` Edge Function. Server-side only. |
| `STRIPE_WEBHOOK_SECRET` | Yes (Stripe) | Stripe webhook signing secret (`whsec_...`) used by the `stripe-webhook` Edge Function. Server-side only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (Stripe) | Supabase service role key used by the webhook Edge Function. Server-side only; never expose to the browser. |
| `KHALTI_ENVIRONMENT` | Yes (Khalti) | Khalti environment: `test` (sandbox `dev.khalti.com`) or `production` (`khalti.com`). Server-side only. |
| `KHALTI_SECRET_KEY` | Yes (Khalti) | Khalti `live_secret_key` used by the `khalti-pay` / `khalti-callback` Edge Functions. Server-side only. |
| `KHALTI_WEBSITE_URL` | Yes (Khalti) | Public website origin sent to Khalti during initiation. |
| `KHALTI_RETURN_URL` | Yes (Khalti) | Public origin the donor is redirected back to after paying. |
| `SUPABASE_JWKS_URL` | Optional | Supabase JWKS URL used by the SSR server for signed requests. |

Server runtime variables (`server/index.mjs`): `HOST` (default `0.0.0.0`), `PORT` (default `3000`), `LOG_LEVEL` (`debug`/`info`/`warn`/`error`/`silent`).

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
VITE_PUBLIC_BASE_URL=http://localhost:5174
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Do not commit production secrets. Supabase anonymous keys are public by design, but table access must be protected through RLS policies. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` are server-side only for local Edge Function development set them with `supabase secrets set`.

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

The development server runs with Vite on port `5174` (`vite --host`). A Vite middleware plugin in `vite.config.ts` also server-renders pages in dev via `src/entry-server.tsx`, so SSR behavior is active during development.

### 4. Type Checking

```bash
npm run typecheck
```

### 5. Linting

```bash
npm run lint
```

### 6. Production Build (SSR)

```bash
npm run build:ssr
```

Builds both the client bundle (`dist/client`) and the server bundle (`dist/server`).

### 7. Run the Production SSR Server

```bash
npm run serve:ssr
```

Runs `server/index.mjs` on port `3000` (override with `PORT`). The server requires the `dist/client/index.html` template and `dist/server/entry-server.mjs` to exist (i.e. run `build:ssr` first).

### 8. Preview Client Build

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
8. Deploy the Edge Functions (`supabase/functions/`):

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

9. Set Edge Function secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

Recommended local redirect URL:

```text
http://localhost:5174/auth/callback
```

For deployed environments, replace the domain with the production URL.

## Deployment

The application ships two parts: a **Node.js SSR server** (`server/index.mjs`) that serves the production build, and **Supabase Edge Functions** for payments.

### Build

```bash
npm run build:ssr
```

Output: `dist/client/` (static assets) and `dist/server/` (SSR entry).

### Run the Node SSR Server

Run `node server/index.mjs` with `NODE_ENV=production` on a Node 18+ runtime. The server serves static assets, streams SSR HTML with proper 404/500 pages, sets security headers and per-request IDs, and writes structured JSON logs.

```bash
NODE_ENV=production PORT=3000 node server/index.mjs
```

Recommended hosts: a VPS (systemd/PM2), Railway, Render, Fly.io, or a container on any provider. A minimal `Dockerfile` can copy `dist/`, `server/`, and `package.json` and run the command above.

### Platform Configuration

For any host running the SSR server:

1. Set the **build command** to `npm run build:ssr`.
2. Set the **start command** to `node server/index.mjs`.
3. Add environment variables (see checklist below).
4. Add the deployment URL to Supabase Auth settings (Site URL + redirect URLs).
5. Deploy the Edge Functions and set their secrets (see Supabase Setup).

### Deployment Checklist

- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_BASE_URL`.
- Set `VITE_STRIPE_PUBLISHABLE_KEY` and server-side `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
- Configure Supabase Auth Site URL (set to your deployment URL).
- Configure Supabase Auth redirect URLs (include `https://your-domain.com/auth/callback`).
- Configure SMTP provider for auth emails.
- Apply database migrations (`supabase/migrations/`).
- Deploy Edge Functions and register the `stripe-webhook` endpoint in the Stripe Dashboard.
- Confirm storage bucket policies and RLS policies are enabled.
- Test email verification, sign-in, password reset, and card payment in production.

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
- Additional static locale dictionaries for more languages.

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
npm run build:ssr
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

Copyright (c) Buddha Academy. All rights reserved.

This software and associated documentation are proprietary and confidential.
No part of this software may be copied, modified, distributed, sublicensed,
sold, or used without prior written permission from Buddha Academy.

See the [LICENSE](LICENSE) file for the full license terms.

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
