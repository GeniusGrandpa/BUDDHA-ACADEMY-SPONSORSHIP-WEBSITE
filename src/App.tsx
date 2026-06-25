import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { CmsStringsProvider } from './context/CmsStringsContext'
import { PremiumGlobalLoader } from './components/ui/PremiumGlobalLoader'
import { router } from './routes'

function AppContent() {
  const { loading } = useAuth()

  if (loading) {
    return <PremiumGlobalLoader />
  }

  return <RouterProvider router={router} />
}

function App() {
  return (
    <LanguageProvider>
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
      <AuthProvider>
        <ThemeProvider>
          <CmsStringsProvider>
            <AppContent />
          </CmsStringsProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
