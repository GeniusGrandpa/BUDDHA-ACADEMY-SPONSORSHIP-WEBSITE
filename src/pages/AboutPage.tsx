import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getPageBySlug } from '../services/content'

interface StatItem { value: string; label: string }
interface TimelineItem { year: string; title: string; desc: string }
interface ValueItem { title: string; desc: string }

interface AboutContent {
  title?: string
  subtitle?: string
  mission?: string
  vision?: string
  description?: string
  stats?: StatItem[]
  values?: ValueItem[]
  timeline?: TimelineItem[]
  location?: string
  locationDesc?: string
  missionImage1?: string
  missionImage2?: string
}

export function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('about')
      if (page?.content) {
        setContent(page.content as AboutContent)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const heroTitle = content?.title || 'About Buddha Academy'
  const heroDesc = content?.subtitle || "For over four decades, we've been providing free, quality education to underprivileged children in Nepal, transforming lives and building brighter futures."
  const mission = content?.mission || 'Buddha Academy is committed to providing free, quality education to underprivileged children in Nepal, regardless of their caste, creed, or economic background.'
  const vision = content?.vision || 'We believe that education is the key to breaking the cycle of poverty. Our comprehensive approach includes not just academics, but also nutrition, healthcare, and character development.'
  const stats = content?.stats || [
    { value: '49+', label: 'Years of Service' },
    { value: '2000+', label: 'Children Educated' },
    { value: '100%', label: 'Free Education' },
    { value: '12+', label: 'Partner Countries' },
  ]
  const values = content?.values || [
    { title: 'Compassion', desc: 'We believe every child deserves love, care, and support to thrive.' },
    { title: 'Education', desc: 'Quality education is the foundation for breaking the cycle of poverty.' },
    { title: 'Community', desc: 'Building strong communities that support and uplift each other.' },
    { title: 'Integrity', desc: 'Transparent operations and accountable stewardship of resources.' },
  ]
  const timeline = content?.timeline || [
    { year: '1977', title: 'Founded', desc: 'Buddha Academy opened its doors with 12 students and a vision to provide free education to underprivileged children.' },
    { year: '1985', title: 'Expansion', desc: 'Built first permanent school building with classrooms, dormitories, and a kitchen.' },
    { year: '1995', title: 'Hostel Program', desc: 'Launched residential program for children from remote mountain villages.' },
    { year: '2005', title: 'International Recognition', desc: 'Received recognition from international education organizations.' },
    { year: '2012', title: 'Computer Lab', desc: 'Established computer laboratory with internet access for students.' },
    { year: '2020', title: 'Digital Learning', desc: 'Adapted to online learning platforms during global pandemic.' },
    { year: 'Today', title: 'Growing Strong', desc: 'Continuing our mission with renewed commitment to quality education.' },
  ]

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {heroTitle}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {heroDesc}
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {mission}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {vision}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every child who walks through our doors receives individual attention, a safe learning environment, and the opportunity to reach their full potential.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={content?.missionImage1 || 'https://images.pexels.com/photos/8471832/pexels-photo-8471832.jpeg?auto=compress&cs=tinysrgb&w=600'}
                alt="Students learning"
                className="rounded-lg shadow-lg object-cover w-full h-64"
              />
              <img
                src={content?.missionImage2 || 'https://images.pexels.com/photos/8471827/pexels-photo-8471827.jpeg?auto=compress&cs=tinysrgb&w=600'}
                alt="School activities"
                className="rounded-lg shadow-lg object-cover w-full h-64 mt-8"
              />
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at Buddha Academy.
            </p>
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

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From humble beginnings to a beacon of hope for hundreds of children.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-amber-200 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="hidden md:block flex-1" />
                  <div className="hidden md:flex w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-lg z-10 flex-shrink-0" />
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className="bg-amber-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="text-amber-600 font-bold text-lg mb-1">{item.year}</div>
                      <h3 className="text-gray-900 text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Your support helps us continue providing free education and care to underprivileged children. Together, we can change lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/students">
              <Button size="lg">
                Sponsor a Child
              </Button>
            </Link>
            <Link to="/donate">
              <Button size="lg" variant="glass">
                Make a Donation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
