import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPageBySlug, upsertPage } from '../../../services/content'
import type { Json } from '../../../types/database'
import type { PageContentItem, PageContentRecord, PageContentValue } from '../../../types/cms'

interface FieldConfig {
  label: string
  type: 'text' | 'textarea' | 'array'
}

interface PageMeta {
  title: string
  description: string
  defaultContent: PageContentRecord
  fieldConfig: Record<string, FieldConfig>
}

const PAGE_META: Record<string, PageMeta> = {
  about: {
    title: 'About Us',
    description: 'Edit your about page — mission, vision, values, and history timeline.',
    defaultContent: {
      title: 'About Buddha Academy',
      subtitle: "For over four decades, we've been providing free, quality education.",
      mission: 'Buddha Academy is committed to providing free, quality education.',
      vision: 'We believe education is the key to breaking the cycle of poverty.',
      stats: [{ value: '49+', label: 'Years of Service' }, { value: '2000+', label: 'Children Educated' }, { value: '100%', label: 'Free Education' }, { value: '12+', label: 'Partner Countries' }],
      values: [{ title: 'Compassion', desc: 'Every child deserves love and care.' }, { title: 'Education', desc: 'Quality education breaks poverty cycles.' }, { title: 'Community', desc: 'Building strong communities.' }, { title: 'Integrity', desc: 'Transparent operations.' }],
      timeline: [{ year: '1977', title: 'Founded', desc: 'Opened with 12 students.' }, { year: '1990s', title: 'Expansion', desc: 'Built permanent facilities.' }],
    },
    fieldConfig: {
      title: { label: 'Page Title', type: 'text' },
      subtitle: { label: 'Hero Subtitle', type: 'textarea' },
      mission: { label: 'Mission Statement', type: 'textarea' },
      vision: { label: 'Vision Statement', type: 'textarea' },
      stats: { label: 'Statistics', type: 'array' },
      values: { label: 'Core Values', type: 'array' },
      timeline: { label: 'Timeline', type: 'array' },
    },
  },
  contact: {
    title: 'Contact',
    description: 'Edit your contact page — address, phone, email, and office hours.',
    defaultContent: {
      title: 'Contact Us',
      subtitle: "Have questions? We'd love to hear from you.",
      address: 'Buddha Academy',
      addressLine2: 'Boudha, Kathmandu',
      addressLine3: 'Nepal',
      phone: '+977 1 1234567',
      phoneHours: 'Mon-Fri, 9am-5pm (NPT)',
      email: 'info@buddhaacademy.edu.np',
      emailResponse: "We'll respond within 24 hours",
      officeHours: ['Monday - Friday: 9:00 AM - 5:00 PM'],
      location: 'Located in Boudha, Kathmandu',
      locationDesc: 'Situated in the culturally rich Boudha area.',
    },
    fieldConfig: {
      title: { label: 'Page Title', type: 'text' },
      subtitle: { label: 'Hero Subtitle', type: 'textarea' },
      address: { label: 'Address Line 1', type: 'text' },
      addressLine2: { label: 'Address Line 2', type: 'text' },
      addressLine3: { label: 'Address Line 3', type: 'text' },
      phone: { label: 'Phone Number', type: 'text' },
      phoneHours: { label: 'Phone Hours', type: 'text' },
      email: { label: 'Email Address', type: 'text' },
      emailResponse: { label: 'Email Response Time', type: 'text' },
      officeHours: { label: 'Office Hours', type: 'array' },
      location: { label: 'Location Title', type: 'text' },
      locationDesc: { label: 'Location Description', type: 'textarea' },
    },
  },
  volunteer: {
    title: 'Volunteer',
    description: 'Edit your volunteer page — opportunities, requirements, and call-to-action.',
    defaultContent: {
      title: 'Volunteer With Us',
      subtitle: "Share your skills and make a direct impact on children's lives.",
      sectionTitle: 'Volunteer Opportunities',
      sectionDesc: 'Whether you can join us in Nepal or contribute remotely, there are many ways to help.',
      opportunities: [
        { title: 'Teaching', desc: 'Share your knowledge by teaching subjects like English, Math, Science, or Computer skills.' },
        { title: 'Healthcare', desc: 'Provide medical checkups, health education, and basic healthcare services to students.' },
        { title: 'Mentorship', desc: 'Connect with students as a mentor and guide them in their personal development.' },
        { title: 'Remote Support', desc: 'Contribute from anywhere in the world through online teaching and administrative support.' },
      ],
    },
    fieldConfig: {
      title: { label: 'Page Title', type: 'text' },
      subtitle: { label: 'Hero Subtitle', type: 'textarea' },
      sectionTitle: { label: 'Opportunities Section Title', type: 'text' },
      sectionDesc: { label: 'Opportunities Section Description', type: 'textarea' },
      opportunities: { label: 'Opportunity Items', type: 'array' },
    },
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Edit your privacy policy text.',
    defaultContent: {
      title: 'Privacy Policy',
      lastUpdated: 'June 2025',
      body: '',
    },
    fieldConfig: {
      title: { label: 'Page Title', type: 'text' },
      lastUpdated: { label: 'Last Updated Date', type: 'text' },
      body: { label: 'Policy Content', type: 'textarea' },
    },
  },
  terms: {
    title: 'Terms of Service',
    description: 'Edit your terms and conditions text.',
    defaultContent: {
      title: 'Terms & Conditions',
      lastUpdated: 'June 2025',
      body: '',
    },
    fieldConfig: {
      title: { label: 'Page Title', type: 'text' },
      lastUpdated: { label: 'Last Updated Date', type: 'text' },
      body: { label: 'Terms Content', type: 'textarea' },
    },
  },
}

