import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { HeroSkeleton } from '../components/ui/LoadingSkeleton'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { CtaBanner } from '../components/CtaBanner'
import { getStudents } from '../services/students'
import { getHeroContent, getSectionContent, getSectionVisibility, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { Student } from '../types/database'
import type { HeroContent, SectionContent } from '../types/cms-content'

const DEFAULT_HERO: HeroContent = {
  id: '',
  title: 'Empowering Nepal\'s Future',
  highlight: 'One Child at a Time',
  description: 'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
  background_image: 'https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=1920',
  overlay_color: 'bg-gradient-to-r from-stone-950/80 via-stone-950/60 to-transparent',
  overlay_opacity: 1,
  cta_primary_text: 'Sponsor a Child',
  cta_primary_link: '/students',
  cta_secondary_text: 'Donate Now',
  cta_secondary_link: '/donate',
  statistics: [
    { value: 'Since 1977', label: 'Trusted Service' } as never,
    { value: '49+', label: 'Years of Service' } as never,
    { value: '100%', label: 'Free Education' } as never,
    { value: '2000+', label: 'Children Supported' } as never,
  ],
  badges: [{ text: 'Verified Nonprofit' }, { text: '12+ Countries' }],
  layout: 'left',
  display_order: 1,
  is_visible: true,
  animation_enabled: false,
  updated_by: null,
  created_at: '',
  updated_at: '',
}

const DEFAULT_ABOUT: SectionContent = {
  id: '',
  section_key: 'about_preview',
  title: 'About Buddha Academy',
  subtitle: '',
  description: 'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
  content: {
    milestones: [
      { year: '1977', event: 'Founded with 12 students' },
      { year: '1990s', event: 'Hostel expansion program' },
      { year: '2010s', event: 'Computer lab established' },
      { year: 'Today', event: 'Educating hundreds annually' },
    ],
  },
  images: [],
  is_visible: true,
  sort_order: 1,
  updated_by: null,
  created_at: '',
  updated_at: '',
}

const DEFAULT_SPONSORSHIP: SectionContent = {
  id: '',
  section_key: 'sponsorship_steps',
  title: 'How Sponsorship Works',
  subtitle: '',
  description: 'Your journey to changing a child\'s life starts here. Follow these simple steps to become a sponsor.',
  content: {
    steps: [
      { num: '01', title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
      { num: '02', title: 'Choose a Child', desc: 'Select a student to sponsor' },
      { num: '03', title: 'Make Your Pledge', desc: 'Complete donation form securely' },
      { num: '04', title: 'We Connect', desc: 'Link you with your sponsored child' },
      { num: '05', title: 'Receive Updates', desc: 'Get progress reports & photos' },
      { num: '06', title: 'Build Connection', desc: 'Exchange letters & messages' },
      { num: '07', title: 'Track Impact', desc: 'See your contribution at work' },
      { num: '08', title: 'Join Community', desc: 'Connect with other sponsors' },
    ],
  },
  images: [],
  is_visible: true,
  sort_order: 1,
  updated_by: null,
  created_at: '',
  updated_at: '',
}

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

export function HomePage() {
  const { t } = useCmsStrings()
  const [students, setStudents] = useState<Student[]>([])
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [aboutSection, setAboutSection] = useState<SectionContent | null>(null)
  const [sponsorshipSection, setSponsorshipSection] = useState<SectionContent | null>(null)
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [heroBgReady, setHeroBgReady] = useState(false)
  const [brokenStudentPhotos, setBrokenStudentPhotos] = useState<Set<string>>(new Set())
  const [studentFallbackImage, setStudentFallbackImage] = useState('')

  useEffect(() => {
    if (!hero?.background_image) return
    setHeroBgReady(false)
    const img = new Image()
    img.onload = () => setHeroBgReady(true)
    img.onerror = () => setHeroBgReady(true)
    img.src = hero.background_image
  }, [hero?.background_image])

  useEffect(() => {
    Promise.all([
      loadHero(),
      loadAboutSection(),
      loadSponsorshipSection(),
      loadVisibility(),
      loadStudents(),
      loadStudentFallbackImage(),
    ]).finally(() => setLoading(false))
  }, [])

  const loadHero = async () => {
    try {
      const data = await getHeroContent()
      if (data) setHero(data)
    } catch {}
  }

  const loadAboutSection = async () => {
    try {
      const data = await getSectionContent('about_preview')
      if (data) setAboutSection(data)
    } catch {}
  }

  const loadSponsorshipSection = async () => {
    try {
      const data = await getSectionContent('sponsorship_steps')
      if (data) setSponsorshipSection(data)
    } catch {}
  }

  const loadVisibility = async () => {
    try {
      const sections = await getSectionVisibility()
      const map: Record<string, boolean> = {}
      sections.forEach((s: { section_key: string; is_visible: boolean }) => { map[s.section_key] = s.is_visible })
      setSectionsVisible(map)
    } catch {}
  }

  const loadStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data.slice(0, 3))
    } catch {}
  }

  const loadStudentFallbackImage = async () => {
    try {
      const img = await getSiteImage('student_fallback')
      if (img) setStudentFallbackImage(img.image_url)
    } catch {}
  }

  const activeHero = hero || DEFAULT_HERO
  const activeAbout = aboutSection || DEFAULT_ABOUT
  const activeSponsorship = sponsorshipSection || DEFAULT_SPONSORSHIP

  const milestones: { year: string; event: string }[] =
    (activeAbout.content as { milestones?: { year: string; event: string }[] })?.milestones || []

  const sponsorshipData = activeSponsorship.content as { steps?: { num: string; title: string; desc: string }[] } | undefined
  const sponsorshipSteps = sponsorshipData?.steps || []

  if (loading) return <HeroSkeleton />

  return (
    <div>
      {sectionsVisible.hero !== false && (
        <section className="relative min-h-[600px] flex items-center overflow-hidden">
          {activeHero.background_image && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{
                backgroundImage: heroBgReady ? `url('${activeHero.background_image}')` : 'none',
                opacity: heroBgReady ? 1 : 0,
              }}
            />
          )}
          <div className={`absolute inset-0 ${activeHero.overlay_color || 'bg-gradient-to-r from-stone-950/80 via-stone-950/60 to-transparent'}`} />
          {!heroBgReady && <div className="absolute inset-0 bg-stone-800" />}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className={`max-w-2xl ${activeHero.layout === 'center' ? 'mx-auto text-center' : ''}`}>
              {activeHero.title && (
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in">
                  {activeHero.title}
                  {activeHero.highlight && <><br /><span className="text-amber-400">{activeHero.highlight}</span></>}
                </h1>
              )}

              {activeHero.description && (
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">{activeHero.description}</p>
              )}

              {(activeHero.cta_primary_text || activeHero.cta_secondary_text) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {activeHero.cta_primary_text && (
                    <Link to={activeHero.cta_primary_link || '/students'}>
                      <Button size="lg" className="w-full sm:w-auto">{activeHero.cta_primary_text}</Button>
                    </Link>
                  )}
                  {activeHero.cta_secondary_text && (
                    <Link to={activeHero.cta_secondary_link || '/donate'}>
                      <Button size="lg" variant="glass" className="w-full sm:w-auto">{activeHero.cta_secondary_text}</Button>
                    </Link>
                  )}
                </div>
              )}

              {activeHero.badges && activeHero.badges.length > 0 && (
                <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
                  {activeHero.badges.map((badge, idx) => (
                    <span key={idx} className="text-sm text-gray-300">{badge.text}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {sectionsVisible.stats !== false && activeHero.statistics && activeHero.statistics.length > 0 && (
        <section className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
              {activeHero.statistics.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/90 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {sectionsVisible.about_preview !== false && (
        <section className="py-24 bg-gray-50">
          <div className="px-4 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              <div>
                {activeAbout.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{activeAbout.title}</h2>
                )}
                {activeAbout.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{activeAbout.description}</p>
                )}
                {activeAbout.content && (activeAbout.content as Record<string, string>).mission_description && (
                  <p className="text-gray-600 mb-8 leading-relaxed">{(activeAbout.content as Record<string, string>).mission_description}</p>
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
                    <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-amber-200" />
                    <div className="space-y-8">
                      {milestones.map((milestone, idx) => (
                        <div key={idx} className="relative pl-20">
                          <div className="absolute left-0 w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          <div className="text-sm text-amber-600 font-semibold mb-1">{milestone.year}</div>
                          <div className="text-gray-900 font-medium">{milestone.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {sectionsVisible.students_preview !== false && students.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home_students_heading')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('home_students_description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {students.map((student) => (
                <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-4 aspect-h-3">
                    <img
                      src={brokenStudentPhotos.has(student.id) ? studentFallbackImage : (student.photo_url || studentFallbackImage)}
                      alt={student.name}
                      className="w-full h-48 object-cover"
                      onError={() => setBrokenStudentPhotos(prev => new Set(prev).add(student.id))}
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
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/students">
                <Button variant="primary">{t('home_view_all_profiles')} <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {sectionsVisible.sponsorship_steps !== false && sponsorshipSteps.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeSponsorship.title && (
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{activeSponsorship.title}</h2>
                {activeSponsorship.description && (
                  <p className="text-gray-600 max-w-2xl mx-auto">{activeSponsorship.description}</p>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 hidden md:block" />
              <div className="space-y-12">
                {sponsorshipSteps.map((step, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <div key={idx} className={`relative flex items-start gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="bg-warm-50 rounded-2xl border border-amber-200 p-6 hover:shadow-lg hover:border-amber-300 transition-all">
                          <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white text-sm font-bold flex-shrink-0">{step.num}</span>
                            <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                          </div>
                          <p className={`text-gray-500 text-sm ${isLeft ? 'md:pl-0' : 'pl-0'}`}>{step.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-center flex-shrink-0 relative">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100 shadow" />
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <CtaBanner />
      </section>
    </div>
  )
}
