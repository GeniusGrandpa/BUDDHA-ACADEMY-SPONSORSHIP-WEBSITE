# Routing

All routes defined in `src/routes.tsx` via `createBrowserRouter`.

## Public Routes (under `Layout`)

| Path | Component |
|------|-----------|
| `/` | HomePage |
| `/about` | AboutPage |
| `/sponsor` | SponsorshipPage |
| `/students` | StudentsPage |
| `/students/:id` | StudentDetailPage |
| `/gallery` | GalleryPage |
| `/news` | NewsPage |
| `/news/:id` | NewsDetailPage |
| `/contact` | ContactPage |
| `/donate` | DonatePage |
| `/transparency` | TransparencyPage |
| `/faq` | FAQPage |
| `/volunteer` | VolunteerPage |
| `/campaigns` | CampaignsPage |
| `/success-stories` | SuccessStoriesPage |
| `/activity` | ActivityPage |
| `/privacy` | PrivacyPage |
| `/terms` | TermsPage |
| `/login` | LoginPage |
| `/register` | LoginPage |
| `/forgot-password` | ForgotPasswordPage |
| `/reset-password` | ResetPasswordPage |
| `/auth/callback` | AuthCallbackPage |
| `*` | NotFoundPage |

## Protected Routes

| Path | Guard | Component |
|------|-------|-----------|
| `/dashboard` | donor/volunteer/teacher/donor/finance_manager/admin/super_admin | DashboardPage |
| `/donations` | donor/admin/super_admin | DonationHistoryPage |
| `/teacher` | teacher | TeacherDashboard |
| `/preview` | super_admin/admin | PreviewPage |
| `/preview/:page` | super_admin/admin | PreviewPage (draft content preview) |

## Admin Routes (under `ProtectedRoute` with `super_admin`, `admin`, `finance_manager`)

### Dashboard & Operations

| Path | Component |
|------|-----------|
| `/admin` | Redirects based on role |
| `/admin/students` | AdminStudentsPage |
| `/admin/donations` | AdminDonationsPage |
| `/admin/donors` | AdminDonorsPage |
| `/admin/finance` | FinanceDashboard |
| `/admin/sponsorships` | SponsorshipDashboard |
| `/admin/volunteers` | VolunteerDashboard |
| `/admin/events` | AdminEventsPage |
| `/admin/news` | AdminNewsPage |
| `/admin/gallery` | AdminGalleryPage |
| `/admin/contacts` | AdminContactsPage |
| `/admin/notifications` | AdminNotificationsPage |
| `/admin/reports` | AdminReportsPage |

### Website Management (`/admin/website/*`)

| Path | Component |
|------|-----------|
| `/admin/website` | WebsiteDashboard |
| `/admin/website/builder` | WebsiteBuilder (3-panel live preview) |
| `/admin/website/homepage` | HomePageEditor (hero + section-based homepage editor) |
| `/admin/website/about` | AboutPageEditor |
| `/admin/website/contact` | ContactPageEditor |
| `/admin/website/volunteer` | AdminVolunteerContent |
| `/admin/website/donation` | AdminDonationContent |
| `/admin/website/sponsorship` | AdminSponsorshipContent |
| `/admin/website/footer` | AdminFooterContent |
| `/admin/website/transparency` | AdminTransparencyContent |
| `/admin/website/campaigns` | CampaignsEditor |
| `/admin/website/branding` | BrandingEditor |
| `/admin/website/seo` | SEOEditor |
| `/admin/website/privacy` | PrivacyPageEditor |
| `/admin/website/terms` | TermsPageEditor |
| `/admin/website/news` | AdminContentNews |
| `/admin/website/gallery` | AdminContentGallery |
| `/admin/website/videos` | AdminVideoManager |
| `/admin/website/testimonials` | AdminContentTestimonials |
| `/admin/website/stories` | AdminStudentStories |
| `/admin/website/faqs` | AdminFaqManager |
| `/admin/website/media` | MediaLibrary |
| `/admin/website/navigation` | AdminNavigationManager |
| `/admin/website/settings` | AdminSiteSettings |
| `/admin/website/announcements` | AdminAnnouncements |
| `/admin/website/partners` | AdminPartners |
| `/admin/website/sections` | AdminSectionVisibility |
| `/admin/website/images` | AdminSiteImages |
| `/admin/website/versions` | AdminVersionHistory |

### Payments

| Path | Component |
|------|-----------|
| `/admin/payments/verify` | AdminPaymentVerificationPage |
| `/admin/payments/settings` | AdminPaymentSettingsPage |

### Design (Legacy)

| Path | Component |
|------|-----------|
| `/admin/design` | AdminDesignDashboard |
| `/admin/design/branding` | AdminBrandingPage |
| `/admin/design/colors` | AdminColorsPage |
| `/admin/design/typography` | AdminTypographyPage |
| `/admin/design/layout` | AdminLayoutPage |
| `/admin/design/components` | AdminComponentsPage |
| `/admin/design/config` | AdminConfigPage |
| `/admin/design/presets` | AdminThemePresetsPage |

### Legacy Content Redirects

Old `/admin/content/*` routes now redirect to their `/admin/website/*` equivalents via `<Navigate>`:

| Old Path | Redirects To |
|----------|-------------|
| `/admin/content` | `/admin/website` |
| `/admin/content/homepage` | `/admin/website/homepage` |
| `/admin/content/about` | `/admin/website/about` |
| `/admin/content/donation` | `/admin/website/donation` |
| `/admin/content/sponsorship` | `/admin/website/sponsorship` |
| `/admin/content/volunteer` | `/admin/website/volunteer` |
| `/admin/content/contact` | `/admin/website/contact` |
| `/admin/content/footer` | `/admin/website/footer` |
| `/admin/content/transparency` | `/admin/website/transparency` |
| `/admin/content/faqs` | `/admin/website/faqs` |
| `/admin/content/news` | `/admin/website/news` |
| `/admin/content/gallery` | `/admin/website/gallery` |
| `/admin/content/videos` | `/admin/website/videos` |
| `/admin/content/testimonials` | `/admin/website/testimonials` |
| `/admin/content/stories` | `/admin/website/stories` |
| `/admin/content/media` | `/admin/website/media` |
| `/admin/content/navigation` | `/admin/website/navigation` |
| `/admin/content/settings` | `/admin/website/settings` |
| `/admin/content/announcements` | `/admin/website/announcements` |
| `/admin/content/partners` | `/admin/website/partners` |
| `/admin/content/sections` | `/admin/website/sections` |
| `/admin/content/images` | `/admin/website/images` |
| `/admin/content/versions` | `/admin/website/versions` |
| `/admin/content/privacy` | `/admin/website/privacy` |
| `/admin/content/terms` | `/admin/website/terms` |
| `/admin/content/campaigns` | `/admin/website/campaigns` |
| `/admin/content/seo` | `/admin/website/seo` |
| `/admin/content/branding` | `/admin/website/branding` |

## Super Admin Routes (under `ProtectedRoute` with `super_admin`)

| Path | Component |
|------|-----------|
| `/super-admin` | SuperAdminDashboard |
| `/super-admin/users` | SuperAdminUsersPage |
| `/super-admin/roles` | SuperAdminRolesPage |
| `/super-admin/audit` | SuperAdminAuditLogsPage |
| `/super-admin/notifications` | SuperAdminNotificationsPage |
