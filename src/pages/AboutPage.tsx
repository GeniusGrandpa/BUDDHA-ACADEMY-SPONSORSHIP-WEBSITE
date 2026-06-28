import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getPageHeader, getSiteImagesBySection } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { PageHeader, SiteImage } from '../types/cms-content'

interface TimelineItem { year: string; title: string; desc: string }
interface ValueItem { title: string; desc: string }

interface AboutContent {
  mission?: string
  vision?: string
  description?: string
  stats?: { value: string; label: string }[]
  values?: ValueItem[]
  timeline?: TimelineItem[]
  location?: string
  locationDesc?: string
}

export function AboutPage() {
  const { t } = useCmsStrings()
  const [header, setHeader] = useState<Pick<PageHeader, 'title' | 'subtitle'> | null>(null)
  const [content, setContent] = useState<AboutContent | null>(null)
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPageHeader('about'),
      loadContent(),
      getSiteImagesBySection('about'),
    ]).then(([hdr, _, imgs]) => {
      if (hdr) setHeader(hdr)
      if (imgs.length > 0) setImages(imgs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const loadContent = async () => {
    try {
      const { getPageBySlug } = await import('../services/content')
      const page = await getPageBySlug('about')
      if (page?.content) {
        setContent(page.content as AboutContent)
      }
    } catch {}
  }

  const stats = content?.stats || []
  const values = content?.values || []
  const timeline = content?.timeline || []

  if (loading) return <div className="min-h-screen" />

  return (
    <div>
      {header && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {header.title && <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{header.title}</h1>}
              {header.subtitle && <p className="text-xl text-gray-600 leading-relaxed">{header.subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('about_mission_heading')}</h2>
              {content?.mission && <p className="text-gray-600 mb-6 leading-relaxed">{content.mission}</p>}
              {content?.vision && <p className="text-gray-600 mb-6 leading-relaxed">{content.vision}</p>}
              {content?.description && <p className="text-gray-600 leading-relaxed">{content.description}</p>}
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.alt_text || 'About image'}
                    className={`rounded-lg shadow-lg object-cover w-full ${idx % 2 === 1 ? 'h-64 mt-8' : 'h-64'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('about_values_heading')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('about_values_description')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <Card key={idx} variant="bordered" className="text-center hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {timeline.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('about_journey_heading')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('about_journey_description')}</p>
            </div>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 -translate-x-1/2 hidden md:block" />
              <div className="space-y-12 md:space-y-16">
                {timeline.map((item, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <div key={`${item.year}-${item.title}-${idx}`} className={`relative md:flex md:items-start ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className="bg-amber-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="text-amber-600 font-bold text-lg mb-1">{item.year}</div>
                          <h3 className="text-gray-900 text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-12 shrink-0 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-lg" />
                      </div>
                      <div className="hidden md:block flex-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('about_cta_heading')}</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t('about_cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/students"><Button size="lg">{t('about_sponsor_button')}</Button></Link>
            <Link to="/donate"><Button size="lg" variant="glass">{t('about_donate_button')}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
