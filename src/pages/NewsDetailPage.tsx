import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getNewsById } from '../services/news'
import { getPageHeader } from '../services/cms-content'
import type { PageHeader } from '../types/cms-content'
import type { Database } from '../types/database'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'

type NewsArticle = Database['public']['Tables']['news']['Row'] & {
  featured_image?: string
  hero_title?: string
  hero_subtitle?: string
} & {
  featured_image?: string
  hero_title?: string
  hero_subtitle?: string
}

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [header, setHeader] = useState<PageHeader | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getNewsById(id),
      getPageHeader('news'),
    ]).then(([newsData, hdr]) => {
      if (newsData) setArticle(newsData)
      if (hdr) setHeader(hdr)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <DetailPageSkeleton />
  if (!article) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <Link to="/news"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to News</Button></Link>
      </div>
    </div>
  )

  const heroBg = article.featured_image || header?.background_image
  const heroTitle = article.hero_title || article.title || ''
  const heroSubtitle = article.hero_subtitle || ''

  return (
    <div>
      {heroBg && (
        <section className="relative py-32 bg-cover bg-center" style={{ backgroundImage: `url('${heroBg}')` }}>
          <div className="absolute inset-0 bg-stone-900/60" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {heroTitle && <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{heroTitle}</h1>}
            {heroSubtitle && <p className="text-xl text-gray-200">{heroSubtitle}</p>}
            {article.published_at && (
              <p className="text-sm text-gray-300 mt-4">{new Date(article.published_at).toLocaleDateString()}</p>
            )}
          </div>
        </section>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link to="/news" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6 sm:mb-8 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to News
        </Link>

        {!heroBg && (
          <>
            {heroTitle && <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heroTitle}</h1>}
            {article.published_at && (
              <p className="text-sm text-gray-500 mb-6 sm:mb-8">{new Date(article.published_at).toLocaleDateString()}</p>
            )}
          </>
        )}

        {article.content && (
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed">
            {typeof article.content === 'string' ? (
              <p>{article.content}</p>
            ) : (
              Object.entries(article.content).map(([key, val]) => (
                <p key={key}>{val as string}</p>
              ))
            )}
          </div>
        )}
      </article>
    </div>
  )
}