function isPageContentItem(value: unknown): value is PageContentItem {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizePageContent(content: Json): PageContentRecord {
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    return Object.fromEntries(
      Object.entries(content).filter(([, value]) => (
        typeof value === 'string'
        || (Array.isArray(value) && value.every(item => typeof item === 'string' || isPageContentItem(item)))
      ))
    ) as PageContentRecord
  }
  return {}
}

export function AdminPageEditor() {
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageExists, setPageExists] = useState(false)
  const [published, setPublished] = useState(false)
  const [formData, setFormData] = useState<PageContentRecord>({})

  const meta = slug ? PAGE_META[slug] : undefined

  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      const page = await getPageBySlug(slug!)
      if (page) {
        setPageExists(true)
        setPublished(page.published ?? false)
        if (page.content && Object.keys(page.content).length > 0) {
          setFormData(normalizePageContent(page.content))
        } else {
          setFormData(meta?.defaultContent ?? {})
        }
      } else {
        setPageExists(false)
        setPublished(false)
        setFormData(meta?.defaultContent ?? {})
      }
    } catch {
      toast.error('Failed to load page content')
      setFormData(meta?.defaultContent ?? {})
    } finally {
      setLoading(false)
    }
  }, [slug, meta])

  useEffect(() => {
    if (slug) loadContent()
  }, [slug, loadContent])

  const handleSave = async () => {
    if (!slug || !meta) return
    if (!formData.title && !formData.body && Object.keys(formData).length === 0) {
      toast.error('Cannot save empty content')
      return
    }

    setSaving(true)
    try {
      await upsertPage({
        slug,
        title: meta.title,
        content: formData,
        published,
      })
      toast.success(`${meta.title} saved successfully`)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!slug || !meta) return
    const newPublished = !published
    setPublished(newPublished)
    setSaving(true)
    try {
      await upsertPage({
        slug,
        title: meta.title,
        content: formData,
        published: newPublished,
      })
      toast.success(`Page ${newPublished ? 'published' : 'unpublished'}`)
    } catch {
      toast.error('Failed to update publish status')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: string, value: string) => {
    setFormData((prev: PageContentRecord) => ({ ...prev, [key]: value }) as PageContentRecord)
  }

  const addArrayItem = (key: string, template: PageContentItem | string = '') => {
    setFormData((prev: PageContentRecord) => {
      const current = prev[key]
      if (typeof template === 'string') {
        const next = Array.isArray(current) ? [...current] : []
        return { ...prev, [key]: [...next, template] } as PageContentRecord
      }
      const next = Array.isArray(current) ? [...current] : []
      return { ...prev, [key]: [...next, { ...template }] } as PageContentRecord
    })
  }

  const updateArrayItem = (key: string, idx: number, value: PageContentItem | string) => {
    setFormData((prev: PageContentRecord) => {
      const arr = prev[key]
      if (!Array.isArray(arr)) return prev
      const next = [...arr] as PageContentValue[]
      next[idx] = value as PageContentValue
      return { ...prev, [key]: next } as PageContentRecord
    })
  }

  const removeArrayItem = (key: string, idx: number) => {
    setFormData((prev: PageContentRecord) => {
      const value = prev[key]
      if (!Array.isArray(value)) return prev
      return { ...prev, [key]: value.filter((_, i) => i !== idx) as PageContentValue[] } as PageContentRecord
    })
  }

  if (!slug || !meta) {
    return <div className="text-center py-12 text-gray-400">Page not found</div>
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading content...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="text-gray-500 mt-1">{meta.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </a>
          <button
            onClick={handleTogglePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
              published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {published ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Published
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-6 8h6m-6 4h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Publish
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!formData.title && !formData.body && Object.keys(formData).length === 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {!pageExists && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-2m4 0h-6" />
          </svg>
          <p className="text-sm text-amber-700">
            This page has no saved content yet. Fill in the fields below and click "Save Changes" to create it.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(formData).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No content fields available for this page.</p>
          </div>
        ) : (
          Object.entries(meta.fieldConfig).map(([key, config]) => {
            const value = formData[key]

            if (config.type === 'textarea') {
              return (
                <div key={key} className="bg-white border border-gray-100 rounded-xl p-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">{config.label}</label>
                  <textarea
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={6}
                    placeholder={`Enter ${config.label.toLowerCase()}...`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-vertical"
                  />
                </div>
              )
            }

            if (config.type === 'text') {
              return (
                <div key={key} className="bg-white border border-gray-100 rounded-xl p-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">{config.label}</label>
                  <input
                    type="text"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={`Enter ${config.label.toLowerCase()}...`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                  />
                </div>
              )
            }

            if (config.type === 'array' && Array.isArray(value)) {
              const isStringArray = typeof value[0] === 'string'
              const isObjectArray = typeof value[0] === 'object'

              return (
                <div key={key} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
                    <button
                      onClick={() => addArrayItem(key, isObjectArray ? {} : '')}
                      className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  {value.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items yet. Click "Add Item" to add one.</p>
                  ) : isStringArray ? (
                    <div className="space-y-2">
                      {(value as string[]).map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateArrayItem(key, idx, e.target.value)}
                            placeholder={`Enter item ${idx + 1}...`}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                          />
                          <button
                            onClick={() => removeArrayItem(key, idx)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                            aria-label={`Remove item ${idx + 1}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(value as PageContentItem[]).map((item, idx) => {
                        if (typeof item === 'string') return null

                        return (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-600">Item {idx + 1}</span>
                              <button
                                onClick={() => removeArrayItem(key, idx)}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                aria-label={`Remove item ${idx + 1}`}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            {Object.keys(item).map((subKey) => (
                              <div key={subKey} className="mb-2 last:mb-0">
                                <label className="block text-xs text-gray-500 mb-1 capitalize">{subKey}</label>
                                <input
                                  type="text"
                                  value={item[subKey] || ''}
                                  onChange={(e) => updateArrayItem(key, idx, { ...item, [subKey]: e.target.value })}
                                  placeholder={`Enter ${subKey}...`}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                                />
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return null
          })
        )}
      </div>
    </div>
  )
}
