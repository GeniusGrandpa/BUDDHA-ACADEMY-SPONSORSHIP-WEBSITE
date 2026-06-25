# Routing

All routes defined in `src/routes.tsx` via `createBrowserRouter`.

## Public Routes (under `Layout`)

| Path               | Component           |
|--------------------|---------------------|
| `/`                | HomePage            |
| `/about`           | AboutPage           |
| `/sponsor`         | SponsorshipPage     |
| `/students`        | StudentsPage        |
| `/students/:id`    | StudentDetailPage   |
| `/gallery`         | GalleryPage         |
| `/news`            | NewsPage            |
| `/contact`         | ContactPage         |
| `/donate`          | DonatePage          |
| `/donations`       | DonationHistoryPage |
| `/transparency`    | TransparencyPage    |
| `/faq`             | FAQPage             |
| `/volunteer`       | VolunteerPage       |
| `/campaigns`       | CampaignsPage       |
| `/success-stories` | SuccessStoriesPage  |
| `/activity`        | ActivityPage        |
| `/privacy`         | PrivacyPage         |
| `/terms`           | TermsPage           |
| `/login`           | LoginPage           |
| `/forgot-password` | ForgotPasswordPage  |
| `/reset-password`  | ResetPasswordPage   |
| `/auth/callback`   | AuthCallbackPage    |
| `*`                | NotFoundPage        |

## Protected Routes

| Path          | Guard                          | Component         |
|---------------|--------------------------------|-------------------|
| `/dashboard`  | donor/volunteer/teacher/...    | DashboardPage     |
| `/donations`  | donor/admin/super_admin        | DonationHistoryPage|
| `/teacher`    | teacher                        | TeacherDashboard  |

## Admin Routes (under `ProtectedRoute` with `super_admin`, `admin`, `finance_manager`)

### Dashboard
- `/admin` — redirects based on role
- `/admin/students` — Student management
- `/admin/donations` — Donations management
- `/admin/news` — News management
- `/admin/gallery` — Gallery management
- `/admin/contacts` — Contact inquiries
- `/admin/donors` — Donor management
- `/admin/finance` — Finance dashboard
- `/admin/payments/verify` — Payment verification
- `/admin/payments/settings` — Payment gateway settings
- `/admin/sponsorships` — Sponsorship dashboard
- `/admin/volunteers` — Volunteer management
- `/admin/events` — Events management
- `/admin/notifications` — Notifications
- `/admin/reports` — Reports

### Content Management
- `/admin/content` — CMS dashboard
- `/admin/content/homepage` — Homepage editor
- `/admin/content/gallery` — Gallery manager
- `/admin/content/videos` — Video manager
- `/admin/content/testimonials` — Testimonials
- `/admin/content/news` — News manager
- `/admin/content/stories` — Student stories
- `/admin/content/transparency` — Transparency content
- `/admin/content/faqs` — FAQ manager
- `/admin/content/media` — Media library
- `/admin/content/pages/:slug` — Page editor (About, Contact, Volunteer, Privacy, Terms)
- `/admin/content/donation` — Donation page content
- `/admin/content/sponsorship` — Sponsorship page content
- `/admin/content/volunteer` — Volunteer page content
- `/admin/content/footer` — Footer content
- `/admin/content/transparency` — Transparency content
- `/admin/content/images` — Site images
- `/admin/content/sections` — Section visibility
- `/admin/content/versions` — Version history
- `/admin/content/settings` — Site settings
- `/admin/content/navigation` — Navigation manager
- `/admin/content/announcements` — Announcements
- `/admin/content/partners` — Partners

### Design
- `/admin/design` — Design dashboard
- `/admin/design/branding` — Branding
- `/admin/design/colors` — Colors
- `/admin/design/typography` — Typography
- `/admin/design/layout` — Layout
- `/admin/design/components` — Component styles
- `/admin/design/config` — Config
- `/admin/design/presets` — Theme presets

## Super Admin Routes (under `ProtectedRoute` with `super_admin`)

- `/super-admin/users` — User management
- `/super-admin/roles` — Role management
- `/super-admin/audit` — Audit logs
- `/super-admin/notifications` — Notifications
