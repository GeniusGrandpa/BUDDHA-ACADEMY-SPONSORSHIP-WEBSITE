import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DashboardSkeleton } from './components/ui/LoadingSkeleton'
import { getRedirectPath } from './features/auth/utils/redirectByRole'
import type { Role } from './features/auth/types/permissions'

export function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
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

export const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))

export const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))

export const SponsorshipPage = lazy(() => import('./pages/SponsorshipPage').then(m => ({ default: m.SponsorshipPage })))

export const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })))

export const StudentDetailPage = lazy(() => import('./pages/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })))

export const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })))

export const NewsPage = lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })))

export const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })))

export const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })))

export const DonatePage = lazy(() => import('./pages/DonatePage').then(m => ({ default: m.DonatePage })))

export const TransparencyPage = lazy(() => import('./pages/TransparencyPage').then(m => ({ default: m.TransparencyPage })))

export const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })))

export const VolunteerPage = lazy(() => import('./pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })))

export const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))

export const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))

export const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))

export const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))

export const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))

export const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))

export const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

export const DashboardPage = lazy(() => import('./features/donor-dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))

export const CampaignsPage = lazy(() => import('./pages/CampaignsPage').then(m => ({ default: m.CampaignsPage })))

export const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage').then(m => ({ default: m.SuccessStoriesPage })))

export const ActivityPage = lazy(() => import('./pages/ActivityPage').then(m => ({ default: m.ActivityPage })))

export const DonationHistoryPage = lazy(() => import('./pages/DonationHistoryPage').then(m => ({ default: m.DonationHistoryPage })))

export const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))

export const AdminStudentsPage = lazy(() => import('./pages/admin/AdminStudentsPage').then(m => ({ default: m.AdminStudentsPage })))

export const AdminDonationsPage = lazy(() => import('./pages/admin/AdminDonationsPage').then(m => ({ default: m.AdminDonationsPage })))

export const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage').then(m => ({ default: m.AdminNewsPage })))

export const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage').then(m => ({ default: m.AdminGalleryPage })))

export const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage').then(m => ({ default: m.AdminContactsPage })))

export const AdminDonorsPage = lazy(() => import('./pages/admin/AdminDonorsPage').then(m => ({ default: m.AdminDonorsPage })))

export const AdminPaymentVerificationPage = lazy(() => import('./pages/admin/AdminPaymentVerificationPage').then(m => ({ default: m.AdminPaymentVerificationPage })))

export const AdminPaymentSettingsPage = lazy(() => import('./pages/admin/AdminPaymentSettingsPage').then(m => ({ default: m.AdminPaymentSettingsPage })))

export const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage').then(m => ({ default: m.AdminEventsPage })))

export const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })))

export const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))

export const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))

