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
}

const router = createBrowserRouter(routeDefinitions)

const rootElement = document.getElementById('root')!
// In dev the server does not render, so `#root` only contains the
// `<!--ssr-outlet-->` placeholder comment (a child node). Only hydrate when
// an actual SSR render produced real DOM elements; otherwise do a plain
// client render. Hydrating an empty placeholder causes hydration errors.
const hasServerContent = rootElement.children.length > 0
if (hasServerContent) {
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
