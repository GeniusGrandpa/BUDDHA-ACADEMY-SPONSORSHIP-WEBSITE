import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui/Tabs'
import { getNews } from '../services/news'
import { getPageHeader } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { News } from '../types/database'
import type { PageHeader } from '../types/cms-content'

export function NewsPage() {
  const { t } = useCmsStrings()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const [data, header] = await Promise.all([
        getNews(),
        getPageHeader('news'),
      ])
      setNews(data)
      if (header) setPageHeader(header)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'all', label: t('news_tab_all'), count: news.length },
    { id: 'updates', label: t('news_tab_updates'), count: news.filter(n => n.category === 'updates').length },
    { id: 'events', label: t('news_tab_events'), count: news.filter(n => n.category === 'events').length },
    { id: 'impact', label: t('news_tab_impact'), count: news.filter(n => n.category === 'impact').length },
  ]

  const filteredNews = activeTab === 'all'
    ? news
    : news.filter(n => n.category === activeTab)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const categoryColors = {
    updates: 'bg-blue-100 text-blue-700',
    events: 'bg-emerald-100 text-emerald-700',
    impact: 'bg-amber-100 text-amber-700',
  }

  return (
    <div>
      {pageHeader && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
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

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">{t('news_loading')}</div>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((article) => (
                <Card key={article.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[article.category]}`}>
                        {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {formatDate(article.published_at)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    <Link
                      to={`/news/${article.id}`}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      {t('news_read_more')}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('news_empty')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
