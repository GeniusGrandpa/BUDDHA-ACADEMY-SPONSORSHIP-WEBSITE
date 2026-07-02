import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { StudentCardSkeleton, NewsCardSkeleton, GallerySkeleton } from '../ui/LoadingSkeleton'
import { getStudents } from '../../services/students'
import { getTestimonialsWithType, getFaqs } from '../../services/content'
import { getGalleryItems } from '../../services/gallery'
import { getNews } from '../../services/news'
import { createContactSubmission } from '../../services/contact'
import type { WebsiteSection } from '../../types/website-builder'
import type { Student, Testimonial, GalleryItem, News, Faq } from '../../types/database'

type SectionRenderer = (props: { section: WebsiteSection }) => JSX.Element | null

function s<T>(section: WebsiteSection, key: string, fallback?: T): T {
  return (section.content?.[key] as T) ?? (fallback as T)
}

function blocksByType(section: WebsiteSection, type: string) {
  return (section.blocks || []).filter(b => b.is_visible && b.block_type === type).sort((a, b) => a.sort_order - b.sort_order)
}

function cardsFromContent(section: WebsiteSection): { title: string; description: string; icon: string }[] {
  const raw = s<({ title?: string; description?: string; desc?: string; icon?: string } | null)[]>(section, 'cards', [])
  return raw
    .filter((c): c is NonNullable<typeof c> => c != null && !!c.title)
    .map(c => ({
      title: c.title || '',
      description: c.description || c.desc || '',
      icon: c.icon || '',
    }))
}

function stepsFromContent(section: WebsiteSection): { title: string; desc: string }[] {
  const raw = s<({ title?: string; desc?: string; description?: string } | null)[]>(section, 'steps', [])
  return raw
    .filter((step): step is NonNullable<typeof step> => step != null && !!step.title)
    .map(step => ({
      title: step.title || '',
      desc: step.desc || step.description || '',
    }))
}

function statsFromContent(section: WebsiteSection): { value: string; label: string }[] {
  const raw = s<({ value?: string; label?: string } | null)[]>(section, 'statistics', [])
  return raw.filter((r): r is NonNullable<typeof r> => r != null && !!r.value).map(r => ({ value: r.value || '', label: r.label || '' }))
}

function milestonesFromContent(section: WebsiteSection): { year: string; event: string }[] {
  return s<({ year?: string; event?: string; title?: string } | null)[]>(section, 'milestones', [])
    .filter((m): m is NonNullable<typeof m> => m != null && !!m.year)
    .map(m => ({
      year: m.year || '',
      event: m.event || m.title || '',
    }))
}

