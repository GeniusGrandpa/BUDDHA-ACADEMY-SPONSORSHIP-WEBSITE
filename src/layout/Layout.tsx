import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { AdminPageToolbar } from '../components/AdminPageToolbar'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SeoMetadata } from '../lib/seo-metadata'

export function Layout() {
  const location = useLocation()
  const pageSlug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '').split('/')[0]
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/teacher')
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] overflow-x-hidden">
      <SeoMetadata routeSlug={isAdminRoute ? '' : pageSlug} />
      <Header />
      <main className="flex-grow w-full max-w-[100vw]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <ErrorBoundary context={pageSlug}>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      {!isAdminRoute && <AdminPageToolbar pageSlug={pageSlug} />}
    </div>
  )
}
