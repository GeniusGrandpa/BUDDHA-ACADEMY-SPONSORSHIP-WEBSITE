import { useState, useEffect } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { VolunteerEventsList } from '../components/volunteer/VolunteerEventsList'
import { getPageBySlug } from '../services/content'

const COUNTRY_CODES = [
  { code: '+977', label: 'Nepal (+977)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'US/Canada (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+86', label: 'China (+86)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+7', label: 'Russia (+7)' },
]

interface OpportunityItem { title: string; desc: string }

interface VolunteerContent {
  title?: string
  subtitle?: string
  sectionTitle?: string
  sectionDesc?: string
  opportunities?: OpportunityItem[]
}

export function VolunteerPage() {
  const [content, setContent] = useState<VolunteerContent | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+977',
    localPhone: '',
    country: '',
    skills: '',
    availability: '',
    message: '',
  })
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('volunteer')
      if (page?.content) {
        setContent(page.content as VolunteerContent)
      }
    } catch {
    } finally {
      setContentLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneError('')

    const localPhone = formData.localPhone.replace(/\s/g, '')
    if (localPhone.length !== 10 || !/^\d{10}$/.test(localPhone)) {
      setPhoneError('Phone number must contain exactly 10 digits')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1500)
  }

  const skillOptions = [
    { value: '', label: 'Select your area of expertise' },
    { value: 'teaching', label: 'Teaching & Education' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'it', label: 'IT & Technology' },
    { value: 'construction', label: 'Construction & Maintenance' },
    { value: 'admin', label: 'Administration' },
    { value: 'arts', label: 'Arts & Music' },
    { value: 'sports', label: 'Sports & Physical Education' },
    { value: 'other', label: 'Other' },
  ]

  const heroTitle = content?.title || 'Volunteer With Us'
  const heroDesc = content?.subtitle || "Share your skills and make a direct impact on children's lives. Join our community of dedicated volunteers."
  const oppTitle = content?.sectionTitle || 'Volunteer Opportunities'
  const oppDesc = content?.sectionDesc || 'Whether you can join us in Nepal or contribute remotely, there are many ways to help.'

  const opportunities = content?.opportunities || [
    { title: 'Teaching', desc: 'Share your knowledge by teaching subjects like English, Math, Science, or Computer skills.' },
    { title: 'Healthcare', desc: 'Provide medical checkups, health education, and basic healthcare services to students.' },
    { title: 'Mentorship', desc: 'Connect with students as a mentor and guide them in their personal development.' },
    { title: 'Remote Support', desc: 'Contribute from anywhere in the world through online teaching and administrative support.' },
  ]

  if (contentLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {heroTitle}
            </h1>
            <p className="text-xl text-gray-600">
              {heroDesc}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{oppTitle}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {oppDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {opportunities.map((opp, idx) => (
              <Card key={idx} variant="bordered" className="text-center hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{opp.title}</h3>
                <p className="text-gray-600 text-sm">{opp.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Volunteer Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sign up for upcoming events and activities. Your time and skills make a real difference.
            </p>
          </div>
          <VolunteerEventsList />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="bordered" padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Application</h2>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for your interest in volunteering. We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="px-3 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white text-gray-900 text-sm flex-shrink-0 w-[140px]"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <input
                        type="tel"
                        name="localPhone"
                        required
                        maxLength={10}
                        placeholder="Phone number"
                        value={formData.localPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          setFormData({ ...formData, localPhone: val })
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          phoneError
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                        } focus:outline-none focus:ring-2 transition-colors`}
                      />
                    </div>
                  </div>
                  {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                </div>
                <Input
                  label="Country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />

                <Select
                  label="Area of Expertise"
                  required
                  options={skillOptions}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />

                <Input
                  label="Availability"
                  placeholder="e.g., 2 weeks in summer, ongoing remote support"
                  required
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />

                <Textarea
                  label="Tell us about yourself and your motivation"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your background, experience, and why you want to volunteer..."
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
