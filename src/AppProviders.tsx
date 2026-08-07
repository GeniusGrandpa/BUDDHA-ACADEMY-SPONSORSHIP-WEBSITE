import type { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/providers/AuthProvider'
import { LanguageProvider } from './context/LanguageProvider'
import { TranslationProvider } from './context/TranslationProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { CmsStringsProvider } from './context/CmsStringsProvider'
import { ConfirmProvider } from './context/ConfirmProvider'
import { SiteBranding } from './components/SiteBranding'
import i18n from './i18n'

interface AppProvidersProps {
  children: ReactNode
  initialLanguage?: string
  queryClient: QueryClient
  helmetContext?: Record<string, unknown>
}

export function AppProviders({ children, initialLanguage, queryClient, helmetContext }: AppProvidersProps) {
  return (
    <HelmetProvider context={helmetContext}>
      <LanguageProvider initialLanguage={initialLanguage}>
        <I18nextProvider i18n={i18n}>
          <TranslationProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <ThemeProvider>
                  <SiteBranding />
                  <CmsStringsProvider>
                    <ConfirmProvider>{children}</ConfirmProvider>
                  </CmsStringsProvider>
                </ThemeProvider>
              </AuthProvider>
            </QueryClientProvider>
          </TranslationProvider>
        </I18nextProvider>
      </LanguageProvider>
    </HelmetProvider>
  )
}