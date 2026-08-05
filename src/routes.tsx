import { lazy, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { Layout } from './layout/Layout'
import { useAuth } from './context/AuthContext'
import { DashboardSkeleton } from './components/ui/LoadingSkeleton'
import { getRedirectPath } from './features/auth/utils/redirectByRole'
import type { Role } from './features/auth/types/permissions'
import { RouteErrorPage } from './components/pages/RouteErrorPage'
import { AdminErrorPage } from './components/pages/AdminErrorPage'

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <DashboardSkeleton />
      </div>
    }>
      <Component />
    </Suspense>
  )
}

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))

const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))

const SponsorshipPage = lazy(() => import('./pages/SponsorshipPage').then(m => ({ default: m.SponsorshipPage })))

const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })))

const StudentDetailPage = lazy(() => import('./pages/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })))

const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })))

const NewsPage = lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })))

const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })))

const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })))

const DonatePage = lazy(() => import('./pages/DonatePage').then(m => ({ default: m.DonatePage })))

const TransparencyPage = lazy(() => import('./pages/TransparencyPage').then(m => ({ default: m.TransparencyPage })))

const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })))

const VolunteerPage = lazy(() => import('./pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })))

const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))

const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))

const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))

const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))

const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))

const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

const DashboardPage = lazy(() => import('./features/donor-dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))

const CampaignsPage = lazy(() => import('./pages/CampaignsPage').then(m => ({ default: m.CampaignsPage })))

const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage').then(m => ({ default: m.SuccessStoriesPage })))

const ActivityPage = lazy(() => import('./pages/ActivityPage').then(m => ({ default: m.ActivityPage })))

const DonationHistoryPage = lazy(() => import('./pages/DonationHistoryPage').then(m => ({ default: m.DonationHistoryPage })))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))

const AdminStudentsPage = lazy(() => import('./pages/admin/AdminStudentsPage').then(m => ({ default: m.AdminStudentsPage })))

const AdminDonationsPage = lazy(() => import('./pages/admin/AdminDonationsPage').then(m => ({ default: m.AdminDonationsPage })))

const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage').then(m => ({ default: m.AdminNewsPage })))

const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage').then(m => ({ default: m.AdminGalleryPage })))

const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage').then(m => ({ default: m.AdminContactsPage })))

const AdminDonorsPage = lazy(() => import('./pages/admin/AdminDonorsPage').then(m => ({ default: m.AdminDonorsPage })))

const AdminPaymentVerificationPage = lazy(() => import('./pages/admin/AdminPaymentVerificationPage').then(m => ({ default: m.AdminPaymentVerificationPage })))

const AdminPaymentSettingsPage = lazy(() => import('./pages/admin/AdminPaymentSettingsPage').then(m => ({ default: m.AdminPaymentSettingsPage })))

const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage').then(m => ({ default: m.AdminEventsPage })))

const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })))

const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))

const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))

