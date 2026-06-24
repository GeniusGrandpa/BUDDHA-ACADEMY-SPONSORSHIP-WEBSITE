import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { getPageBySlug } from '../services/content'
import { useCmsStrings } from '../context/CmsStringsContext'

export function NotFoundPage() {
  const { t } = useCmsStrings()
  const [content, setContent] = useState<{ title?: string; description?: string } | null>(null)

  useEffect(() => {
    getPageBySlug('not-found').then(page => {
      if (page?.content) setContent(page.content as { title?: string; description?: string })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-9xl font-bold text-amber-500 mb-4">404</div>
        {content?.title && <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>}
        {content?.description && <p className="text-gray-600 mb-8">{content.description}</p>}
        <Link to="/">
          <Button>{t('notfound_home_button')}</Button>
        </Link>
      </div>
    </div>
  )
}
