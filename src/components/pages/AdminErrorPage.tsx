import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { RefreshCw, Home, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '../ui/Button'

export function AdminErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const isDev = import.meta.env.DEV

  const getErrorInfo = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        return {
          title: 'Page Not Found',
          description: 'The requested admin page does not exist or has been moved.',
          icon: '🔍',
        }
      }
      if (error.status === 403) {
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this admin resource.',
          icon: '🚫',
        }
      }
      return {
        title: 'Admin Error',
        description: error.statusText || 'An error occurred in the admin panel.',
        icon: '⚠️',
      }
    }
    return {
      title: 'Admin Error',
      description: 'An unexpected error occurred. Please try again.',
      icon: '⚠️',
    }
  }

  const { title, description, icon } = getErrorInfo()

  const handleRetry = () => {
    window.location.reload()
  }

  const goBack = () => {
    navigate(-1)
  }

  const goHome = () => {
    navigate('/')
  }

  const goAdmin = () => {
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={handleRetry} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={goAdmin} variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
          <Button onClick={goHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        {isDev && isRouteErrorResponse(error) && error.status !== 404 && (
          <details className="mt-8 text-left bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32">
              {JSON.stringify(
                { status: error.status, statusText: error.statusText },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}