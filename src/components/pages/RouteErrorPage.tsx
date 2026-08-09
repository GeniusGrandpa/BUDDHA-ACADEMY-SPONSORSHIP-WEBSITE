import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { Tr } from '../Translated'
import { useLocalizePath } from '../../hooks/useLocalizePath'

interface RouteErrorPageProps {
  simple?: boolean
}

export function RouteErrorPage({ simple = false }: RouteErrorPageProps) {
  const error = useRouteError()
  const localize = useLocalizePath()
  const isDev = import.meta.env.DEV

  const getErrorInfo = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        return {
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist or has been moved.',
          icon: '🔍',
        }
      }
      if (error.status === 403) {
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this resource.',
          icon: '🚫',
        }
      }
      return {
        title: 'Something went wrong',
        description: error.statusText || 'An error occurred while loading this page.',
        icon: '⚠️',
      }
    }
    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again.',
      icon: '⚠️',
    }
  }

  const { title, description, icon } = getErrorInfo()

  const handleRetry = () => {
    window.location.reload()
  }

  const goBack = () => {
    window.history.back()
  }

  if (simple) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2"><Tr text={title} /></h1>
          <p className="text-gray-600 mb-6"><Tr text={description} /></p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <Tr text="Try Again" />
            </button>
            <Link
              to={localize('/')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <Tr text="Go Home" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4"><Tr text={title} /></h1>
        <p className="text-gray-600 mb-8"><Tr text={description} /></p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={handleRetry} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            <Tr text="Try Again" />
          </Button>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <Tr text="Go Back" />
          </Button>
          <Link to={localize('/')}>
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-2" />
              <Tr text="Home" />
            </Button>
          </Link>
        </div>
        {isDev && isRouteErrorResponse(error) && error.status !== 404 && (
          <details className="mt-8 text-left bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              <Tr text="Error Details (Development Only)" />
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