function HeroSectionRenderer({ section }: { section: WebsiteSection }) {
  const settings = section.settings || {}
  const title = section.title || s(section, 'title', '')
  const highlight = s(section, 'highlight', '')
  const subtitle = section.subtitle || s(section, 'subtitle', '')
  const description = section.description || s(section, 'description', '')
  const bgImage = settings.background_image || s(section, 'background_image', '')
  const ctaPrimary = s<{ text?: string; link?: string } | null>(section, 'cta_primary', null)
  const ctaSecondary = s<{ text?: string; link?: string } | null>(section, 'cta_secondary', null)
  const badges = s<{ text: string }[]>(section, 'badges', [])
  const layout = s<string>(section, 'layout', 'left')

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async" fetchPriority="high"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`max-w-2xl ${layout === 'center' ? 'mx-auto text-center' : ''}`}>
          {title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in text-balance">
              {title}{highlight && <><br /><span className="text-[var(--color-accent)]">{highlight}</span></>}
            </h1>
          )}
          {(subtitle || description) && (
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">{subtitle || description}</p>
          )}
          {(ctaPrimary || ctaSecondary) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {ctaPrimary && (
                <Link to={ctaPrimary.link || '/students'}>
                  <Button size="lg" className="w-full sm:w-auto">{ctaPrimary.text || 'Get Started'}</Button>
                </Link>
              )}
              {ctaSecondary && (
                <Link to={ctaSecondary.link || '/donate'}>
                  <Button size="lg" variant="glass" className="w-full sm:w-auto">{ctaSecondary.text || 'Donate'}</Button>
                </Link>
              )}
            </div>
          )}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20">
              {badges.map((badge, idx) => (
                <span key={idx} className="text-xs sm:text-sm text-gray-300">{badge.text}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatsSectionRenderer({ section }: { section: WebsiteSection }) {
  const stats = blocksByType(section, 'stat').map(b => ({
    value: b.title || '',
    label: (b.content?.label as string) || '',
  }))
  if (stats.length === 0) {
    const raw = s<{ value?: string; label?: string }[]>(section, 'statistics', [])
    stats.push(...raw.filter(r => r.value).map(r => ({ value: r.value || '', label: r.label || '' })))
  }
  const title = section.title || s(section, 'title', '')
  if (stats.length === 0 && !title) return null

  return (
    <section className="bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-accent)] to-[var(--color-secondary)] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">{title}</h2>}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-white text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AboutPreviewRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'About Buddha Academy'
  const description = section.description || ''
  const milestones = milestonesFromContent(section)
  if (!title && !description && milestones.length === 0) return null

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div>
            {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">{title}</h2>}
            {description && <p className="text-[var(--color-text-secondary)] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">{description}</p>}
            <Link to="/about">
              <Button variant="outline">Learn More <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
          {milestones.length > 0 && (
            <div className="relative">
              <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)]" />
              <div className="space-y-6 sm:space-y-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative pl-16 sm:pl-20">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--color-primary-dark)] font-semibold mb-1">{m.year}</div>
                    <div className="text-sm sm:text-base text-[var(--color-text-primary)] font-medium">{m.event}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function WelcomeSectionRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title
  const description = section.description || s(section, 'content', '')
  if (!title && !description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">{description}</p>}
      </div>
    </section>
  )
}

function FeaturedStudentsRenderer({ section }: { section: WebsiteSection }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const title = section.title || s(section, 'title', 'Featured Students')

  useEffect(() => {
    getStudents(undefined, { limit: 3 })
      .then(d => setStudents(d))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
          {section.description && (
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">{section.description}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            <><StudentCardSkeleton /><StudentCardSkeleton /><StudentCardSkeleton /></>
          ) : students.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-[var(--color-text-muted)]">No students available at the moment.</div>
          ) : (
            students.map(student => (
              <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-4 aspect-h-3">
                  <img src={student.photo_url || '/placeholder-student.svg'} alt={student.name}
                    className="w-full h-48 object-cover" loading="lazy" decoding="async"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder-student.svg' }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{student.name}</h3>
                    <Badge>{student.sponsorship_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                    <span>Age: {student.age}</span>
                    <span>Grade: {student.grade}</span>
                  </div>
                  {student.bio && <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2">{student.bio}</p>}
                  <Link to={`/students/${student.id}`}>
                    <Button variant="outline" className="w-full">View Profile</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
        {!loading && students.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/students">
              <Button variant="primary">View all student profiles <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function TestimonialsSectionRenderer({ section }: { section: WebsiteSection }) {
  const [items, setItems] = useState<Testimonial[]>([])
  const title = section.title || 'Testimonials'

  useEffect(() => {
    getTestimonialsWithType('testimonial')
      .then(d => { if (d) setItems(d.slice(0, 4)) })
      .catch(() => { })
  }, [])

  const blocks = blocksByType(section, 'testimonial')
  const hasBlocks = blocks.length > 0

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8 sm:mb-12 text-center">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mb-8">{section.description}</p>}
        {(hasBlocks || items.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {hasBlocks ? blocks.map(b => (
              <div key={b.id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
                    {(b.title || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{b.title}</div>
                    {b.content?.role != null && <div className="text-xs text-[var(--color-text-muted)]">{String(b.content.role)}</div>}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] italic">&ldquo;{(b.content?.quote as string) || (b.content?.text as string) || ''}&rdquo;</p>
              </div>
            )) : items.map(t => (
              <div key={t.id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
                    {(t.author_name || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{t.author_name}</div>
                    {t.author_role && <div className="text-xs text-[var(--color-text-muted)]">{t.author_role}</div>}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] italic">&ldquo;{t.content || t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DonationCtaSectionRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || s(section, 'title', '')
  const description = section.description || s(section, 'description', '')
  const buttonText = s(section, 'button_text', 'Donate Now')
  const buttonLink = s(section, 'button_link', '/donate')
  if (!title && !description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-accent)] to-[var(--color-secondary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{description}</p>}
        <Link to={buttonLink}>
          <Button size="lg" className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-border)] w-full sm:w-auto">{buttonText}</Button>
        </Link>
      </div>
    </section>
  )
}

export function PageHeaderRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Page'
  const description = section.description || section.subtitle || s(section, 'description', '')
  const bgImage = section.settings?.background_image || s(section, 'background_image', '')
  return (
    <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 py-16 sm:py-24 overflow-hidden">
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        {description && <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">{description}</p>}
      </div>
    </section>
  )
}

function SponsorCtaRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Make a Difference Today'
  const description = section.description || ''
  const buttonText = s(section, 'button_text', 'Browse Students')
  const buttonLink = s(section, 'button_link', '/students')
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-accent)] to-[var(--color-secondary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
        {description && <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{description}</p>}
        <Link to={buttonLink}>
          <Button size="lg" className="bg-[var(--color-surface)] text-[var(--color-primary)] hover:bg-[var(--color-border)] w-full sm:w-auto">{buttonText}</Button>
        </Link>
      </div>
    </section>
  )
}

function AboutMissionRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Our Mission'
  const description = section.description || ''
  const missionDescription = s(section, 'mission_description', '')
  const vision = s(section, 'vision', '')
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">{description}</p>}
        {missionDescription && <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed mt-4">{missionDescription}</p>}
        {vision && <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-4 max-w-2xl mx-auto italic">{vision}</p>}
        {section.subtitle && (
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-4 max-w-2xl mx-auto">{section.subtitle}</p>
        )}
      </div>
    </section>
  )
}

function AboutValuesRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Our Core Values'
  const blockValues = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    description: (b.content?.text as string) || (b.content?.description as string) || '',
    icon: (b.content?.icon as string) || '',
  }))
  const values = blockValues.length > 0 ? blockValues : cardsFromContent(section)
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-8 sm:mb-12">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {values.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {values.map((v, idx) => (
              <Card key={idx} variant="bordered" className="p-6 text-center hover:shadow-lg transition-shadow">
                {v.icon && <div className="text-3xl mb-3">{v.icon}</div>}
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{v.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SponsorStepsRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'How Sponsorship Works'
  const description = section.description || ''
  const blockSteps = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    desc: (b.content?.text as string) || (b.content?.description as string) || '',
  }))
  const items = blockSteps.length > 0 ? blockSteps : stepsFromContent(section)
  if (items.length === 0 && !title && !description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary-light)]/10 via-[var(--color-surface)] to-[var(--color-secondary-light)]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>}
          {description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)] -translate-x-1/2 hidden md:block" />
          {items.map((item, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={i} className="relative flex items-center w-full max-w-3xl mb-4 sm:mb-5 last:mb-0">
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-emerald-200" />
                </div>
                <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}`}>
                  <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-accent)]/30 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
                    <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold shrink-0">{i + 1}</span>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">{item.title}</h3>
                    </div>
                    <p className={`text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>{item.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactDetailsRenderer({ section }: { section: WebsiteSection }) {
  const address = s(section, 'address', 'Boudha, Kathmandu, Nepal')
  const phone = s(section, 'phone', '+977-1-1234567')
  const email = s(section, 'email', 'info@buddhaacademy.edu.np')
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-12">{section.title}</h2>}
        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: MapPin, label: 'Address', value: address },
            { icon: Phone, label: 'Phone', value: phone },
            { icon: Mail, label: 'Email', value: email },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
              <item.icon className="w-6 h-6 mx-auto mb-3 text-[var(--color-accent)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{item.label}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqListRenderer({ section }: { section: WebsiteSection }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [dbFaqs, setDbFaqs] = useState<Faq[]>([])

  useEffect(() => {
    getFaqs(true).then(setDbFaqs).catch(() => setDbFaqs([]))
  }, [])

  const blockItems = blocksByType(section, 'faq_item').map(b => ({
    id: b.id,
    question: b.title || '',
    answer: (b.content?.text as string) || (b.content?.answer as string) || '',
  }))
  const contentItems = s<{ question: string; answer: string }[]>(section, 'faqs', [])
    .map((r, i) => ({ id: `faq-content-${i}`, question: r.question, answer: r.answer }))
  const dbItems = dbFaqs.map(f => ({ id: f.id, question: f.question, answer: f.answer }))
  const items = blockItems.length > 0 ? blockItems : contentItems.length > 0 ? contentItems : dbItems
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-8 sm:mb-12">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mb-8">{section.description}</p>}
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 sm:py-4 text-left bg-[var(--color-surface)] hover:bg-[var(--color-background)] transition-colors">
                  <span className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] pr-4">{item.question}</span>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
                </button>
                {openId === item.id && (
                  <div className="px-4 pb-3 sm:pb-4">
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AboutTimelineRenderer({ section }: { section: WebsiteSection }) {
  const blockMilestones = blocksByType(section, 'card').map(b => ({
    year: (b.content?.year as string) || '',
    event: b.title || (b.content?.event as string) || '',
  }))
  const milestones = blockMilestones.length > 0 ? blockMilestones : milestonesFromContent(section)
  const title = section.title || 'Our Journey'
  if (milestones.length === 0 && !title && !section.description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-10 sm:mb-14">{title}</h2>}
          {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mb-8">{section.description}</p>}
          {milestones.length > 0 && (
            <div className="relative">
              <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)]" />
              <div className="space-y-6 sm:space-y-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative pl-16 sm:pl-20">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--color-primary-dark)] font-semibold mb-1">{m.year}</div>
                    <div className="text-sm sm:text-base text-[var(--color-text-primary)] font-medium">{m.event}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SponsorshipBenefitsRenderer({ section }: { section: WebsiteSection }) {
  const blockBenefits = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    description: (b.content?.text as string) || (b.content?.description as string) || '',
    icon: (b.content?.icon as string) || '',
  }))
  const benefits = blockBenefits.length > 0 ? blockBenefits : cardsFromContent(section)
  const title = section.title || 'Sponsorship Benefits'
  if (benefits.length === 0 && !title && !section.description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-8 sm:mb-12">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {benefits.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <Card key={idx} variant="bordered" className="p-6 text-center hover:shadow-lg transition-shadow">
                {b.icon && <div className="text-3xl mb-3">{b.icon}</div>}
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{b.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{b.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DonateHeroRenderer({ section }: { section: WebsiteSection }) {
  const bgImage = section.settings?.background_image || s(section, 'background_image', '')
  const title = section.title || 'Make a Donation'
  const subtitle = section.subtitle || ''
  const description = section.description || ''
  return (
    <section className="relative min-h-[400px] sm:min-h-[500px] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        {subtitle && <p className="text-base sm:text-lg text-[var(--color-accent)] max-w-2xl mx-auto mb-2">{subtitle}</p>}
        {description && <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">{description}</p>}
      </div>
    </section>
  )
}

function AboutCtaRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Join Our Mission'
  const description = section.description || ''
  const buttonText = s(section, 'button_text', 'Sponsor a Child')
  const buttonLink = s(section, 'button_link', '/sponsor')
  const button2Text = s(section, 'button2_text', '')
  const button2Link = s(section, 'button2_link', '/donate')
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-accent)] to-[var(--color-secondary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
        {description && <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{description}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={buttonLink}><Button size="lg" className="w-full sm:w-auto">{buttonText}</Button></Link>
          {button2Text && <Link to={button2Link}><Button size="lg" variant="glass" className="w-full sm:w-auto">{button2Text}</Button></Link>}
        </div>
      </div>
    </section>
  )
}

function ImpactContentRenderer({ section }: { section: WebsiteSection }) {
  const blockStats = blocksByType(section, 'stat').map(b => ({
    value: b.title || '',
    label: (b.content?.label as string) || '',
  }))
  const stats = blockStats.length > 0 ? blockStats : statsFromContent(section)
  if (stats.length === 0 && !section.title && !section.description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-8 sm:mb-12">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-1">{s.value}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function GenericContentRenderer({ section }: { section: WebsiteSection }) {
  const inlineContent = s(section, 'content', '') || s(section, 'text', '')
  const hasAny = section.title || section.description || section.subtitle || inlineContent
  if (!hasAny) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{section.title}</h2>}
        {section.subtitle && <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mb-4">{section.subtitle}</p>}
        {section.description && <div className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{section.description}</div>}
        {!section.title && !section.subtitle && !section.description && inlineContent && (
          <div className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{String(inlineContent)}</div>
        )}
      </div>
    </section>
  )
}

function ContactFormRenderer({ section }: { section: WebsiteSection }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createContactSubmission({
        name: form.name,
        email: form.email,
        phone: '',
        subject: form.subject,
        message: form.message,
      })
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      toast.success('Message sent successfully')
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-4">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mb-8">{section.description}</p>}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 sm:p-8 border border-[var(--color-border)] shadow-sm">
          {success ? (
            <p className="text-center text-[var(--color-primary)] font-medium">Thank you! We will get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Full Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]" placeholder="Your email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]" placeholder="Subject" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Message</label>
                <textarea rows={4} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] resize-none" placeholder="Your message..." />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function StudentsGridRenderer({ section }: { section: WebsiteSection }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudents().then(setStudents).catch(() => setStudents([])).finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-4">{section.title}</h2>}
        {section.description && <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8 max-w-2xl mx-auto">{section.description}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <><StudentCardSkeleton /><StudentCardSkeleton /><StudentCardSkeleton /></>
          ) : students.length === 0 ? (
            <p className="col-span-3 text-center text-[var(--color-text-muted)] py-12">No students available.</p>
          ) : (
            students.map(student => (
              <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                <img src={student.photo_url || '/placeholder-student.svg'} alt={student.name} className="w-full h-48 object-cover" loading="lazy" decoding="async"
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder-student.svg' }} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{student.name}</h3>
                    <Badge>{student.sponsorship_status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">Age {student.age} · Grade {student.grade}</p>
                  <Link to={`/students/${student.id}`}><Button variant="outline" className="w-full">View Profile</Button></Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function GalleryGridRenderer({ section }: { section: WebsiteSection }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGalleryItems({ publishedOnly: true }).then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-4">{section.title}</h2>}
        {section.description && <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8 max-w-2xl mx-auto">{section.description}</p>}
        {loading ? (
          <GallerySkeleton />
        ) : items.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-12">No gallery items yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.slice(0, 12).map(item => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
                <img src={item.url || item.thumbnail_url || ''} alt={item.title || item.caption || 'Gallery'} className="w-full h-full object-cover" loading="lazy" decoding="async"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function NewsGridRenderer({ section }: { section: WebsiteSection }) {
  const [articles, setArticles] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNews().then(setArticles).catch(() => setArticles([])).finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-4">{section.title}</h2>}
        {section.description && <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8 max-w-2xl mx-auto">{section.description}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <><NewsCardSkeleton /><NewsCardSkeleton /><NewsCardSkeleton /></>
          ) : articles.length === 0 ? (
            <p className="col-span-3 text-center text-[var(--color-text-muted)] py-12">No news articles yet.</p>
          ) : (
            articles.slice(0, 6).map(article => (
              <Card key={article.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                {article.image_url && (
                  <img src={article.image_url} alt={article.title} className="w-full h-40 object-cover" loading="lazy" decoding="async"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">{article.title}</h3>
                  {article.excerpt && <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-3">{article.excerpt}</p>}
                  <Link to={`/news/${article.id}`} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-primary-dark)] font-medium">Read more →</Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function ProgramsListRenderer({ section }: { section: WebsiteSection }) {
  const [programs, setPrograms] = useState<import('../../types/database').CmsProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../../services/cms-programs').then(mod =>
      mod.getCmsPrograms(true).then(setPrograms).catch(() => setPrograms([])).finally(() => setLoading(false))
    )
  }, [])

  const title = section.title || ''
  const description = section.description || ''
  if (!loading && programs.length === 0 && !title) return null

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] text-center mb-4">{title}</h2>}
        {description && <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center max-w-2xl mx-auto mb-12">{description}</p>}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-xl bg-[var(--color-border)] animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-12">No programs available.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {programs.map(program => {
              const features = (program.features as { title?: string; description?: string }[]) || []
              return (
                <Card key={program.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {program.image_url && (
                    <img src={program.image_url} alt={program.title} className="w-full h-48 object-cover" loading="lazy" decoding="async"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{program.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-1">{program.description}</p>
                    {features.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {features.slice(0, 3).map((f, idx) => (
                          <li key={idx} className="text-xs text-[var(--color-text-muted)] flex items-start gap-1.5">
                            <span className="text-[var(--color-primary)] mt-0.5 shrink-0">•</span>
                            <span>{f.title || f.description || ''}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-3 border-t border-[var(--color-border)]">
                      <Link to={program.slug && program.slug.includes('sponsor') ? '/sponsor' : '/donate'}>
                        <Button variant="outline" className="w-full">
                          {program.slug && program.slug.includes('sponsor') ? 'Sponsor a Student' : 'Support This Program'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export const SECTION_RENDERER_REGISTRY: Record<string, SectionRenderer> = {
  hero: HeroSectionRenderer,
  welcome: WelcomeSectionRenderer,
  stats: StatsSectionRenderer,
  featured_students: FeaturedStudentsRenderer,
  testimonials: TestimonialsSectionRenderer,
  donation_cta: DonationCtaSectionRenderer,
  page_header: PageHeaderRenderer,
  about_mission: AboutMissionRenderer,
  about_values: AboutValuesRenderer,
  about_timeline: AboutTimelineRenderer,
  about_cta: AboutCtaRenderer,
  about_stats: ImpactContentRenderer,
  about_preview: AboutPreviewRenderer,
  sponsorship_steps: SponsorStepsRenderer,
  sponsor_hero: DonateHeroRenderer,
  sponsor_steps: SponsorStepsRenderer,
  sponsor_benefits: SponsorshipBenefitsRenderer,
  sponsor_cta: SponsorCtaRenderer,
  donate_hero: DonateHeroRenderer,
  donate_impact: ImpactContentRenderer,
  donate_process: SponsorStepsRenderer,
  donation_form: GenericContentRenderer,
  contact_details: ContactDetailsRenderer,
  contact_form: ContactFormRenderer,
  faq_list: FaqListRenderer,
  volunteer_hero: DonateHeroRenderer,
  volunteer_opps: SponsorshipBenefitsRenderer,
  volunteer_form: GenericContentRenderer,
  news_grid: NewsGridRenderer,
  students_grid: StudentsGridRenderer,
  gallery_grid: GalleryGridRenderer,
  success_stories: GenericContentRenderer,
  activity_feed: GenericContentRenderer,
  transparency_content: GenericContentRenderer,
  campaigns_list: GenericContentRenderer,
  privacy_content: GenericContentRenderer,
  terms_content: GenericContentRenderer,
  custom_content: GenericContentRenderer,
  cta_banner: DonationCtaSectionRenderer,
  events_grid: GenericContentRenderer,
  impact_content: ImpactContentRenderer,
  team_grid: SponsorshipBenefitsRenderer,
  programs_list: ProgramsListRenderer,
  testimonials_list: TestimonialsSectionRenderer,
  stories_grid: GenericContentRenderer,
  student_story: GenericContentRenderer,
  map_location: GenericContentRenderer,
}

export function DefaultSectionRenderer({ section }: { section: WebsiteSection }) {
  return GenericContentRenderer({ section })
}
