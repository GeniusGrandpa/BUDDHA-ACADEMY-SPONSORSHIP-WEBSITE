import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { AdminPageToolbar } from '../components/AdminPageToolbar'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SeoMetadata } from '../lib/seo-metadata'
import { useLanguage } from '../context/LanguageContext'
import { getPageIdFromPath } from '../lib/translation/page'
import { PageTranslator } from '../components/PageTranslator'

export function Layout() {
  const location = useLocation()
  const { setPage } = useLanguage()
  const pageSlug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '').split('/')[0]
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/teacher')

  useEffect(() => {
    setPage(getPageIdFromPath(location.pathname))
  }, [location.pathname, setPage])
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] overflow-x-hidden">
      <SeoMetadata routeSlug={isAdminRoute ? '' : pageSlug} />
      <Header />
      <main className="flex-grow w-full max-w-[100vw]">
        <div key={location.pathname} className="page-fade">
          <ErrorBoundary context={pageSlug}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
      {!isAdminRoute && <AdminPageToolbar pageSlug={pageSlug} />}
      <PageTranslator />
    </div>
  )
}
