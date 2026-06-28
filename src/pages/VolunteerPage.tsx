import { useState, useEffect } from 'react'
import { getVolunteerContent, getPageHeader } from '../services/cms-content'
import { getUpcomingEvents } from '../services/volunteerEvents'
import { submitVolunteerApplication } from '../services/volunteerApplications'
import { useCmsStrings } from '../context/CmsStringsContext'
import type { VolunteerContent, PageHeader } from '../types/cms-content'
import type { VolunteerEvent } from '../types/database'

export function VolunteerPage() {
  const { t } = useCmsStrings()
  const [content, setContent] = useState<VolunteerContent | null>(null)
  const [header, setHeader] = useState<Pick<PageHeader, 'title' | 'subtitle'> | null>(null)
  const [events, setEvents] = useState<VolunteerEvent[]>([])

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', country: '',
    expertise: '', availability: '', motivation: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    Promise.all([
      getVolunteerContent(),
      getPageHeader('volunteer'),
      getUpcomingEvents(),
    ]).then(([vc, hdr, evts]) => {
      if (vc) setContent(vc)
      if (hdr) setHeader(hdr)
      setEvents(evts)
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitVolunteerApplication({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        expertise: formData.expertise,
        availability: formData.availability,
        motivation: formData.motivation,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const opportunities = content?.opportunities || []
  const skillOptions = content?.skill_options || []
  const heroTitle = header?.title || ''
  const heroSubtitle = header?.subtitle || ''

  return (
    <div>
      {(heroTitle || heroSubtitle) && (
        <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {heroTitle && <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{heroTitle}</h1>}
              {heroSubtitle && <p className="text-xl text-gray-600">{heroSubtitle}</p>}
            </div>
          </div>
        </section>
      )}

      {opportunities.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(content?.section_title || content?.section_description) && (
              <div className="text-center mb-16">
                {content.section_title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.section_title}</h2>}
                {content.section_description && <p className="text-gray-600 max-w-2xl mx-auto">{content.section_description}</p>}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {opportunities.map((opp, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{opp.title}</h3>
                  <p className="text-gray-600 text-sm">{opp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('volunteer_events_heading')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">{t('volunteer_events_description')}</p>
            <div className="grid md:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('volunteer_app_submitted_title')}</h3>
              <p className="text-gray-600">{content?.success_message}</p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('volunteer_app_heading')}</h2>
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_name_label')} *</label>
                  <input type="text" required value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_email_label')} *</label>
                  <input type="email" required value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_phone_label')} *</label>
                  <input type="tel" required value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_country_label')} *</label>
                  <input type="text" required value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_expertise_label')} *</label>
                  <select required value={formData.expertise}
                    onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white">
                    {skillOptions.map((opt, idx) => (
                      <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                    {skillOptions.length === 0 && <option value="">{t('volunteer_expertise_placeholder')}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_availability_label')} *</label>
                  <input type="text" required placeholder={t('volunteer_availability_placeholder')} value={formData.availability}
                    onChange={e => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('volunteer_motivation_label')} *</label>
                  <textarea required rows={4} placeholder={t('volunteer_motivation_placeholder')} value={formData.motivation}
                    onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? t('volunteer_submitting_text') : t('volunteer_submit_text')}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
