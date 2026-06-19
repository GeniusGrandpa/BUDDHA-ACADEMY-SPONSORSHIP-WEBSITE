import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

interface AccessDeniedProps {
  message?: string
  showBackButton?: boolean
}

export function AccessDenied({ message, showBackButton = true }: AccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          {message || 'You do not have the required permissions to access this page.'}
        </p>
        {showBackButton && (
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Home
          </Link>
        )}
      </div>
    </div>
  )
}
