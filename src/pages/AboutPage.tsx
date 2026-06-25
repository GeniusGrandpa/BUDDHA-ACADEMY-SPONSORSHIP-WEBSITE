import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getPageHeader, getSiteImagesBySection } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { PageHeader, SiteImage } from '../types/cms-content'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'

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

const fallbackHeader: Pick<PageHeader, 'title' | 'subtitle'> = {
  title: 'About Buddha Academy',
  subtitle: 'For over four decades, we have been providing free, quality education to underprivileged children in Nepal.',
}

const fallbackContent: Required<Pick<AboutContent, 'mission' | 'vision' | 'description' | 'stats' | 'values' | 'timeline'>> = {
  mission: 'Buddha Academy is committed to providing free, quality education and care to children who need opportunity, stability, and support.',
  vision: 'We believe education is one of the strongest ways to break cycles of poverty and help children build independent, dignified futures.',
  description: 'Founded in Boudha, Kathmandu, the academy brings together teachers, donors, volunteers, and community partners to support students through learning, meals, care, and long-term sponsorship.',
  stats: [
    { value: '49+', label: 'Years of Service' },
    { value: '2000+', label: 'Children Educated' },
    { value: '100%', label: 'Free Education' },
    { value: '12+', label: 'Partner Countries' },
  ],
  values: [
    { title: 'Compassion', desc: 'Every child deserves care, dignity, and the chance to learn.' },
    { title: 'Education', desc: 'Quality education opens pathways to stronger futures.' },
    { title: 'Community', desc: 'Sustainable impact grows through families, teachers, donors, and partners working together.' },
    { title: 'Integrity', desc: 'Transparent operations help build trust with every supporter.' },
  ],
  timeline: [
    { year: '1977', title: 'Founded', desc: 'Buddha Academy opened its doors with a small group of students and a clear mission.' },
    { year: '1990s', title: 'Hostel Expansion', desc: 'Residential support helped more children access education and daily care.' },
    { year: '2010s', title: 'Learning Resources', desc: 'The academy expanded learning resources, including computer access and broader classroom support.' },
    { year: 'Today', title: 'Continuing the Mission', desc: 'The school continues serving children through education, sponsorship, and community support.' },
  ],
}

const fallbackStrings: Record<string, string> = {
  about_mission_heading: 'Our Mission',
  about_values_heading: 'Our Core Values',
  about_values_description: 'These principles guide everything we do at Buddha Academy.',
  about_journey_heading: 'Our Journey',
  about_journey_description: 'From humble beginnings to a beacon of hope for hundreds of children.',
  about_cta_heading: 'Join Our Mission',
  about_cta_description: 'Your support helps us continue providing free education and care to underprivileged children. Together, we can change lives.',
  about_sponsor_button: 'Sponsor a Child',
  about_donate_button: 'Make a Donation',
}

function completeTimeline(timeline?: TimelineItem[]) {
  if (!timeline || timeline.length === 0) return fallbackContent.timeline

  const existingKeys = new Set(
    timeline.map((item) => `${item.year.toLowerCase()}-${item.title.toLowerCase()}`)
  )

  return [
    ...timeline,
    ...fallbackContent.timeline.filter((item) => (
      !existingKeys.has(`${item.year.toLowerCase()}-${item.title.toLowerCase()}`)
    )),
  ]
}

export function AboutPage() {
  const { t } = useCmsStrings()
  const [header, setHeader] = useState<PageHeader | null>(null)
  const [content, setContent] = useState<AboutContent | null>(null)
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      loadHeader(),
      loadContent(),
      loadImages(),
    ]).finally(() => setLoading(false))
  }, [])

  const loadHeader = async () => {
    try {
      const data = await getPageHeader('about')
      if (data) setHeader(data)
    } catch {}
  }

  const loadContent = async () => {
    try {
      const { getPageBySlug } = await import('../services/content')
      const page = await getPageBySlug('about')
      if (page?.content) {
        setContent(page.content as AboutContent)
      }
    } catch {}
  }

  const loadImages = async () => {
    try {
      const data = await getSiteImagesBySection('about')
      if (data.length > 0) setImages(data)
    } catch {}
  }

  if (loading) return <DetailPageSkeleton />

  const pageHeader = header ?? fallbackHeader
  const pageContent = { ...fallbackContent, ...content }
  const stats = pageContent.stats || []
  const values = pageContent.values || []
  const timeline = completeTimeline(pageContent.timeline)
  const text = (key: string) => {
    const value = t(key)
    return value === key ? fallbackStrings[key] ?? key : value
  }

  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {pageHeader.title && <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{pageHeader.title}</h1>}
            {pageHeader.subtitle && <p className="text-xl text-gray-600 leading-relaxed">{pageHeader.subtitle}</p>}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{text('about_mission_heading')}</h2>
              {pageContent.mission && <p className="text-gray-600 mb-6 leading-relaxed">{pageContent.mission}</p>}
              {pageContent.vision && <p className="text-gray-600 mb-6 leading-relaxed">{pageContent.vision}</p>}
              {pageContent.description && <p className="text-gray-600 leading-relaxed">{pageContent.description}</p>}
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{text('about_values_heading')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{text('about_values_description')}</p>
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
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{text('about_journey_heading')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{text('about_journey_description')}</p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 -translate-x-1/2 hidden md:block" />

              <div className="space-y-12 md:space-y-16">
                {timeline.map((item, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <div key={`${item.year}-${item.title}-${idx}`} className="relative md:flex md:items-start">
                      <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className={`bg-amber-50 rounded-xl p-6 hover:shadow-lg transition-shadow relative ${isLeft ? 'md:mr-0' : 'md:ml-0'}`}>
                          <div className="text-amber-600 font-bold text-lg mb-1">{item.year}</div>
                          <h3 className="text-gray-900 text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center justify-center w-12 shrink-0 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-lg" />
                        {idx < timeline.length - 1 && (
                          <div className="absolute top-5 w-0.5 h-16 bg-amber-200" />
                        )}
                      </div>

                      <div className="hidden md:block flex-1" />

                      <div className="flex md:hidden items-start gap-4 mt-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500 border-4 border-white shadow-lg flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="bg-amber-50 rounded-xl p-5">
                            <div className="text-amber-600 font-bold text-base mb-1">{item.year}</div>
                            <h3 className="text-gray-900 text-lg font-semibold mb-1">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="hidden md:flex justify-center">
                  <div className="relative inline-flex items-center gap-2 bg-amber-100 rounded-full px-6 py-3 text-amber-800 font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {timeline.length > 0 && timeline[timeline.length - 1].title === 'Continuing the Mission'
                      ? 'The journey continues...'
                      : 'Growing stronger every year'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{text('about_cta_heading')}</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {text('about_cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/students"><Button size="lg">{text('about_sponsor_button')}</Button></Link>
            <Link to="/donate"><Button size="lg" variant="glass">{text('about_donate_button')}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
