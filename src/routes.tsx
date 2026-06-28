/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './layout/Layout'
import { useAuth } from './context/AuthContext'
import { DashboardSkeleton } from './components/ui/LoadingSkeleton'
import { getRedirectPath } from './features/auth/utils/redirectByRole'
import type { Role } from './features/auth/types/permissions'

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <LazyPage Component={NotFoundPage} />,
    children: [
      { index: true, element: <LazyPage Component={HomePage} /> },
      { path: 'about', element: <LazyPage Component={AboutPage} /> },
      { path: 'sponsor', element: <LazyPage Component={SponsorshipPage} /> },
      { path: 'students', element: <LazyPage Component={StudentsPage} /> },
      { path: 'students/:id', element: <LazyPage Component={StudentDetailPage} /> },
      { path: 'gallery', element: <LazyPage Component={GalleryPage} /> },
      { path: 'news', element: <LazyPage Component={NewsPage} /> },
      { path: 'news/:id', element: <LazyPage Component={NewsDetailPage} /> },
      { path: 'contact', element: <LazyPage Component={ContactPage} /> },
      { path: 'donate', element: <LazyPage Component={DonatePage} /> },
      { path: 'transparency', element: <LazyPage Component={TransparencyPage} /> },
      { path: 'faq', element: <LazyPage Component={FAQPage} /> },
      { path: 'volunteer', element: <LazyPage Component={VolunteerPage} /> },
      { path: 'campaigns', element: <LazyPage Component={CampaignsPage} /> },
      { path: 'success-stories', element: <LazyPage Component={SuccessStoriesPage} /> },
      { path: 'activity', element: <LazyPage Component={ActivityPage} /> },
      { path: 'privacy', element: <LazyPage Component={PrivacyPage} /> },
      { path: 'terms', element: <LazyPage Component={TermsPage} /> },
      { path: 'login', element: <LazyPage Component={LoginPage} /> },
      { path: 'register', element: <Navigate to="/login" replace /> },
      { path: 'forgot-password', element: <LazyPage Component={ForgotPasswordPage} /> },
      { path: 'reset-password', element: <LazyPage Component={ResetPasswordPage} /> },
      { path: 'auth/callback', element: <LazyPage Component={AuthCallbackPage} /> },
      { path: '*', element: <LazyPage Component={NotFoundPage} /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'admin', 'donor', 'volunteer', 'teacher', 'finance_manager']}>
        <LazyPage Component={DashboardPage} />
      </ProtectedRoute>
    ),
  },
  {
    path: '/donations',
    element: (
      <ProtectedRoute requiredRoles={['donor', 'super_admin', 'admin']}>
        <LazyPage Component={DonationHistoryPage} />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'admin', 'finance_manager']}>
        <LazyPage Component={AdminLayout} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminIndexRedirect /> },
      { path: 'students', element: <LazyPage Component={AdminStudentsPage} /> },
      { path: 'donations', element: <LazyPage Component={AdminDonationsPage} /> },
      { path: 'news', element: <LazyPage Component={AdminNewsPage} /> },
      { path: 'gallery', element: <LazyPage Component={AdminGalleryPage} /> },
      { path: 'contacts', element: <LazyPage Component={AdminContactsPage} /> },
      { path: 'donors', element: <LazyPage Component={AdminDonorsPage} /> },
      { path: 'finance', element: <LazyPage Component={FinanceDashboard} /> },
      { path: 'payments/verify', element: <LazyPage Component={AdminPaymentVerificationPage} /> },
      { path: 'payments/settings', element: <LazyPage Component={AdminPaymentSettingsPage} /> },
      { path: 'sponsorships', element: <LazyPage Component={SponsorshipDashboard} /> },
      { path: 'volunteers', element: <LazyPage Component={VolunteerDashboard} /> },
      { path: 'events', element: <LazyPage Component={AdminEventsPage} /> },
      { path: 'notifications', element: <LazyPage Component={AdminNotificationsPage} /> },
      { path: 'reports', element: <LazyPage Component={AdminReportsPage} /> },
      { path: 'users', element: <LazyPage Component={AdminUsersPage} /> },

      { path: 'website', element: <LazyPage Component={WebsiteDashboard} /> },
      { path: 'website/builder', element: <LazyPage Component={WebsiteBuilder} /> },
      { path: 'website/media', element: <LazyPage Component={MediaLibrary} /> },
      { path: 'website/homepage', element: <Navigate to="/admin/website/builder" replace /> },
      { path: 'website/about', element: <LazyPage Component={AboutPageEditor} /> },
      { path: 'website/contact', element: <LazyPage Component={ContactPageEditor} /> },
      { path: 'website/campaigns', element: <LazyPage Component={CampaignsEditor} /> },
      { path: 'website/privacy', element: <LazyPage Component={PrivacyPageEditor} /> },
      { path: 'website/terms', element: <LazyPage Component={TermsPageEditor} /> },
      { path: 'website/branding', element: <LazyPage Component={BrandingEditor} /> },
      { path: 'website/seo', element: <LazyPage Component={SEOEditor} /> },
      { path: 'website/donation', element: <LazyPage Component={AdminDonationContent} /> },
      { path: 'website/sponsorship', element: <LazyPage Component={AdminSponsorshipContent} /> },
      { path: 'website/volunteer', element: <LazyPage Component={AdminVolunteerContent} /> },
      { path: 'website/footer', element: <LazyPage Component={AdminFooterContent} /> },
      { path: 'website/navigation', element: <LazyPage Component={AdminNavigationManager} /> },
      { path: 'website/gallery', element: <LazyPage Component={AdminContentGallery} /> },
      { path: 'website/testimonials', element: <LazyPage Component={AdminContentTestimonials} /> },
      { path: 'website/news', element: <LazyPage Component={AdminContentNews} /> },
      { path: 'website/stories', element: <LazyPage Component={AdminStudentStories} /> },
      { path: 'website/faqs', element: <LazyPage Component={AdminFaqManager} /> },
      { path: 'website/videos', element: <LazyPage Component={AdminVideoManager} /> },
      { path: 'website/announcements', element: <LazyPage Component={AdminAnnouncements} /> },
      { path: 'website/partners', element: <LazyPage Component={AdminPartners} /> },
      { path: 'website/settings', element: <LazyPage Component={AdminSiteSettings} /> },
      { path: 'website/versions', element: <LazyPage Component={AdminVersionHistory} /> },
      { path: 'website/images', element: <LazyPage Component={AdminSiteImages} /> },
      { path: 'website/sections', element: <LazyPage Component={AdminSectionVisibility} /> },
      { path: 'website/transparency', element: <LazyPage Component={AdminTransparencyContent} /> },
      { path: 'website/pages/:slug', element: <LazyPage Component={AdminPageEditor} /> },

      { path: 'content', element: <Navigate to="/admin/website" replace /> },
      { path: 'content/homepage', element: <Navigate to="/admin/website/homepage" replace /> },
      { path: 'content/gallery', element: <Navigate to="/admin/website/gallery" replace /> },
      { path: 'content/videos', element: <Navigate to="/admin/website/videos" replace /> },
      { path: 'content/testimonials', element: <Navigate to="/admin/website/testimonials" replace /> },
      { path: 'content/news', element: <Navigate to="/admin/website/news" replace /> },
      { path: 'content/stories', element: <Navigate to="/admin/website/stories" replace /> },
      { path: 'content/transparency', element: <Navigate to="/admin/website/transparency" replace /> },
      { path: 'content/faqs', element: <Navigate to="/admin/website/faqs" replace /> },
      { path: 'content/media', element: <Navigate to="/admin/website/media" replace /> },
      { path: 'content/pages/:slug', element: <Navigate to="/admin/website/pages/:slug" replace /> },
      { path: 'content/versions', element: <Navigate to="/admin/website/versions" replace /> },
      { path: 'content/settings', element: <Navigate to="/admin/website/settings" replace /> },
      { path: 'content/navigation', element: <Navigate to="/admin/website/navigation" replace /> },
      { path: 'content/announcements', element: <Navigate to="/admin/website/announcements" replace /> },
      { path: 'content/partners', element: <Navigate to="/admin/website/partners" replace /> },
      { path: 'content/donation', element: <Navigate to="/admin/website/donation" replace /> },
      { path: 'content/sponsorship', element: <Navigate to="/admin/website/sponsorship" replace /> },
      { path: 'content/volunteer', element: <Navigate to="/admin/website/volunteer" replace /> },
      { path: 'content/footer', element: <Navigate to="/admin/website/footer" replace /> },
      { path: 'content/images', element: <Navigate to="/admin/website/images" replace /> },
      { path: 'content/sections', element: <Navigate to="/admin/website/sections" replace /> },
      { path: 'design', element: <LazyPage Component={AdminDesignDashboard} /> },
      { path: 'design/branding', element: <LazyPage Component={AdminBrandingPage} /> },
      { path: 'design/colors', element: <LazyPage Component={AdminColorsPage} /> },
      { path: 'design/typography', element: <LazyPage Component={AdminTypographyPage} /> },
      { path: 'design/layout', element: <LazyPage Component={AdminLayoutPage} /> },
      { path: 'design/components', element: <LazyPage Component={AdminComponentsPage} /> },
      { path: 'design/config', element: <LazyPage Component={AdminConfigPage} /> },
      { path: 'design/presets', element: <LazyPage Component={AdminThemePresetsPage} /> },
    ],
  },
  {
    path: '/super-admin',
    element: (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <LazyPage Component={SuperAdminLayout} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyPage Component={SuperAdminUsersPage} /> },
      { path: 'users', element: <LazyPage Component={SuperAdminUsersPage} /> },
      { path: 'roles', element: <LazyPage Component={SuperAdminRolesPage} /> },
      { path: 'audit', element: <LazyPage Component={SuperAdminAuditLogsPage} /> },
      { path: 'notifications', element: <LazyPage Component={SuperAdminNotificationsPage} /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute requiredRoles={['teacher']}>
        <LazyPage Component={TeacherDashboard} />
      </ProtectedRoute>
    ),
  },
])
