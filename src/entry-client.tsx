import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import App from './App'
import { routeDefinitions } from './routes'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { logger } from './lib/logger'
import { getErrorMessage } from './lib/errors'
import { setPreviewMode } from './lib/preview-mode'
import { getBrowserLanguage, localeFromPath } from './lib/locale'
import i18n from './i18n'

if (typeof window !== 'undefined' && window.location.pathname.startsWith('/preview')) {
  setPreviewMode(true)
}

function setupGlobalErrorHandlers(): void {
  let lastToastAt = 0

  const throttledToast = (message: string) => {
    if (!import.meta.env.PROD) return
    const now = Date.now()
    if (now - lastToastAt < 5000) return
    lastToastAt = now
    toast.error(message, { duration: 6000 })
  }

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    logger.error('Unhandled promise rejection', event.reason)
    throttledToast(getErrorMessage(event.reason, 'Something went wrong. Please try again.'))
  })

  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error ?? event.message)
    throttledToast(getErrorMessage(event.error ?? event.message, 'Something went wrong. Please try again.'))
  })
}

setupGlobalErrorHandlers()

const router = createBrowserRouter(routeDefinitions)

const rootElement = document.getElementById('root')!

const initialLanguage = localeFromPath(window.location.pathname) || getBrowserLanguage()

if (i18n.language !== initialLanguage) {
  void i18n.changeLanguage(initialLanguage)
}

const hasServerContent = rootElement.children.length > 0
if (hasServerContent) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <ErrorBoundary>
        <App router={router} initialLanguage={initialLanguage} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App router={router} initialLanguage={initialLanguage} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
