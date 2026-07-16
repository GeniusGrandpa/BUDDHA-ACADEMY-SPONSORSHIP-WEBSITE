import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { routeDefinitions } from './routes'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

if (import.meta.env.PROD) {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
  })
  window.addEventListener('error', (event) => {
    if (event.error) {
    }
  })
}

const router = createBrowserRouter(routeDefinitions)

const rootElement = document.getElementById('root')!
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <ErrorBoundary>
        <App router={router} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App router={router} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
