import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
