import type { RouteObject } from 'react-router-dom'
import { Outlet, redirect } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { LocaleRouteSync } from './components/LocaleRouteSync'
import { Layout } from './layout/Layout'
import { LocaleGuard } from './components/LocaleGuard'
import { RouteErrorPage } from './components/pages/RouteErrorPage'
import { AdminErrorPage } from './components/pages/AdminErrorPage'
import { DEFAULT_LOCALE } from './i18n'
import { ENABLE_VISUAL_BUILDER } from './config/feature-flags'
import { Navigate } from 'react-router-dom'
import { LazyPage, AdminIndexRedirect, HomePage, AboutPage, SponsorshipPage, StudentsPage, StudentDetailPage, GalleryPage, NewsPage, NewsDetailPage, ContactPage, DonatePage, EsewaReturnPage, TransparencyPage, FAQPage, VolunteerPage, PrivacyPage, TermsPage, LoginPage, ForgotPasswordPage, ResetPasswordPage, AuthCallbackPage, NotFoundPage, DashboardPage, CampaignsPage, SuccessStoriesPage, ActivityPage, DonationHistoryPage, AdminLayout, AdminStudentsPage, AdminDonationsPage, AdminNewsPage, AdminGalleryPage, AdminContactsPage, AdminDonorsPage, AdminPaymentVerificationPage, AdminPaymentSettingsPage, AdminEventsPage, AdminNotificationsPage, AdminReportsPage, AdminUsersPage, AdminTeacherManagement, AdminTeacherAssignments, SuperAdminLayout, SuperAdminUsersPage, SuperAdminRolesPage, SuperAdminAuditLogsPage, SuperAdminNotificationsPage, FinanceDashboard, SponsorshipDashboard, VolunteerDashboard, TeacherDashboard, WebsiteDashboard, WebsiteBuilder, MediaLibrary, BrandingEditor, SEOEditor, AboutPageEditor, ContactPageEditor, CampaignsEditor, PrivacyPageEditor, TermsPageEditor, HomePageEditor, AdminContentGallery, AdminVideoManager, AdminContentTestimonials, AdminContentNews, AdminStudentStories, AdminTransparencyContent, AdminFaqManager, AdminPageEditor, AdminVersionHistory, AdminSiteSettings, AdminNavigationManager, AdminAnnouncements, AdminPartners, AdminDonationContent, AdminSponsorshipContent, AdminVolunteerContent, AdminFooterContent, AdminSiteImages, AdminSectionVisibility, AdminDesignDashboard, AdminBrandingPage, AdminColorsPage, AdminTypographyPage, AdminLayoutPage, AdminComponentsPage, AdminConfigPage, AdminThemePresetsPage, PreviewPage, KhaltiReturnPage } from './route-pages'

export const routeDefinitions: RouteObject[] = [
  {
    element: (
      <>
        <LocaleRouteSync />
        <ScrollToTop />
        <Outlet />
      </>
    ),
    children: [
      { path: '/', loader: () => redirect(`/${DEFAULT_LOCALE}`) },
      { path: '/auth/callback', element: <LazyPage Component={AuthCallbackPage} />, errorElement: <RouteErrorPage /> },
      {
        path: '/:locale',
        element: (
          <LocaleGuard>
            <Layout />
          </LocaleGuard>
        ),
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
          { path: 'register', loader: () => redirect('/login'), element: null },
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
        path: '/dashboard/*',
        element: <Navigate to="/dashboard" replace />,
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
        path: '/donate/esewa/return',
        element: <LazyPage Component={EsewaReturnPage} />,
        errorElement: <RouteErrorPage />,
      },
      {
        path: '/donate/khalti/return',
        element: <LazyPage Component={KhaltiReturnPage} />,
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
          { path: 'teachers', element: <LazyPage Component={AdminTeacherManagement} />, errorElement: <AdminErrorPage /> },
          { path: 'teacher-assignments', element: <LazyPage Component={AdminTeacherAssignments} />, errorElement: <AdminErrorPage /> },
          { path: 'website', element: <ProtectedRoute requiredRoles={['super_admin', 'admin']}><LazyPage Component={WebsiteDashboard} /></ProtectedRoute>, errorElement: <AdminErrorPage /> },
          ...(ENABLE_VISUAL_BUILDER
            ? [
                {
                  path: 'website/builder',
                  element: (
                    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                      <LazyPage Component={WebsiteBuilder} />
                    </ProtectedRoute>
                  ),
                  errorElement: <AdminErrorPage />,
                },
              ]
            : [
                {
                  path: 'website/builder',
                  element: (
                    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                      <Navigate to="/admin/website" replace />
                    </ProtectedRoute>
                  ),
                  errorElement: <AdminErrorPage />,
                },
              ]),
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
      {
        path: '/teacher/*',
        element: <Navigate to="/teacher" replace />,
        errorElement: <RouteErrorPage />,
      },
      {
        path: '/teacher/dashboard',
        element: <Navigate to="/teacher" replace />,
        errorElement: <RouteErrorPage />,
      },
      {
        path: '/preview',
        element: (
          <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
            <LazyPage Component={PreviewPage} />
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorPage />,
      },
      {
        path: '/preview/:page',
        element: (
          <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
            <LazyPage Component={PreviewPage} />
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorPage />,
      },
    ],
  },
]
