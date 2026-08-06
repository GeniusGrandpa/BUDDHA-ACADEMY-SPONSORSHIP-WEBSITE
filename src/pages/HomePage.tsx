import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton'
import { CtaBanner } from '../components/CtaBanner'
import { getStudents } from '../services/students'
import { getHeroContent, getSectionContent, getSectionVisibility } from '../services/cms-content'
import { getTestimonialsWithType } from '../services/content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { Tr } from '../components/Translated'
import type { Student, Testimonial } from '../types/database'
import type { HeroContent, SectionContent } from '../types/cms-content'

const BADGE_MAP: Record<string, 'success' | 'warning' | 'info'> = {
  available: 'success',
  partially_sponsored: 'warning',
  fully_sponsored: 'info',
}

const STUDENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ccircle cx='200' cy='110' r='50' fill='%239ca3af'/%3E%3Cellipse cx='200' cy='230' rx='80' ry='50' fill='%239ca3af'/%3E%3C/svg%3E"

const DEFAULT_HERO: HeroContent = {
  id: '',
  title: 'Empowering Nepal\'s Future',
  highlight: 'One Child at a Time',
  description: 'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
  background_image: '',
  overlay_color: '#000000',
  overlay_opacity: 0.5,
  cta_primary_text: 'Sponsor a Child',
  cta_primary_link: '/students',
  cta_secondary_text: 'Donate Now',
  cta_secondary_link: '/donate',
  statistics: [
    { value: 'Since 1977', label: 'Trusted Service' },
    { value: '49+', label: 'Years of Service' },
    { value: '100%', label: 'Free Education' },
    { value: '250+', label: 'Children Supported' },
  ],
  badges: [],
  layout: 'left',
  display_order: 1,
  is_visible: true,
  animation_enabled: false,
  updated_by: null,
  created_at: '',
  updated_at: '',
}

const DEFAULT_ABOUT_CONTENT = {
  title: 'About Buddha Academy',
  description: 'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
  milestones: [
    { year: '1977', event: 'Founded with 12 students' },
    { year: '1990s', event: 'Hostel expansion program' },
    { year: '2010s', event: 'Computer lab established' },
    { year: 'Today', event: 'Educating hundreds annually' },
  ],
}

const DEFAULT_SPONSORSHIP_STEPS = [
  { title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
  { title: 'Choose a Child', desc: 'Select a student to sponsor' },
  { title: 'Make Your Pledge', desc: 'Complete donation form securely' },
  { title: 'We Connect', desc: 'Link you with your sponsored child' },
  { title: 'Receive Updates', desc: 'Get progress reports & photos' },
  { title: 'Build Connection', desc: 'Exchange letters & messages' },
  { title: 'Track Impact', desc: 'See your contribution at work' },
  { title: 'Join Community', desc: 'Connect with other sponsors' },
]

function sponsorshipVariant(status: string) {
  return BADGE_MAP[status] ?? 'default'
}

function sponsorshipLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function HeroSection({ hero, visible }: { hero: HeroContent; visible: boolean }) {
  const { t } = useCmsStrings()
   if (!visible) return null
   return (
     <section 
       className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden"
       aria-labelledby="hero-heading"
       role="banner"
     >
       {hero.background_image && (
         <img
           src={hero.background_image}
           alt=""
           className="absolute inset-0 w-full h-full object-cover"
           loading="eager" 
           decoding="async" 
           {...{ 'fetchpriority': 'high' }}
           onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
         />
       )}
       <div 
         className="absolute inset-0 bg-gradient-to-br from-stone-950/80 via-stone-950/60 to-transparent"
         style={{ backgroundColor: hero.overlay_color, opacity: hero.overlay_opacity ?? 0.5 }}
         aria-hidden="true"
       />
       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
         <div className={`max-w-2xl ${hero.layout === 'center' ? 'mx-auto text-center' : ''}`}>
            {hero.title && (
              <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in text-balance">
                <Tr text={hero.title} />
                {hero.highlight && <><br /><span className="text-[var(--color-accent)]"><Tr text={hero.highlight} /></span></>}
              </h1>
            )}
            {hero.description && (
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed"><Tr text={hero.description} /></p>
            )}
            {(hero.cta_primary_text || hero.cta_secondary_text) && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" role="group" aria-label={t('home_cta_group_aria')}>
                {hero.cta_primary_text && (
                  <Link 
                    to={hero.cta_primary_link || '/students'}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40 rounded-full"
                  >
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto"
                      aria-label={t('home_navigate_to', { label: hero.cta_primary_text, route: hero.cta_primary_link || '/students' })}
                    >
                      <Tr text={hero.cta_primary_text} />
                    </Button>
                  </Link>
                )}
                {hero.cta_secondary_text && (
                  <Link 
                    to={hero.cta_secondary_link || '/donate'}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40 rounded-full"
                  >
                    <Button 
                      size="lg" 
                      variant="glass" 
                      className="w-full sm:w-auto"
                      aria-label={t('home_navigate_to', { label: hero.cta_secondary_text, route: hero.cta_secondary_link || '/donate' })}
                    >
                      <Tr text={hero.cta_secondary_text} />
                    </Button>
                  </Link>
                )}
              </div>
            )}
            {hero.badges && (hero.badges as { text: string }[]).length > 0 && (
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20" role="list" aria-label={t('home_key_stats_aria')}>
                {(hero.badges as { text: string }[]).map((badge, idx) => (
                  <span key={idx} className="text-xs sm:text-sm text-white/80" role="listitem"><Tr text={badge.text} /></span>
                ))}
              </div>
            )}
         </div>
       </div>
     </section>
   )
 }

