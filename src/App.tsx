import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { CmsStringsProvider } from './context/CmsStringsContext'
import { SiteBranding } from './components/SiteBranding'
import { queryClient } from './lib/query-client'
import type { RouterProviderProps } from 'react-router-dom'

function ClientToaster() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          style: {
            background: 'var(--color-success-light, #ecfdf5)',
            color: 'var(--color-success, #065f46)',
            border: '1px solid var(--color-success-light, #a7f3d0)',
          },
        },
        error: {
          style: {
            background: 'var(--color-error-light, #fff7ed)',
            color: 'var(--color-error, #9a3412)',
            border: '1px solid var(--color-error-light, #fed7aa)',
          },
          iconTheme: {
            primary: 'var(--color-warning, #f59e0b)',
            secondary: 'var(--color-error-light, #fff7ed)',
          },
        },
      }}
    />
  )
}

interface AppProps {
  router: RouterProviderProps['router']
}

function App({ router }: AppProps) {
  return (
    <HelmetProvider>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
      <ClientToaster />
      <AuthProvider>
        <ThemeProvider>
          <SiteBranding />
          <CmsStringsProvider>
            <RouterProvider router={router} />
          </CmsStringsProvider>
        </ThemeProvider>
      </AuthProvider>
      </QueryClientProvider>
    </LanguageProvider>
    </HelmetProvider>
  )
}

export default App
