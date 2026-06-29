import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton'
import { CtaBanner } from '../components/CtaBanner'
import { getStudents } from '../services/students'
import { getHeroContent, getSectionContent, getSectionVisibility, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { Student } from '../types/database'
import type { HeroContent, SectionContent } from '../types/cms-content'



const BADGE_MAP: Record<string, 'success' | 'warning' | 'info'> = {
  available: 'success',
  partially_sponsored: 'warning',
  fully_sponsored: 'info',
}

function sponsorshipVariant(status: string) {
  return BADGE_MAP[status] ?? 'default'
}

function sponsorshipLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function HeroSection({ hero, visible }: { hero: HeroContent; visible: boolean }) {
  if (!visible) return null
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900">
      {hero.background_image && (
        <img
          src={hero.background_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`max-w-2xl ${hero.layout === 'center' ? 'mx-auto text-center' : ''}`}>
          {hero.title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in text-balance">
              {hero.title}
              {hero.highlight && <><br /><span className="text-amber-400">{hero.highlight}</span></>}
            </h1>
          )}
          {hero.description && (
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">{hero.description}</p>
          )}
          {(hero.cta_primary_text || hero.cta_secondary_text) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {hero.cta_primary_text && (
                <Link to={hero.cta_primary_link || '/students'}>
                  <Button size="lg" className="w-full sm:w-auto">{hero.cta_primary_text}</Button>
                </Link>
              )}
              {hero.cta_secondary_text && (
                <Link to={hero.cta_secondary_link || '/donate'}>
                  <Button size="lg" variant="glass" className="w-full sm:w-auto">{hero.cta_secondary_text}</Button>
                </Link>
              )}
            </div>
          )}
          {hero.badges && (hero.badges as { text: string }[]).length > 0 && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20">
              {(hero.badges as { text: string }[]).map((badge, idx) => (
                <span key={idx} className="text-xs sm:text-sm text-gray-300">{badge.text}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ hero, statsSection, visible }: { hero: HeroContent; statsSection: SectionContent | null; visible: boolean }) {
  const stats = (hero.statistics as { value: string; label: string }[]) || []
  if (!visible || stats.length === 0) return null
  const content = statsSection?.content as { title?: string }
  return (
    <section className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">{content.title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-white text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/80 sm:text-white/90 text-xs sm:text-sm">{stat.label}</div>
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
        {content.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{content.title}</h2>}
        {content.content && <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{content.content}</p>}
      </div>
    </section>
  )
}

function AboutSection({ about, visible, t }: { about: SectionContent; visible: boolean; t: (k: string) => string }) {
  if (!visible) return null
  const milestones: { year: string; event: string }[] =
    (about.content as { milestones?: { year: string; event: string }[] })?.milestones || []
  const content = about.content as { title?: string; description?: string }
  if (!about.title && !about.description && !content.title && !content.description && milestones.length === 0) return null
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          <div>
            {about.title || content.title ? (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{about.title || content.title}</h2>
            ) : null}
            {about.description || content.description ? (
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{about.description || content.description}</p>
            ) : null}
            {about.content && (about.content as Record<string, string>).mission_description && (
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">{(about.content as Record<string, string>).mission_description}</p>
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
                <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-amber-200" />
                <div className="space-y-6 sm:space-y-8">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="relative pl-16 sm:pl-20">
                      <div className="absolute left-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-amber-600 font-semibold mb-1">{milestone.year}</div>
                      <div className="text-sm sm:text-base text-gray-900 font-medium">{milestone.event}</div>
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

function StudentsSection({ students, brokenPhotos, fallbackImage, setBrokenPhotos, visible, loading, t, featuredContent }: {
  students: Student[]
  brokenPhotos: Set<string>
  fallbackImage: string
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content?.title || t('home_students_heading')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
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
            <div className="col-span-3 text-center py-12 text-gray-500">
              No students available at the moment.
            </div>
          ) : (
            students.map((student) => (
              <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={brokenPhotos.has(student.id) ? fallbackImage : (student.photo_url || fallbackImage)}
                    alt={student.name}
                    className="w-full h-48 object-cover"
                    onError={() => setBrokenPhotos(prev => new Set(prev).add(student.id))}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <Badge variant={sponsorshipVariant(student.sponsorship_status)}>{sponsorshipLabel(student.sponsorship_status)}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>{t('home_age_label', { age: student.age })}</span>
                    <span>{t('home_grade_label', { grade: student.grade })}</span>
                  </div>
                  {student.bio && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{student.bio}</p>}
                  <Link to={`/students/${student.id}`}>
                    <Button variant="outline" className="w-full">{t('home_view_profile')}</Button>
                  </Link>
                </div>
              </Card>
            ))
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

  function Node({ item, idx }: { item: { title: string; desc: string }; idx: number }) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm sm:text-base font-bold shadow-md ring-4 ring-amber-100 mb-2">
          {idx + 1}
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 text-center">{item.title}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-0.5 leading-relaxed max-w-[120px] sm:max-w-[140px]">{item.desc}</p>
      </div>
    )
  }

  function VLine() {
    return <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-amber-300 to-amber-400/60" />
  }

  return (
    <div className="flex flex-col items-center">
      <Node item={items[0]} idx={0} />
      <VLine />
      <Node item={items[1]} idx={1} />
      <VLine />
      <Node item={items[2]} idx={2} />
      <VLine />
      <Node item={items[3]} idx={3} />

      <div className="w-full max-w-[280px] sm:max-w-sm">
        <svg className="w-full h-8 sm:h-10" viewBox="0 0 300 40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="150" y1="0" x2="150" y2="15" />
          <line x1="75" y1="15" x2="225" y2="15" />
          <line x1="75" y1="15" x2="75" y2="40" />
          <line x1="225" y1="15" x2="225" y2="40" />
        </svg>

        <div className="flex gap-4 sm:gap-8 justify-center">
          <div className="flex-1"><Node item={items[4]} idx={4} /></div>
          <div className="flex-1"><Node item={items[5]} idx={5} /></div>
        </div>

        <svg className="w-full h-8 sm:h-10" viewBox="0 0 300 40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <line x1="75" y1="0" x2="75" y2="25" />
          <line x1="225" y1="0" x2="225" y2="25" />
          <line x1="75" y1="25" x2="225" y2="25" />
          <line x1="150" y1="25" x2="150" y2="40" />
        </svg>
      </div>

      <Node item={items[6]} idx={6} />
      <VLine />
      <Node item={items[7]} idx={7} />
    </div>
  )
}

function SponsorshipStepsSection({ sponsorshipSteps, visible }: { sponsorshipSteps: SectionContent; visible: boolean }) {
  if (!visible) return null
  const content = sponsorshipSteps.content as { title?: string; description?: string; steps?: Array<{ title: string; desc: string }> }
  const steps = content?.steps || []
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && (
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.title}</h2>
            {content.description && (
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{content.description}</p>
            )}
          </div>
        )}
        <SponsorshipTree steps={steps} />
      </div>
    </section>
  )
}

function TestimonialsSection({ testimonials, visible }: { testimonials: SectionContent; visible: boolean }) {
  if (!visible) return null
  const content = testimonials.content as { title?: string }
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">{content.title}</h2>}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Supporter</div>
                  <div className="text-xs text-gray-400">Donor</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">Your support makes a real difference in these children's lives.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DonationCtaSection({ donationCta, visible }: { donationCta: SectionContent; visible: boolean }) {
  if (!visible) return null
  const content = donationCta.content as { title?: string; description?: string; button_text?: string; button_link?: string }
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {content?.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{content.title}</h2>}
        {content?.description && (
          <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">{content.description}</p>
        )}
        {content?.button_text && (
          <Link to={content.button_link || '/donate'}>
            <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100 w-full sm:w-auto">{content.button_text}</Button>
          </Link>
        )}
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
  const [donationCtaSection, setDonationCtaSection] = useState<SectionContent | null>(null)
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({})
  const [brokenStudentPhotos, setBrokenStudentPhotos] = useState<Set<string>>(new Set())
  const [studentFallbackImage, setStudentFallbackImage] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      getHeroContent().then(d => { if (d) setHero(d) }).catch(() => {}),
      getSectionContent('welcome').then(d => { if (d) setWelcomeSection(d) }).catch(() => {}),
      getSectionContent('about_preview').then(d => { if (d) setAboutSection(d) }).catch(() => {}),
      getSectionContent('stats').then(d => { if (d) setStatsSection(d) }).catch(() => {}),
      getSectionContent('featured_students').then(d => { if (d) setFeaturedStudentsSection(d) }).catch(() => {}),
      getSectionContent('sponsorship_steps').then(d => { if (d) setSponsorshipSteps(d) }).catch(() => {}),
      getSectionContent('testimonials').then(d => { if (d) setTestimonialsSection(d) }).catch(() => {}),
      getSectionContent('donation_cta').then(d => { if (d) setDonationCtaSection(d) }).catch(() => {}),
      getSectionVisibility().then(sections => {
        const map: Record<string, boolean> = {}
        sections.forEach((s: { section_key: string; is_visible: boolean }) => { map[s.section_key] = s.is_visible })
        setSectionsVisible(map)
      }).catch(() => {}),
      getStudents(undefined, { limit: 3 }).then(d => { setStudents(d); setStudentsLoading(false) }).catch(() => { setStudentsLoading(false) }),
      getSiteImage('student_fallback').then(img => { if (img) setStudentFallbackImage(img.image_url) }).catch(() => {}),
    ])
  }, [])

  if (!hero && !aboutSection && !sponsorshipSteps && studentsLoading) {
    return <div className="min-h-screen" />
  }

  return (
    <div>
      {hero && <HeroSection hero={hero} visible={sectionsVisible.hero !== false} />}
      {hero?.statistics && hero.statistics.length > 0 && (
        <StatsSection hero={hero} statsSection={statsSection} visible={sectionsVisible.stats !== false} />
      )}
      {welcomeSection && <WelcomeSection welcome={welcomeSection} visible={sectionsVisible.welcome !== false} />}
      {aboutSection && <AboutSection about={aboutSection} visible={sectionsVisible.about_preview !== false} t={t} />}
      <StudentsSection
        students={students}
        brokenPhotos={brokenStudentPhotos}
        fallbackImage={studentFallbackImage}
        setBrokenPhotos={setBrokenStudentPhotos}
        visible={sectionsVisible.featured_students !== false}
        loading={studentsLoading}
        t={t}
        featuredContent={featuredStudentsSection}
      />
      {sponsorshipSteps && <SponsorshipStepsSection sponsorshipSteps={sponsorshipSteps} visible={sectionsVisible.sponsorship_steps !== false} />}
      {testimonialsSection && <TestimonialsSection testimonials={testimonialsSection} visible={sectionsVisible.testimonials !== false} />}
      {donationCtaSection && <DonationCtaSection donationCta={donationCtaSection} visible={sectionsVisible.donation_cta !== false} />}
      <section><CtaBanner /></section>
    </div>
  )
}
