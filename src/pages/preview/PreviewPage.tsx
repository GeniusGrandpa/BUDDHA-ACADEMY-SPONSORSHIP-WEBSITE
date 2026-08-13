import { Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../../layout/Header'
import { Footer } from '../../layout/Footer'
import { PreviewProvider } from '../../features/preview/PreviewProvider'

const HomePage = lazy(() => import('../HomePage').then(m => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('../AboutPage').then(m => ({ default: m.AboutPage })))
const SponsorshipPage = lazy(() => import('../SponsorshipPage').then(m => ({ default: m.SponsorshipPage })))
const StudentsPage = lazy(() => import('../StudentsPage').then(m => ({ default: m.StudentsPage })))
const GalleryPage = lazy(() => import('../GalleryPage').then(m => ({ default: m.GalleryPage })))
const NewsPage = lazy(() => import('../NewsPage').then(m => ({ default: m.NewsPage })))
const ContactPage = lazy(() => import('../ContactPage').then(m => ({ default: m.ContactPage })))
const DonatePage = lazy(() => import('../DonatePage').then(m => ({ default: m.DonatePage })))
const TransparencyPage = lazy(() => import('../TransparencyPage').then(m => ({ default: m.TransparencyPage })))
const FAQPage = lazy(() => import('../FAQPage').then(m => ({ default: m.FAQPage })))
const VolunteerPage = lazy(() => import('../VolunteerPage').then(m => ({ default: m.VolunteerPage })))
const CampaignsPage = lazy(() => import('../CampaignsPage').then(m => ({ default: m.CampaignsPage })))
const SuccessStoriesPage = lazy(() => import('../SuccessStoriesPage').then(m => ({ default: m.SuccessStoriesPage })))
const ActivityPage = lazy(() => import('../ActivityPage').then(m => ({ default: m.ActivityPage })))
const PrivacyPage = lazy(() => import('../PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../TermsPage').then(m => ({ default: m.TermsPage })))

const PREVIEW_PAGES: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: HomePage,
  about: AboutPage,
  sponsor: SponsorshipPage,
  students: StudentsPage,
  gallery: GalleryPage,
  news: NewsPage,
  contact: ContactPage,
  donate: DonatePage,
  transparency: TransparencyPage,
  faq: FAQPage,
  volunteer: VolunteerPage,
  campaigns: CampaignsPage,
  'success-stories': SuccessStoriesPage,
  activity: ActivityPage,
  privacy: PrivacyPage,
  terms: TermsPage,
}

function PreviewBanner() {
  return (
    <div className="sticky top-0 z-[9998] flex items-center justify-between px-4 py-2 bg-amber-500 text-white text-sm shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview — unpublished draft content
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline text-white/80">Changes are not live until published</span>
        <a
          href="/admin/website"
          className="flex items-center gap-1 px-3 py-1 rounded bg-white text-amber-700 font-medium hover:bg-amber-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Exit preview
        </a>
      </div>
    </div>
  )
}

function Fallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading preview...</p>
      </div>
    </div>
  )
}

export function PreviewPage() {
  const { page } = useParams<{ page: string }>()
  const PageComponent = (page && PREVIEW_PAGES[page]) || undefined

  return (
    <PreviewProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] overflow-x-hidden">
        <PreviewBanner />
        <Header />
        <main className="flex-grow w-full min-w-0">
          {PageComponent ? (
            <Suspense fallback={<Fallback />}>
              <PageComponent />
            </Suspense>
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h1 className="text-xl font-bold text-gray-900 mb-2">No preview available</h1>
                <p className="text-gray-500 text-sm">
                  We could not find a public page matching "{page}". Return to the admin to pick another page.
                </p>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PreviewProvider>
  )
}