function StatsSection({ hero, statsSection, visible }: { hero: HeroContent; statsSection: SectionContent | null; visible: boolean }) {
  const { t } = useCmsStrings()
  const stats = (hero.statistics as { value: string; label: string }[]) || []
  if (!visible || stats.length === 0) return null
  const content = statsSection?.content as { title?: string }
  return (
    <section className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] py-12 sm:py-16" aria-label={t('home_stats_impact_aria')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12"><Tr text={content.title} /></h2>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-white text-center" role="list" aria-label={t('home_stats_aria')}>
          {stats.map((stat, idx) => (
            <div key={idx} role="listitem">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/80 sm:text-white/90 text-xs sm:text-sm"><Tr text={stat.label} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WelcomeSection({ welcome, visible }: { welcome: SectionContent; visible: boolean }) {
  if (!visible) return null
  const content = welcome.content as { title?: string; content?: string }
  if (!content?.title && !content?.content) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {content.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6"><Tr text={content.title} /></h2>}
        {content.content && <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed"><Tr text={content.content} /></p>}
      </div>
    </section>
  )
}

function AboutSection({ about, visible, t }: { about: SectionContent | null; visible: boolean; t: (k: string) => string }) {
  if (!visible) return null
  const milestones: { year: string; event: string }[] = about
    ? ((about.content as { milestones?: { year: string; event: string }[] })?.milestones || [])
    : DEFAULT_ABOUT_CONTENT.milestones
  const title = about?.title || (about?.content as { title?: string } | undefined)?.title || DEFAULT_ABOUT_CONTENT.title
  const description = about?.description || (about?.content as { description?: string } | undefined)?.description || DEFAULT_ABOUT_CONTENT.description
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="px-4 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          <div>
            {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6"><Tr text={title} /></h2>}
            {description && <p className="text-[var(--color-text-secondary)] mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"><Tr text={description} /></p>}
            {about?.content && (about.content as Record<string, string>).mission_description && (
              <p className="text-[var(--color-text-secondary)] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base"><Tr text={(about.content as Record<string, string>).mission_description} /></p>
            )}
            <Link to="/about">
              <Button variant="outline">
                {t('home_learn_more')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {milestones.length > 0 && (
            <div>
              <div className="relative">
                <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)]" />
                <div className="space-y-6 sm:space-y-8">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="relative pl-16 sm:pl-20">
                      <div className="absolute left-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-[var(--color-primary-dark)] font-semibold mb-1">{milestone.year}</div>
                      <div className="text-sm sm:text-base text-[var(--color-text-primary)] font-medium"><Tr text={milestone.event} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StudentsSection({ students, brokenPhotos, setBrokenPhotos, visible, loading, t, featuredContent }: {
  students: Student[]
  brokenPhotos: Set<string>
  setBrokenPhotos: React.Dispatch<React.SetStateAction<Set<string>>>
  visible: boolean
  loading: boolean
  t: (k: string, r?: Record<string, string | number>) => string
  featuredContent: SectionContent | null
}) {
  if (!visible) return null
  const content = featuredContent?.content as { title?: string }
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            {content?.title ? <Tr text={content.title} /> : t('home_students_heading')}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('home_students_description')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            <>
              <StudentCardSkeleton />
              <StudentCardSkeleton />
              <StudentCardSkeleton />
            </>
          ) : students.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-[var(--color-text-muted)]">
              No students available at the moment.
            </div>
          ) : (
            students.map((student) => {
              const photoSrc = brokenPhotos.has(student.id) || !student.photo_url
                ? STUDENT_PLACEHOLDER
                : student.photo_url
              return (
                <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3]">
                    <img
                      src={photoSrc}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      loading="lazy" decoding="async"
                      onError={() => setBrokenPhotos(prev => new Set(prev).add(student.id))}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{student.name}</h3>
                      <Badge variant={sponsorshipVariant(student.sponsorship_status)}>{sponsorshipLabel(student.sponsorship_status)}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
                      <span>{t('home_age_label', { age: student.age })}</span>
                      <span>{t('home_grade_label', { grade: student.grade })}</span>
                    </div>
                    {student.bio && <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2"><Tr text={student.bio} /></p>}
                    <Link to={`/students/${student.id}`}>
                      <Button variant="outline" className="w-full">{t('home_view_profile')}</Button>
                    </Link>
                  </div>
                </Card>
              )
            })
          )}
        </div>
        {!loading && students.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/students">
              <Button variant="primary">{t('home_view_all_profiles')} <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function SponsorshipTree({ steps }: { steps: { title: string; desc: string }[] }) {
  const items = steps.length >= 8 ? steps : [
    { title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
    { title: 'Choose a Child', desc: 'Select a student to sponsor' },
    { title: 'Make Your Pledge', desc: 'Complete donation form securely' },
    { title: 'We Connect', desc: 'Link you with your sponsored child' },
    { title: 'Receive Updates', desc: 'Get progress reports & photos' },
    { title: 'Build Connection', desc: 'Exchange letters & messages' },
    { title: 'Track Impact', desc: 'See your contribution at work' },
    { title: 'Join Community', desc: 'Connect with other sponsors' },
  ]

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-primary-light)] -translate-x-1/2 hidden md:block" />
      {items.map((item, i) => {
        const isLeft = i % 2 === 0
        return (
          <div key={i} className="relative flex items-center w-full max-w-3xl mb-4 sm:mb-5 last:mb-0">
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-primary-light)]/30" />
            </div>
            <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? 'md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}`}>
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-accent)]/30 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-[var(--color-primary-light)]/60 transition-all">
                <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-primary)] text-white text-xs sm:text-sm font-bold shrink-0">{i + 1}</span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]"><Tr text={item.title} /></h3>
                </div>
                <p className={`text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed ${isLeft ? 'md:text-right' : ''}`}><Tr text={item.desc} /></p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SponsorshipStepsSection({ sponsorshipSteps, visible }: { sponsorshipSteps: SectionContent | null; visible: boolean }) {
  if (!visible) return null
  const content = sponsorshipSteps?.content as { title?: string; description?: string; steps?: Array<{ title: string; desc: string }> } | undefined
  const steps: { title: string; desc: string }[] = content?.steps?.length ? content.steps : DEFAULT_SPONSORSHIP_STEPS
  const title = content?.title || 'How Sponsorship Works'
  const description = content?.description || 'Your journey to changing a child\'s life starts here.'
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary-light)]/10 via-[var(--color-surface)] to-[var(--color-secondary-light)]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4"><Tr text={title} /></h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto"><Tr text={description} /></p>
        </div>
        <SponsorshipTree steps={steps} />
      </div>
    </section>
  )
}

function TestimonialsSection({ testimonials, testimonialList, visible }: { testimonials: SectionContent; testimonialList: Testimonial[]; visible: boolean }) {
  if (!visible) return null
  const content = testimonials.content as { title?: string }
  const items = testimonialList.length > 0 ? testimonialList.slice(0, 4) : []
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8 sm:mb-12 text-center"><Tr text={content.title} /></h2>}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {items.length > 0 ? items.map((t) => (
            <div key={t.id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
                  {(t.author_name || 'S').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-secondary)]">{t.author_name}</div>
                  {t.author_role && <div className="text-xs text-[var(--color-text-muted)]"><Tr text={t.author_role} /></div>}
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] italic">"<Tr text={t.content || t.quote || ''} />"</p>
            </div>
          )) : (
            <div className="col-span-2 text-center py-8 text-[var(--color-text-muted)] text-sm">Testimonials will appear here once added.</div>
          )}
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const { t } = useCmsStrings()
  const [students, setStudents] = useState<Student[]>([])
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [welcomeSection, setWelcomeSection] = useState<SectionContent | null>(null)
  const [aboutSection, setAboutSection] = useState<SectionContent | null>(null)
  const [statsSection, setStatsSection] = useState<SectionContent | null>(null)
  const [featuredStudentsSection, setFeaturedStudentsSection] = useState<SectionContent | null>(null)
  const [sponsorshipSteps, setSponsorshipSteps] = useState<SectionContent | null>(null)
  const [testimonialsSection, setTestimonialsSection] = useState<SectionContent | null>(null)
  const [testimonialItems, setTestimonialItems] = useState<Testimonial[]>([])
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({})
  const [brokenStudentPhotos, setBrokenStudentPhotos] = useState<Set<string>>(new Set())
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [cmsLoaded, setCmsLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      getHeroContent().then(d => {
        if (d) {
          setHero(d)
        } else {
          getSectionContent('hero').then(heroSection => {
            if (heroSection) {
              const c = heroSection.content as {
                title?: string; highlight?: string; description?: string;
                cta_primary_text?: string; cta_primary_link?: string;
                cta_secondary_text?: string; cta_secondary_link?: string;
                statistics?: { value: string; label: string }[];
                badges?: { text: string }[];
                background_image?: string;
              }
              setHero({
                ...DEFAULT_HERO,
                title: heroSection.title || c?.title || DEFAULT_HERO.title,
                highlight: c?.highlight || DEFAULT_HERO.highlight,
                description: heroSection.description || c?.description || DEFAULT_HERO.description,
                background_image: c?.background_image || '',
                cta_primary_text: c?.cta_primary_text || DEFAULT_HERO.cta_primary_text,
                cta_primary_link: c?.cta_primary_link || DEFAULT_HERO.cta_primary_link,
                cta_secondary_text: c?.cta_secondary_text || DEFAULT_HERO.cta_secondary_text,
                cta_secondary_link: c?.cta_secondary_link || DEFAULT_HERO.cta_secondary_link,
                statistics: c?.statistics?.length ? c.statistics : DEFAULT_HERO.statistics,
                badges: c?.badges || [],
              })
            }
          }).catch(() => { })
        }
      }).catch(() => { }),
      getSectionContent('welcome').then(d => { if (d) setWelcomeSection(d) }).catch(() => { }),
      getSectionContent('about_preview').then(d => { if (d) setAboutSection(d) }).catch(() => { }),
      getSectionContent('stats').then(d => { if (d) setStatsSection(d) }).catch(() => { }),
      getSectionContent('featured_students').then(d => { if (d) setFeaturedStudentsSection(d) }).catch(() => { }),
      getSectionContent('sponsorship_steps').then(d => { if (d) setSponsorshipSteps(d) }).catch(() => { }),
      getSectionContent('testimonials').then(d => { if (d) setTestimonialsSection(d) }).catch(() => { }),
      getTestimonialsWithType('testimonial').then(d => { if (d && d.length > 0) setTestimonialItems(d) }).catch(() => { }),
      getSectionVisibility().then(sections => {
        const map: Record<string, boolean> = {}
        sections.forEach((s: { section_key: string; is_visible: boolean }) => { map[s.section_key] = s.is_visible })
        setSectionsVisible(map)
      }).catch(() => { }),
      getStudents(undefined, { limit: 3 }).then(d => { setStudents(d); setStudentsLoading(false) }).catch(() => { setStudentsLoading(false) }),
    ]).finally(() => setCmsLoaded(true))
  }, [])

  const activeHero = hero ?? DEFAULT_HERO
  const statsToShow = (activeHero.statistics as { value: string; label: string }[]) || []

  if (!cmsLoaded) {
    return <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900" />
  }

  return (
    <div>
      <HeroSection hero={activeHero} visible={sectionsVisible.hero !== false} />
      {statsToShow.length > 0 && (
        <StatsSection hero={activeHero} statsSection={statsSection} visible={sectionsVisible.stats !== false} />
      )}
      {welcomeSection && <WelcomeSection welcome={welcomeSection} visible={sectionsVisible.welcome !== false} />}
      <AboutSection about={aboutSection} visible={sectionsVisible.about_preview !== false} t={t} />
      <StudentsSection
        students={students}
        brokenPhotos={brokenStudentPhotos}
        setBrokenPhotos={setBrokenStudentPhotos}
        visible={sectionsVisible.featured_students !== false}
        loading={studentsLoading}
        t={t}
        featuredContent={featuredStudentsSection}
      />
      <SponsorshipStepsSection sponsorshipSteps={sponsorshipSteps} visible={sectionsVisible.sponsorship_steps !== false} />
      {testimonialsSection && <TestimonialsSection testimonials={testimonialsSection} testimonialList={testimonialItems} visible={sectionsVisible.testimonials !== false} />}
      {sectionsVisible.donation_cta !== false && <CtaBanner />}
    </div>
  )
}
