import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
export function NotFoundPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card variant="bordered" padding="lg" className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-amber-600">?</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/">
          <Button type="button" className="w-full" size="lg">
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  )
}
