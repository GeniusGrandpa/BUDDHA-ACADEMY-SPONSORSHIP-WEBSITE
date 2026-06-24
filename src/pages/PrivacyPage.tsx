import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPageBySlug } from '../services/content'
import { getPageHeader } from '../services/cms-content'
import type { PageHeader } from '../types/cms-content'

interface PrivacyContent {
  title?: string
  lastUpdated?: string
  body?: string
}

export function PrivacyPage() {
  const [content, setContent] = useState<PrivacyContent | null>(null)
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [page, header] = await Promise.all([
        getPageBySlug('privacy'),
        getPageHeader('privacy'),
      ])
      if (page?.content) {
        setContent(page.content as PrivacyContent)
      }
      if (header) setPageHeader(header)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      {pageHeader && (
        <section className="relative py-20 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {pageHeader.title}
              </h1>
              {pageHeader.subtitle && (
                <p className="text-xl text-gray-600">
                  {pageHeader.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {content?.body && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card variant="bordered" padding="lg" className="prose prose-amber max-w-none">
              {content.body.split('\n').map((para, idx) => <p key={idx} className="text-gray-600 mb-4">{para}</p>)}
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