export const SuperAdminLayout = lazy(() => import('./pages/super-admin/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })))

export const SuperAdminUsersPage = lazy(() => import('./pages/super-admin/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })))

export const SuperAdminRolesPage = lazy(() => import('./pages/super-admin/SuperAdminRolesPage').then(m => ({ default: m.SuperAdminRolesPage })))

export const SuperAdminAuditLogsPage = lazy(() => import('./pages/super-admin/SuperAdminAuditLogsPage').then(m => ({ default: m.SuperAdminAuditLogsPage })))

export const SuperAdminNotificationsPage = lazy(() => import('./pages/super-admin/SuperAdminNotificationsPage').then(m => ({ default: m.SuperAdminNotificationsPage })))

export const SuperAdminDashboard = lazy(() => import('./pages/admin/dashboards/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })))

export const FinanceDashboard = lazy(() => import('./pages/admin/dashboards/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })))

export const SponsorshipDashboard = lazy(() => import('./pages/admin/dashboards/SponsorshipDashboard').then(m => ({ default: m.SponsorshipDashboard })))

export const VolunteerDashboard = lazy(() => import('./pages/admin/dashboards/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })))

export const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })))

export const WebsiteDashboard = lazy(() => import('./pages/admin/website/WebsiteDashboard').then(m => ({ default: m.WebsiteDashboard })))
export const WebsiteBuilder = lazy(() => import('./pages/admin/website/WebsiteBuilder').then(m => ({ default: m.WebsiteBuilder })))
export const MediaLibrary = lazy(() => import('./pages/admin/website/MediaLibrary').then(m => ({ default: m.MediaLibrary })))
export const BrandingEditor = lazy(() => import('./pages/admin/website/editors/BrandingEditor').then(m => ({ default: m.BrandingEditor })))
export const SEOEditor = lazy(() => import('./pages/admin/website/editors/SEOEditor').then(m => ({ default: m.SEOEditor })))
export const AboutPageEditor = lazy(() => import('./pages/admin/website/editors/AboutPageEditor').then(m => ({ default: m.AboutPageEditor })))
export const ContactPageEditor = lazy(() => import('./pages/admin/website/editors/ContactPageEditor').then(m => ({ default: m.ContactPageEditor })))
export const CampaignsEditor = lazy(() => import('./pages/admin/website/editors/CampaignsEditor').then(m => ({ default: m.CampaignsEditor })))
export const PrivacyPageEditor = lazy(() => import('./pages/admin/website/editors/PrivacyPageEditor').then(m => ({ default: m.PrivacyPageEditor })))
export const TermsPageEditor = lazy(() => import('./pages/admin/website/editors/TermsPageEditor').then(m => ({ default: m.TermsPageEditor })))
export const HomePageEditor = lazy(() => import('./pages/admin/website/editors/HomePageEditor').then(m => ({ default: m.HomePageEditor })))

export const AdminContentGallery = lazy(() => import('./pages/admin/cms/AdminContentGallery').then(m => ({ default: m.AdminContentGallery })))

export const AdminVideoManager = lazy(() => import('./pages/admin/cms/AdminVideoManager').then(m => ({ default: m.AdminVideoManager })))

export const AdminContentTestimonials = lazy(() => import('./pages/admin/cms/AdminContentTestimonials').then(m => ({ default: m.AdminContentTestimonials })))

export const AdminContentNews = lazy(() => import('./pages/admin/cms/AdminContentNews').then(m => ({ default: m.AdminContentNews })))

export const AdminStudentStories = lazy(() => import('./pages/admin/cms/AdminStudentStories').then(m => ({ default: m.AdminStudentStories })))

export const AdminTransparencyContent = lazy(() => import('./pages/admin/cms/AdminTransparencyContent').then(m => ({ default: m.AdminTransparencyContent })))

export const AdminFaqManager = lazy(() => import('./pages/admin/cms/AdminFaqManager').then(m => ({ default: m.AdminFaqManager })))

export const AdminPageEditor = lazy(() => import('./pages/admin/cms/AdminPageEditor').then(m => ({ default: m.AdminPageEditor })))

export const AdminVersionHistory = lazy(() => import('./pages/admin/cms/AdminVersionHistory').then(m => ({ default: m.AdminVersionHistory })))

export const AdminSiteSettings = lazy(() => import('./pages/admin/cms/AdminSiteSettings').then(m => ({ default: m.AdminSiteSettings })))

export const AdminNavigationManager = lazy(() => import('./pages/admin/cms/AdminNavigationManager').then(m => ({ default: m.AdminNavigationManager })))

export const AdminAnnouncements = lazy(() => import('./pages/admin/cms/AdminAnnouncements').then(m => ({ default: m.AdminAnnouncements })))

export const AdminPartners = lazy(() => import('./pages/admin/cms/AdminPartners').then(m => ({ default: m.AdminPartners })))

export const AdminDonationContent = lazy(() => import('./pages/admin/cms/AdminDonationContent').then(m => ({ default: m.AdminDonationContent })))

export const AdminSponsorshipContent = lazy(() => import('./pages/admin/cms/AdminSponsorshipContent').then(m => ({ default: m.AdminSponsorshipContent })))

export const AdminVolunteerContent = lazy(() => import('./pages/admin/cms/AdminVolunteerContent').then(m => ({ default: m.AdminVolunteerContent })))

export const AdminFooterContent = lazy(() => import('./pages/admin/cms/AdminFooterContent').then(m => ({ default: m.AdminFooterContent })))

export const AdminSiteImages = lazy(() => import('./pages/admin/cms/AdminSiteImages').then(m => ({ default: m.AdminSiteImages })))

export const AdminSectionVisibility = lazy(() => import('./pages/admin/cms/AdminSectionVisibility').then(m => ({ default: m.AdminSectionVisibility })))

export const AdminDesignDashboard = lazy(() => import('./pages/admin/design/AdminDesignDashboard').then(m => ({ default: m.AdminDesignDashboard })))
export const AdminBrandingPage = lazy(() => import('./pages/admin/design/AdminBrandingPage').then(m => ({ default: m.AdminBrandingPage })))
export const AdminColorsPage = lazy(() => import('./pages/admin/design/AdminColorsPage').then(m => ({ default: m.AdminColorsPage })))
export const AdminTypographyPage = lazy(() => import('./pages/admin/design/AdminTypographyPage').then(m => ({ default: m.AdminTypographyPage })))
export const AdminLayoutPage = lazy(() => import('./pages/admin/design/AdminLayoutPage').then(m => ({ default: m.AdminLayoutPage })))
export const AdminComponentsPage = lazy(() => import('./pages/admin/design/AdminComponentsPage').then(m => ({ default: m.AdminComponentsPage })))
export const AdminConfigPage = lazy(() => import('./pages/admin/design/AdminConfigPage').then(m => ({ default: m.AdminConfigPage })))
export const AdminThemePresetsPage = lazy(() => import('./pages/admin/design/AdminThemePresetsPage').then(m => ({ default: m.AdminThemePresetsPage })))

export const PreviewPage = lazy(() => import('./pages/preview/PreviewPage').then(m => ({ default: m.PreviewPage })))

export function AdminIndexRedirect() {
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

