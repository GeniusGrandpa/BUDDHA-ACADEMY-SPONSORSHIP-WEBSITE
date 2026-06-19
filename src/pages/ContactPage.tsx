import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { createContactSubmission } from '../services/contact'
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

interface ContactContent {
  title?: string
  subtitle?: string
  address?: string
  addressLine2?: string
  addressLine3?: string
  phone?: string
  phoneHours?: string
  email?: string
  emailResponse?: string
  officeHours?: string[]
  location?: string
  locationDesc?: string
}

export function ContactPage() {
  const [content, setContent] = useState<ContactContent | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+977',
    localPhone: '',
    subject: '',
    message: '',
  })
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPageBySlug('contact')
      if (page?.content) {
        setContent(page.content as ContactContent)
      }
    } catch (err) {
      console.error('Failed to load contact content:', err)
    } finally {
      setContentLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPhoneError('')

    const localPhone = formData.localPhone.replace(/\s/g, '')
    if (localPhone.length !== 10 || !/^\d{10}$/.test(localPhone)) {
      setPhoneError('Phone number must contain exactly 10 digits')
      setLoading(false)
      return
    }

    try {
      await createContactSubmission({
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode} ${localPhone}`,
        subject: formData.subject,
        message: formData.message,
      })
      setSuccess(true)
      setFormData({
        name: '', email: '', countryCode: '+977', localPhone: '',
        subject: '', message: '',
      })
    } catch (err) {
      console.error('Failed to submit contact form:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subjectOptions = [
    { value: '', label: 'What is your inquiry about?' },
    { value: 'sponsorship', label: 'Sponsorship Inquiry' },
    { value: 'donation', label: 'Donation Question' },
    { value: 'volunteer', label: 'Volunteer Opportunity' },
    { value: 'partnership', label: 'Partnership Proposal' },
    { value: 'other', label: 'Other' },
  ]

  const heroTitle = content?.title || 'Contact Us'
  const heroDesc = content?.subtitle || "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
  const address = content?.address || 'Buddha Academy'
  const addressLine2 = content?.addressLine2 || 'Boudha, Kathmandu'
  const addressLine3 = content?.addressLine3 || 'Nepal'
  const phone = content?.phone || '+977 1 1234567'
  const phoneHours = content?.phoneHours || 'Mon-Fri, 9am-5pm (NPT)'
  const email = content?.email || 'info@buddhaacademy.edu.np'
  const emailResponse = content?.emailResponse || "We'll respond within 24 hours"
  const officeHours = content?.officeHours || [
    'Monday - Friday: 9:00 AM - 5:00 PM',
    'Saturday: 10:00 AM - 2:00 PM',
    'Sunday: Closed',
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
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <Card variant="bordered" padding="lg" className="h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">{address}<br />{addressLine2}<br />{addressLine3}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">{phone}</p>
                      <p className="text-sm text-gray-500">{phoneHours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">{email}</p>
                      <p className="text-sm text-gray-500">{emailResponse}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Office Hours</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    {officeHours.map((h, idx) => <p key={idx}>{h}</p>)}
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card variant="bordered" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>

                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <Input
                      label="Full Name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

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

                    <Select
                      label="Subject"
                      name="subject"
                      required
                      options={subjectOptions}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />

                    <Textarea
                      label="Message"
                      name="message"
                      placeholder="Enter your message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {content?.location || 'Located in Boudha, Kathmandu'}
            </h2>
            <p className="text-gray-600 mb-8">
              {content?.locationDesc || 'Buddha Academy is situated in the culturally rich Boudha area of Kathmandu, Nepal, near the famous Boudhanath Stupa, a UNESCO World Heritage Site.'}
            </p>
            <a
              href="https://maps.app.goo.gl/wXqnysvPTWyoiSLK7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg"
            >
              <MapPin className="w-5 h-5" />
              View on Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
