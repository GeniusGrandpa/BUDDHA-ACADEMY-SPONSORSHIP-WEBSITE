import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getPageHeader, getSiteImagesBySection } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { useLanguage } from '../context/LanguageContext'
import { Tr } from '../components/Translated'
import { useLocalizePath } from '../hooks/useLocalizePath'
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
  const { language } = useLanguage()
  const localize = useLocalizePath()
  const [header, setHeader] = useState<Pick<PageHeader, 'title' | 'subtitle'> | null>(null)
  const [content, setContent] = useState<AboutContent | null>(null)
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    Promise.all([
      getPageHeader('about', language),
      loadContent(language),
      getSiteImagesBySection('about'),
    ]).then(([hdr, _, imgs]) => {
      if (cancelled) return
      if (hdr) setHeader(hdr)
      if (imgs.length > 0) setImages(imgs)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [language])

  const loadContent = async (_language?: string) => {
    try {
      const { getPageBySlug } = await import('../services/content')
      const page = await getPageBySlug('about')
      if (page?.content) {
        setContent(page.content as AboutContent)
      }
    } catch {}
  }

  const DEFAULT_MISSION = 'Our mission is to provide quality education and holistic development opportunities to underprivileged children, empowering them to break the cycle of poverty and become self-reliant, contributing members of society.'
  const DEFAULT_VISION = 'We envision a world where every child, regardless of their background, has access to quality education and the opportunity to realize their full potential.'
  const DEFAULT_DESCRIPTION = 'Buddha Academy was founded with a simple yet powerful belief: education is the most effective tool to transform lives. Located in a community where many families struggle to afford basic education, we provide comprehensive support including tuition, books, uniforms, meals, and healthcare to ensure every child can learn and thrive.'

  const DEFAULT_TIMELINE = [
    { year: '2012', title: 'Foundation', desc: 'Buddha Academy was established with a vision to provide quality education to underprivileged children in the community.' },
    { year: '2014', title: 'First Batch Graduates', desc: 'Celebrated the graduation of our first cohort of students, marking a significant milestone in our journey.' },
    { year: '2016', title: 'Expansion', desc: 'Expanded facilities to accommodate more students, adding new classrooms, a library, and computer lab.' },
    { year: '2018', title: 'Sponsorship Program Launched', desc: 'Introduced the child sponsorship program, connecting donors directly with students to fund their education.' },
    { year: '2020', title: 'Digital Learning Initiative', desc: 'Adapted to remote learning during global challenges, providing tablets and internet access to all students.' },
    { year: '2023', title: '250+ Students Enrolled', desc: 'Reached over 250 enrolled students with 180+ active sponsors supporting their educational journey.' },
    { year: '2025', title: 'Community Impact Award', desc: 'Recognized for outstanding contribution to community education and child welfare development.' },
  ]

  const DEFAULT_VALUES = [
    { title: 'Compassion', desc: 'We treat every child with kindness, understanding, and respect, fostering a nurturing environment.' },
    { title: 'Excellence', desc: 'We strive for the highest standards in education, character development, and community service.' },
    { title: 'Integrity', desc: 'We operate with complete transparency, ensuring every donation is used effectively and ethically.' },
    { title: 'Empowerment', desc: 'We believe in empowering children through education to break the cycle of poverty.' },
  ]

  const DEFAULT_STATS = [
    { value: '250+', label: 'Students' },
    { value: '180+', label: 'Sponsors' },
    { value: '12+', label: 'Years' },
    { value: '95%', label: 'Program Efficiency' },
  ]

  const stats = content?.stats && content.stats.length > 0 ? content.stats : DEFAULT_STATS
  const values = content?.values && content.values.length > 0 ? content.values : DEFAULT_VALUES
  const timeline = content?.timeline && content.timeline.length > 0 ? content.timeline : DEFAULT_TIMELINE

  if (loading) return <div className="min-h-screen" />

  return (
    <div>
      {header && (
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {header.title && <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6"><Tr text={header.title} /></h1>}
              {header.subtitle && <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed"><Tr text={header.subtitle} /></p>}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">{t('about_mission_heading')}</h2>
              <p className="text-[var(--color-text-secondary)] mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"><Tr text={content?.mission || DEFAULT_MISSION} /></p>
              <p className="text-[var(--color-text-secondary)] mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"><Tr text={content?.vision || DEFAULT_VISION} /></p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm sm:text-base"><Tr text={content?.description || DEFAULT_DESCRIPTION} /></p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.alt_text || 'About image'}
                    className={`rounded-lg shadow-lg object-cover w-full ${idx % 2 === 1 ? 'h-48 sm:h-64 mt-4 sm:mt-8' : 'h-48 sm:h-64'}`}
                    loading="lazy" decoding="async"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80 text-xs sm:text-sm"><Tr text={stat.label} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{t('about_values_heading')}</h2>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">{t('about_values_description')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {values.map((value, idx) => (
                <Card key={idx} variant="bordered" className="text-center hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2"><Tr text={value.title} /></h3>
                  <p className="text-[var(--color-text-secondary)] text-sm"><Tr text={value.desc} /></p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {timeline.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-secondary-light)]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{t('about_journey_heading')}</h2>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">{t('about_journey_description')}</p>
            </motion.div>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-primary-light)] to-[var(--color-primary-light)]/60 -translate-x-1/2 hidden md:block" />
              <div className="space-y-6 sm:space-y-10 md:space-y-16">
                {timeline.map((item, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <motion.div
                      key={`${item.year}-${item.title}-${idx}`}
                      initial={{ opacity: 0, y: 32 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`relative md:flex md:items-start ${!isLeft ? 'md:flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-[var(--color-primary-light)]/20">
                          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider mb-3">
                            {item.year}
                          </span>
                          <h3 className="text-[var(--color-text-primary)] text-lg font-semibold mb-2"><Tr text={item.title} /></h3>
                          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed"><Tr text={item.desc} /></p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-12 shrink-0 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] border-3 border-white shadow" />
                      </div>
                      <div className="hidden md:block flex-1" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{t('about_cta_heading')}</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
            {t('about_cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to={localize('/students')}><Button size="lg" className="w-full sm:w-auto">{t('about_sponsor_button')}</Button></Link>
            <Link to={localize('/donate')}><Button size="lg" variant="glass" className="w-full sm:w-auto">{t('about_donate_button')}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
