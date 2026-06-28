import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { createContactSubmission } from '../services/contact'
import { getPageHeader } from '../services/cms-content'
import { getSiteSettings } from '../services/settings'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { PageHeader } from '../types/cms-content'

export function ContactPage() {
  const { t } = useCmsStrings()
  const [header, setHeader] = useState<Pick<PageHeader, 'title' | 'subtitle'> | null>(null)
  const [settings, setSettings] = useState<{
    contact_email?: string
    contact_phone?: string
    contact_address?: string
  }>({})
  const [formData, setFormData] = useState({
    name: '', email: '', countryCode: '+977', localPhone: '',
    subject: '', message: '',
  })
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getPageHeader('contact'),
      getSiteSettings().catch(() => null),
    ]).then(([hdr, stgs]) => {
      if (hdr) setHeader(hdr)
      if (stgs) setSettings(stgs as { contact_email?: string; contact_phone?: string; contact_address?: string })
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPhoneError('')

    const localPhone = formData.localPhone.replace(/\s/g, '')
    if (localPhone.length !== 10 || !/^\d{10}$/.test(localPhone)) {
      setPhoneError(t('contact_phone_error'))
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
      setFormData({ name: '', email: '', countryCode: '+977', localPhone: '', subject: '', message: '' })
    } catch {
      setError(t('contact_error_text'))
    } finally {
      setLoading(false)
    }
  }

  const subjectOptions = [
    { value: '', label: t('contact_inquiry_placeholder') },
    { value: 'sponsorship', label: t('contact_subject_sponsorship') },
    { value: 'donation', label: t('contact_subject_donation') },
    { value: 'volunteer', label: t('contact_subject_volunteer') },
    { value: 'partnership', label: t('contact_subject_partnership') },
    { value: 'other', label: t('contact_subject_other') },
  ]

  return (
    <div>
      {header && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {header.title && <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{header.title}</h1>}
              {header.subtitle && <p className="text-xl text-gray-600">{header.subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <Card variant="bordered" padding="lg" className="h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact_form_title')}</h2>

                <div className="space-y-6">
                  {(settings.contact_address) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t('contact_address_label')}</h3>
                        <p className="text-gray-600">{settings.contact_address}</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t('contact_phone_label')}</h3>
                        <p className="text-gray-600">{settings.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t('contact_email_label')}</h3>
                        <p className="text-gray-600">{settings.contact_email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div>
              <Card variant="bordered" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact_send_message_heading')}</h2>

                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('contact_success_title')}</h3>
                    <p className="text-gray-600 mb-4">{t('contact_success_text')}</p>
                    <Button onClick={() => setSuccess(false)} variant="outline">{t('contact_send_another')}</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

                    <Input label={t('contact_name_label')} type="text" name="name" required
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <Input label={t('contact_email_label_form')} type="email" name="email" required
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">{t('contact_phone_label_form')} <span className="text-red-500 ml-1">*</span></label>
                      <div className="flex gap-2">
                        <select value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="px-3 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white text-gray-900 text-sm flex-shrink-0 w-[140px]">
                          <option value="+977">{t('contact_country_nepal')}</option>
                          <option value="+1">{t('contact_country_usa')}</option>
                          <option value="+44">{t('contact_country_uk')}</option>
                          <option value="+91">{t('contact_country_india')}</option>
                          <option value="+61">{t('contact_country_australia')}</option>
                        </select>
                        <div className="flex-1">
                          <input type="tel" name="localPhone" required maxLength={10} placeholder={t('contact_phone_placeholder')}
                            value={formData.localPhone}
                            onChange={(e) => setFormData({ ...formData, localPhone: e.target.value.replace(/\D/g, '') })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${phoneError ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 transition-colors`} />
                        </div>
                      </div>
                      {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                    </div>

                    <Select label={t('contact_subject_label')} name="subject" required options={subjectOptions}
                      value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    <Textarea label={t('contact_message_label')} name="message" placeholder={t('contact_message_placeholder')} required rows={5}
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />

                    <Button type="submit" className="w-full" disabled={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? t('contact_submitting_text') : t('contact_submit_text')}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {settings.contact_address && (
        <section className="py-24 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('contact_location_heading')}</h2>
              <p className="text-gray-600 mb-8">{settings.contact_address}</p>
              <a href={t('contact_map_link')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg">
                <MapPin className="w-5 h-5" />
                {t('contact_map_button')}
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