const SuperAdminLayout = lazy(() => import('./pages/super-admin/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })))

const SuperAdminUsersPage = lazy(() => import('./pages/super-admin/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })))

const SuperAdminRolesPage = lazy(() => import('./pages/super-admin/SuperAdminRolesPage').then(m => ({ default: m.SuperAdminRolesPage })))

const SuperAdminAuditLogsPage = lazy(() => import('./pages/super-admin/SuperAdminAuditLogsPage').then(m => ({ default: m.SuperAdminAuditLogsPage })))

const SuperAdminNotificationsPage = lazy(() => import('./pages/super-admin/SuperAdminNotificationsPage').then(m => ({ default: m.SuperAdminNotificationsPage })))

const SuperAdminDashboard = lazy(() => import('./pages/admin/dashboards/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })))

const FinanceDashboard = lazy(() => import('./pages/admin/dashboards/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })))

const SponsorshipDashboard = lazy(() => import('./pages/admin/dashboards/SponsorshipDashboard').then(m => ({ default: m.SponsorshipDashboard })))

const VolunteerDashboard = lazy(() => import('./pages/admin/dashboards/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })))

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })))

const WebsiteDashboard = lazy(() => import('./pages/admin/website/WebsiteDashboard').then(m => ({ default: m.WebsiteDashboard })))
const WebsiteBuilder = lazy(() => import('./pages/admin/website/WebsiteBuilder').then(m => ({ default: m.WebsiteBuilder })))
const MediaLibrary = lazy(() => import('./pages/admin/website/MediaLibrary').then(m => ({ default: m.MediaLibrary })))
const BrandingEditor = lazy(() => import('./pages/admin/website/editors/BrandingEditor').then(m => ({ default: m.BrandingEditor })))
const SEOEditor = lazy(() => import('./pages/admin/website/editors/SEOEditor').then(m => ({ default: m.SEOEditor })))
const AboutPageEditor = lazy(() => import('./pages/admin/website/editors/AboutPageEditor').then(m => ({ default: m.AboutPageEditor })))
const ContactPageEditor = lazy(() => import('./pages/admin/website/editors/ContactPageEditor').then(m => ({ default: m.ContactPageEditor })))
const CampaignsEditor = lazy(() => import('./pages/admin/website/editors/CampaignsEditor').then(m => ({ default: m.CampaignsEditor })))
const PrivacyPageEditor = lazy(() => import('./pages/admin/website/editors/PrivacyPageEditor').then(m => ({ default: m.PrivacyPageEditor })))
const TermsPageEditor = lazy(() => import('./pages/admin/website/editors/TermsPageEditor').then(m => ({ default: m.TermsPageEditor })))
const HomePageEditor = lazy(() => import('./pages/admin/website/editors/HomePageEditor').then(m => ({ default: m.HomePageEditor })))

const AdminContentGallery = lazy(() => import('./pages/admin/cms/AdminContentGallery').then(m => ({ default: m.AdminContentGallery })))

const AdminVideoManager = lazy(() => import('./pages/admin/cms/AdminVideoManager').then(m => ({ default: m.AdminVideoManager })))

const AdminContentTestimonials = lazy(() => import('./pages/admin/cms/AdminContentTestimonials').then(m => ({ default: m.AdminContentTestimonials })))

const AdminContentNews = lazy(() => import('./pages/admin/cms/AdminContentNews').then(m => ({ default: m.AdminContentNews })))

const AdminStudentStories = lazy(() => import('./pages/admin/cms/AdminStudentStories').then(m => ({ default: m.AdminStudentStories })))

const AdminTransparencyContent = lazy(() => import('./pages/admin/cms/AdminTransparencyContent').then(m => ({ default: m.AdminTransparencyContent })))

const AdminFaqManager = lazy(() => import('./pages/admin/cms/AdminFaqManager').then(m => ({ default: m.AdminFaqManager })))

const AdminPageEditor = lazy(() => import('./pages/admin/cms/AdminPageEditor').then(m => ({ default: m.AdminPageEditor })))

const AdminVersionHistory = lazy(() => import('./pages/admin/cms/AdminVersionHistory').then(m => ({ default: m.AdminVersionHistory })))

const AdminSiteSettings = lazy(() => import('./pages/admin/cms/AdminSiteSettings').then(m => ({ default: m.AdminSiteSettings })))

const AdminNavigationManager = lazy(() => import('./pages/admin/cms/AdminNavigationManager').then(m => ({ default: m.AdminNavigationManager })))

const AdminAnnouncements = lazy(() => import('./pages/admin/cms/AdminAnnouncements').then(m => ({ default: m.AdminAnnouncements })))

const AdminPartners = lazy(() => import('./pages/admin/cms/AdminPartners').then(m => ({ default: m.AdminPartners })))

const AdminDonationContent = lazy(() => import('./pages/admin/cms/AdminDonationContent').then(m => ({ default: m.AdminDonationContent })))

const AdminSponsorshipContent = lazy(() => import('./pages/admin/cms/AdminSponsorshipContent').then(m => ({ default: m.AdminSponsorshipContent })))

const AdminVolunteerContent = lazy(() => import('./pages/admin/cms/AdminVolunteerContent').then(m => ({ default: m.AdminVolunteerContent })))

const AdminFooterContent = lazy(() => import('./pages/admin/cms/AdminFooterContent').then(m => ({ default: m.AdminFooterContent })))

const AdminSiteImages = lazy(() => import('./pages/admin/cms/AdminSiteImages').then(m => ({ default: m.AdminSiteImages })))

const AdminSectionVisibility = lazy(() => import('./pages/admin/cms/AdminSectionVisibility').then(m => ({ default: m.AdminSectionVisibility })))

const AdminDesignDashboard = lazy(() => import('./pages/admin/design/AdminDesignDashboard').then(m => ({ default: m.AdminDesignDashboard })))
const AdminBrandingPage = lazy(() => import('./pages/admin/design/AdminBrandingPage').then(m => ({ default: m.AdminBrandingPage })))
const AdminColorsPage = lazy(() => import('./pages/admin/design/AdminColorsPage').then(m => ({ default: m.AdminColorsPage })))
const AdminTypographyPage = lazy(() => import('./pages/admin/design/AdminTypographyPage').then(m => ({ default: m.AdminTypographyPage })))
const AdminLayoutPage = lazy(() => import('./pages/admin/design/AdminLayoutPage').then(m => ({ default: m.AdminLayoutPage })))
const AdminComponentsPage = lazy(() => import('./pages/admin/design/AdminComponentsPage').then(m => ({ default: m.AdminComponentsPage })))
const AdminConfigPage = lazy(() => import('./pages/admin/design/AdminConfigPage').then(m => ({ default: m.AdminConfigPage })))
const AdminThemePresetsPage = lazy(() => import('./pages/admin/design/AdminThemePresetsPage').then(m => ({ default: m.AdminThemePresetsPage })))

function AdminIndexRedirect() {
  const { profile, loading, user } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <DashboardSkeleton />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />

  const redirectPath = getRedirectPath(profile.role as Role)
  if (redirectPath !== '/admin') {
    return <Navigate to={redirectPath} replace />
  }
  return <LazyPage Component={SuperAdminDashboard} />
}

export const routeDefinitions = [
  {
    element: (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    ),
    children: [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <LazyPage Component={HomePage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'about', element: <LazyPage Component={AboutPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'sponsor', element: <LazyPage Component={SponsorshipPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'students', element: <LazyPage Component={StudentsPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'students/:id', element: <LazyPage Component={StudentDetailPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'gallery', element: <LazyPage Component={GalleryPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'news', element: <LazyPage Component={NewsPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'news/:id', element: <LazyPage Component={NewsDetailPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'contact', element: <LazyPage Component={ContactPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'donate', element: <LazyPage Component={DonatePage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'transparency', element: <LazyPage Component={TransparencyPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'faq', element: <LazyPage Component={FAQPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'volunteer', element: <LazyPage Component={VolunteerPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'campaigns', element: <LazyPage Component={CampaignsPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'success-stories', element: <LazyPage Component={SuccessStoriesPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'activity', element: <LazyPage Component={ActivityPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'privacy', element: <LazyPage Component={PrivacyPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'terms', element: <LazyPage Component={TermsPage} />, errorElement: <RouteErrorPage simple /> },
      { path: 'login', element: <LazyPage Component={LoginPage} />, errorElement: <RouteErrorPage /> },
      { path: 'register', element: <Navigate to="/login" replace /> },
      { path: 'forgot-password', element: <LazyPage Component={ForgotPasswordPage} />, errorElement: <RouteErrorPage /> },
      { path: 'reset-password', element: <LazyPage Component={ResetPasswordPage} />, errorElement: <RouteErrorPage /> },
      { path: 'auth/callback', element: <LazyPage Component={AuthCallbackPage} />, errorElement: <RouteErrorPage /> },
      { path: '*', element: <LazyPage Component={NotFoundPage} />, errorElement: <RouteErrorPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'admin', 'donor', 'volunteer', 'teacher', 'finance_manager']}>
        <LazyPage Component={DashboardPage} />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/donations',
    element: (
      <ProtectedRoute requiredRoles={['donor', 'super_admin', 'admin']}>
        <LazyPage Component={DonationHistoryPage} />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'admin', 'finance_manager']}>
        <LazyPage Component={AdminLayout} />
      </ProtectedRoute>
    ),
    errorElement: <AdminErrorPage />,
    children: [
      { index: true, element: <AdminIndexRedirect /> },
      { path: 'students', element: <LazyPage Component={AdminStudentsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'donations', element: <LazyPage Component={AdminDonationsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'news', element: <LazyPage Component={AdminNewsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'gallery', element: <LazyPage Component={AdminGalleryPage} />, errorElement: <AdminErrorPage /> },
      { path: 'contacts', element: <LazyPage Component={AdminContactsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'donors', element: <LazyPage Component={AdminDonorsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'finance', element: <LazyPage Component={FinanceDashboard} />, errorElement: <AdminErrorPage /> },
      { path: 'payments/verify', element: <LazyPage Component={AdminPaymentVerificationPage} />, errorElement: <AdminErrorPage /> },
      { path: 'payments/settings', element: <LazyPage Component={AdminPaymentSettingsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'sponsorships', element: <LazyPage Component={SponsorshipDashboard} />, errorElement: <AdminErrorPage /> },
      { path: 'volunteers', element: <LazyPage Component={VolunteerDashboard} />, errorElement: <AdminErrorPage /> },
      { path: 'events', element: <LazyPage Component={AdminEventsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'notifications', element: <LazyPage Component={AdminNotificationsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'reports', element: <LazyPage Component={AdminReportsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'users', element: <LazyPage Component={AdminUsersPage} />, errorElement: <AdminErrorPage /> },

      { path: 'website', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={WebsiteDashboard} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/builder', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={WebsiteBuilder} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/media', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={MediaLibrary} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/homepage', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={HomePageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/about', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AboutPageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/contact', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={ContactPageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/campaigns', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={CampaignsEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/privacy', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={PrivacyPageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/terms', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={TermsPageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/branding', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={BrandingEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/seo', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={SEOEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/donation', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminDonationContent} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/sponsorship', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminSponsorshipContent} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/volunteer', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminVolunteerContent} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/footer', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminFooterContent} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/navigation', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminNavigationManager} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/gallery', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminContentGallery} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/testimonials', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminContentTestimonials} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/news', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminContentNews} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/stories', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminStudentStories} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/faqs', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminFaqManager} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/videos', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminVideoManager} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/announcements', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminAnnouncements} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/partners', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminPartners} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/settings', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminSiteSettings} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/versions', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminVersionHistory} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/images', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminSiteImages} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/sections', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminSectionVisibility} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/transparency', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminTransparencyContent} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
      { path: 'website/pages/:slug', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={AdminPageEditor} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },

      { path: 'design', element: <LazyPage Component={AdminDesignDashboard} />, errorElement: <AdminErrorPage /> },
      { path: 'design/branding', element: <LazyPage Component={AdminBrandingPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/colors', element: <LazyPage Component={AdminColorsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/typography', element: <LazyPage Component={AdminTypographyPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/layout', element: <LazyPage Component={AdminLayoutPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/components', element: <LazyPage Component={AdminComponentsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/config', element: <LazyPage Component={AdminConfigPage} />, errorElement: <AdminErrorPage /> },
      { path: 'design/presets', element: <LazyPage Component={AdminThemePresetsPage} />, errorElement: <AdminErrorPage /> },
    ],
  },
  {
    path: '/super-admin',
    element: (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <LazyPage Component={SuperAdminLayout} />
      </ProtectedRoute>
    ),
    errorElement: <AdminErrorPage />,
    children: [
      { index: true, element: <LazyPage Component={SuperAdminUsersPage} />, errorElement: <AdminErrorPage /> },
      { path: 'users', element: <LazyPage Component={SuperAdminUsersPage} />, errorElement: <AdminErrorPage /> },
      { path: 'roles', element: <LazyPage Component={SuperAdminRolesPage} />, errorElement: <AdminErrorPage /> },
      { path: 'audit', element: <LazyPage Component={SuperAdminAuditLogsPage} />, errorElement: <AdminErrorPage /> },
      { path: 'notifications', element: <LazyPage Component={SuperAdminNotificationsPage} />, errorElement: <AdminErrorPage /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute requiredRoles={['teacher']}>
        <LazyPage Component={TeacherDashboard} />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorPage />,
    },
    ],
  },
]
