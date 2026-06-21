import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { CtaBanner } from '../components/CtaBanner'
import { getStudents } from '../services/students'
import { getHomepageSection } from '../services/content'
import type { Student } from '../types/database'

interface HeroContent {
  title?: string
  highlight?: string
  description?: string
  cta_primary_text?: string
  cta_primary_link?: string
  cta_secondary_text?: string
  cta_secondary_link?: string
  background_image?: string
}

interface StatItem { value: string; label: string }

interface MilestoneItem { year: string; event: string }

interface StepItem { num: string; title: string; desc: string }

const FALLBACK_STUDENT_PHOTO = 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'

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
  const [students, setStudents] = useState<Student[]>([])
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [stats, setStats] = useState<StatItem[]>([])
  const [aboutPreview, setAboutPreview] = useState<{ title?: string; description?: string; milestones?: MilestoneItem[] }>({})
  const [sponsorshipData, setSponsorshipData] = useState<{ title?: string; description?: string; steps?: StepItem[] }>({})
  const [loading, setLoading] = useState(true)
  const [heroBgReady, setHeroBgReady] = useState(false)
  const [brokenStudentPhotos, setBrokenStudentPhotos] = useState<Set<string>>(new Set())

  const heroTitle = hero?.title || "Empowering Nepal's Future"
  const heroHighlight = hero?.highlight || 'One Child at a Time'
  const heroDesc = hero?.description || 'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.'
  const heroBg = hero?.background_image || 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg'
  const ctaPrimaryText = hero?.cta_primary_text || 'Sponsor a Child'
  const ctaPrimaryLink = hero?.cta_primary_link || '/students'
  const ctaSecondaryText = hero?.cta_secondary_text || 'Donate Now'
  const ctaSecondaryLink = hero?.cta_secondary_link || '/donate'

  useEffect(() => {
    if (!heroBg) return
    setHeroBgReady(false)
    const img = new Image()
    img.onload = () => setHeroBgReady(true)
    img.onerror = () => setHeroBgReady(true)
    img.src = heroBg
  }, [heroBg])

  useEffect(() => {
    Promise.all([loadStudents(), loadHero(), loadStats(), loadAboutPreview(), loadSponsorshipSteps()])
  }, [])

  const loadStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data.slice(0, 3))
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHero = async () => {
    try {
      const section = await getHomepageSection('hero')
      if (section?.content) {
        setHero(section.content as HeroContent)
      }
    } catch (error) {
      console.error('Error loading hero section:', error)
    }
  }

  const loadStats = async () => {
    try {
      const section = await getHomepageSection('stats')
      if (section?.content) {
        const c = section.content as { items?: StatItem[] }
        if (c.items) setStats(c.items)
      }
    } catch {}
  }

  const loadAboutPreview = async () => {
    try {
      const section = await getHomepageSection('about_preview')
      if (section?.content) {
        setAboutPreview(section.content as { title?: string; description?: string; milestones?: MilestoneItem[] })
      }
    } catch {}
  }

  const loadSponsorshipSteps = async () => {
    try {
      const section = await getHomepageSection('sponsorship_steps')
      if (section?.content) {
        setSponsorshipData(section.content as { title?: string; description?: string; steps?: StepItem[] })
      }
    } catch {}
  }

  const statItems = stats.length > 0 ? stats : [
    { value: 'Since 1977', label: 'Trusted Service' },
    { value: '49+', label: 'Years of Service' },
    { value: '100%', label: 'Free Education' },
    { value: `${students.length}+`, label: 'Children Supported' },
  ]

  const aboutTitle = aboutPreview?.title || 'About Buddha Academy'
  const aboutDesc = aboutPreview?.description || "Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children. For over four decades, we've been transforming lives through education, breaking the cycle of poverty one child at a time."
  const milestones = aboutPreview?.milestones || [
    { year: '1977', event: 'Founded with 12 students' },
    { year: '1990s', event: 'Hostel expansion program' },
    { year: '2010s', event: 'Computer lab established' },
    { year: 'Today', event: 'Educating hundreds annually' },
  ]

  const sponsorshipTitle = sponsorshipData?.title || 'How Sponsorship Works'
  const sponsorshipDesc = sponsorshipData?.description || "Your journey to changing a child's life starts here. Follow these simple steps to become a sponsor."
  const sponsorshipSteps = sponsorshipData?.steps || [
    { num: '01', title: 'Browse Profiles', desc: 'Review children waiting for sponsors' },
    { num: '02', title: 'Choose a Child', desc: 'Select a student to sponsor' },
    { num: '03', title: 'Make Your Pledge', desc: 'Complete donation form securely' },
    { num: '04', title: 'We Connect', desc: 'Link you with your sponsored child' },
    { num: '05', title: 'Receive Updates', desc: 'Get progress reports & photos' },
    { num: '06', title: 'Build Connection', desc: 'Exchange letters & messages' },
    { num: '07', title: 'Track Impact', desc: 'See your contribution at work' },
    { num: '08', title: 'Join Community', desc: 'Connect with other sponsors' },
  ]

  return (
    <div>
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: heroBgReady ? `url('${heroBg}')` : 'none',
            opacity: heroBgReady ? 1 : 0,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/60 to-transparent" />
        {!heroBgReady && <div className="absolute inset-0 bg-stone-800" />}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">


            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in">
              {heroTitle}<br />
              <span className="text-amber-400">{heroHighlight}</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ctaPrimaryLink}>
                <Button size="lg" className="w-full sm:w-auto">
                  {ctaPrimaryText}
                </Button>
              </Link>
              <Link to={ctaSecondaryLink}>
                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                  {ctaSecondaryText}
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
              <span className="text-sm text-gray-300">Verified Nonprofit</span>
              <span className="text-sm text-gray-300">12+ Countries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {statItems.map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/90 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="px-4 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {aboutTitle}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {aboutDesc}
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our mission is simple: ensure every child, regardless of their background, has access to quality education, nutritious meals, healthcare, and a safe place to learn and grow.
              </p>
              <Link to="/about">
                <Button variant="outline">
                  Learn More About Us <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

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
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Children Waiting for Sponsors
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {students.map((student) => (
                  <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-4 aspect-h-3">
                      <img
                        src={brokenStudentPhotos.has(student.id) ? FALLBACK_STUDENT_PHOTO : (student.photo_url || FALLBACK_STUDENT_PHOTO)}
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
                        <span>Age: {student.age}</span>
                        <span>Grade: {student.grade}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {student.bio}
                      </p>
                      <Link to={`/students/${student.id}`}>
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/students">
                  <Button variant="primary">
                    View all student profiles <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No students available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {sponsorshipTitle}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {sponsorshipDesc}
            </p>
          </div>

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



      <section>
        <CtaBanner />
      </section>
    </div>
  )
}
