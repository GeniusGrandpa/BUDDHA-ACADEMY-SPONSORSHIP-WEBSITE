import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { StudentCardSkeleton } from '../ui/LoadingSkeleton'
import { getStudents } from '../../services/students'
import { getTestimonialsWithType } from '../../services/content'
import type { WebsiteSection } from '../../types/website-builder'
import type { Student, Testimonial } from '../../types/database'

type SectionRenderer = (props: { section: WebsiteSection }) => JSX.Element | null

function s<T>(section: WebsiteSection, key: string, fallback?: T): T {
  return (section.content?.[key] as T) ?? (fallback as T)
}

function blocksByType(section: WebsiteSection, type: string) {
  return (section.blocks || []).filter(b => b.is_visible && b.block_type === type).sort((a, b) => a.sort_order - b.sort_order)
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
  const layout = s(section, 'layout', 'left')

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async" fetchpriority="high"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`max-w-2xl ${layout === 'center' ? 'mx-auto text-center' : ''}`}>
          {title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in text-balance">
              {title}{highlight && <><br /><span className="text-amber-500">{highlight}</span></>}
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
    <section className="bg-gradient-to-br from-emerald-700 via-amber-600 to-orange-700 py-12 sm:py-16">
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

function WelcomeSectionRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title
  const description = section.description || s(section, 'content', '')
  if (!title && !description) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{description}</p>}
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {section.description && (
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{section.description}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            <><StudentCardSkeleton /><StudentCardSkeleton /><StudentCardSkeleton /></>
          ) : students.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">No students available at the moment.</div>
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
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <Badge>{student.sponsorship_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>Age: {student.age}</span>
                    <span>Grade: {student.grade}</span>
                  </div>
                  {student.bio && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{student.bio}</p>}
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
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center mb-8">{section.description}</p>}
        {(hasBlocks || items.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {hasBlocks ? blocks.map(b => (
              <div key={b.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {(b.title || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{b.title}</div>
                    {b.content?.role && <div className="text-xs text-gray-400">{String(b.content.role)}</div>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">&ldquo;{(b.content?.quote as string) || (b.content?.text as string) || ''}&rdquo;</p>
              </div>
            )) : items.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {(t.author_name || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{t.author_name}</div>
                    {t.author_role && <div className="text-xs text-gray-400">{t.author_role}</div>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">&ldquo;{t.content || t.quote}&rdquo;</p>
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
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-emerald-700 via-amber-600 to-orange-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{description}</p>}
        <Link to={buttonLink}>
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 w-full sm:w-auto">{buttonText}</Button>
        </Link>
      </div>
    </section>
  )
}

export function PageHeaderRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Page'
  const description = section.description || s(section, 'description', '')
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
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-emerald-700 via-amber-600 to-orange-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
        {description && <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{description}</p>}
        <Link to="/students">
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 w-full sm:w-auto">Browse Students</Button>
        </Link>
      </div>
    </section>
  )
}

function AboutMissionRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Our Mission'
  const description = section.description || ''
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{title}</h2>}
        {description && <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{description}</p>}
        {section.subtitle && (
          <p className="text-sm sm:text-base text-gray-500 mt-4 max-w-2xl mx-auto">{section.subtitle}</p>
        )}
      </div>
    </section>
  )
}

function AboutValuesRenderer({ section }: { section: WebsiteSection }) {
  const title = section.title || 'Our Core Values'
  const values = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    description: (b.content?.text as string) || (b.content?.description as string) || '',
    icon: (b.content?.icon as string) || '',
  }))
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {values.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {values.map((v, idx) => (
              <Card key={idx} variant="bordered" className="p-6 text-center hover:shadow-lg transition-shadow">
                {v.icon && <div className="text-3xl mb-3">{v.icon}</div>}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.description}</p>
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
  const steps = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    desc: (b.content?.text as string) || (b.content?.description as string) || '',
  }))
  const items = steps.length >= 4 ? steps : [
    { title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
    { title: 'Choose a Child', desc: 'Select a student to sponsor' },
    { title: 'Make Your Pledge', desc: 'Complete the sponsorship form' },
    { title: 'Receive Updates', desc: 'Get progress reports & photos' },
  ]
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
          {description && <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 -translate-x-1/2 hidden md:block" />
          {items.map((item, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={i} className="relative flex items-center w-full max-w-3xl mb-4 sm:mb-5 last:mb-0">
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-emerald-200" />
                </div>
                <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}`}>
                  <div className="bg-white rounded-xl border border-amber-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
                    <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">{i + 1}</span>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>{item.desc}</p>
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
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">{section.title}</h2>}
        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: MapPin, label: 'Address', value: address },
            { icon: Phone, label: 'Phone', value: phone },
            { icon: Mail, label: 'Email', value: email },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6 rounded-xl bg-gray-50 border border-gray-200">
              <item.icon className="w-6 h-6 mx-auto mb-3 text-amber-600" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.label}</h3>
              <p className="text-sm text-gray-600">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqListRenderer({ section }: { section: WebsiteSection }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const items = blocksByType(section, 'faq_item').map(b => ({
    id: b.id,
    question: b.title || '',
    answer: (b.content?.text as string) || (b.content?.answer as string) || '',
  }))
  if (items.length === 0) {
    const raw = s<{ question: string; answer: string }[]>(section, 'faqs', [])
    items.push(...raw.map((r, i) => ({ id: `faq-${i}`, question: r.question, answer: r.answer })))
  }
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center mb-8">{section.description}</p>}
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 sm:py-4 text-left bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-sm sm:text-base font-medium text-gray-900 pr-4">{item.question}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
                </button>
                {openId === item.id && (
                  <div className="px-4 pb-3 sm:pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
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
  const milestones = blocksByType(section, 'card').map(b => ({
    year: (b.content?.year as string) || '',
    event: b.title || '',
  }))
  const title = section.title || 'Our Journey'
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-14">{title}</h2>}
          {section.description && <p className="text-sm sm:text-base text-gray-600 text-center mb-8">{section.description}</p>}
          {milestones.length > 0 && (
            <div className="relative">
              <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-emerald-200" />
              <div className="space-y-6 sm:space-y-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative pl-16 sm:pl-20">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-800 font-semibold mb-1">{m.year}</div>
                    <div className="text-sm sm:text-base text-gray-900 font-medium">{m.event}</div>
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
  const benefits = blocksByType(section, 'card').map(b => ({
    title: b.title || '',
    description: (b.content?.text as string) || '',
    icon: (b.content?.icon as string) || '',
  }))
  const title = section.title || 'Sponsorship Benefits'
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">{title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {benefits.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <Card key={idx} variant="bordered" className="p-6 text-center hover:shadow-lg transition-shadow">
                {b.icon && <div className="text-3xl mb-3">{b.icon}</div>}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
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
  return (
    <section className="relative min-h-[400px] sm:min-h-[500px] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        {subtitle && <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">{subtitle}</p>}
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
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-emerald-700 via-amber-600 to-orange-700">
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
  const stats = blocksByType(section, 'stat').map(b => ({
    value: b.title || '',
    label: (b.content?.label as string) || '',
  }))
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto mb-8">{section.description}</p>}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{s.value}</div>
                <div className="text-sm text-gray-600">{s.label}</div>
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
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{section.title}</h2>}
        {section.subtitle && <p className="text-base sm:text-lg text-gray-600 mb-4">{section.subtitle}</p>}
        {section.description && <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{section.description}</div>}
        {!section.title && !section.subtitle && !section.description && inlineContent && (
          <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{String(inlineContent)}</div>
        )}
      </div>
    </section>
  )
}

function ContactFormRenderer({ section }: { section: WebsiteSection }) {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">{section.title}</h2>}
        {section.description && <p className="text-sm sm:text-base text-gray-600 text-center mb-8">{section.description}</p>}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Your email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Subject" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none" placeholder="Your message..." />
            </div>
            <Button className="w-full">Send Message</Button>
          </div>
        </div>
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
  about_preview: AboutMissionRenderer,
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
  news_grid: GenericContentRenderer,
  students_grid: GenericContentRenderer,
  gallery_grid: GenericContentRenderer,
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
  testimonials_list: TestimonialsSectionRenderer,
  stories_grid: GenericContentRenderer,
  student_story: GenericContentRenderer,
  map_location: GenericContentRenderer,
}

export function DefaultSectionRenderer({ section }: { section: WebsiteSection }) {
  return GenericContentRenderer({ section })
}
