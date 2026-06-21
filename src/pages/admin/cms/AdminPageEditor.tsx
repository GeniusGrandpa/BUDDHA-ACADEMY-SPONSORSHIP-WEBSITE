import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, Reorder } from 'framer-motion'
import toast from 'react-hot-toast'
import { getPageBySlug, upsertPage } from '../../../services/content'
import type { Json } from '../../../types/database'
import type { PageContentItem, PageContentRecord, PageContentValue, PageBlock, SeoMetadata, PageBlockType } from '../../../types/cms'

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
    title: 'About Page',
    description: 'Edit the about page content, mission, vision, values, timeline.',
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
    title: 'Contact Page',
    description: 'Edit contact information, address, phone, email, and office hours.',
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
    title: 'Volunteer Page',
    description: 'Edit volunteer opportunities, requirements, and call-to-action.',
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
    description: 'Edit the privacy policy legal text.',
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
    description: 'Edit the terms of service legal text.',
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

const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  hero: 'Hero Banner',
  text: 'Text',
  rich_content: 'Rich Content',
  image: 'Image',
  gallery: 'Gallery',
  cta: 'Call to Action',
  donation: 'Donation',
  student_cards: 'Student Cards',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  stats: 'Statistics',
  timeline: 'Timeline',
  video: 'Video',
  sponsors: 'Sponsors',
  partners: 'Partners',
  announcements: 'Announcements',
  custom_section: 'Custom Section',
}

const DEFAULT_BLOCK_TEMPLATES: Record<PageBlockType, Record<string, unknown>> = {
  hero: { heading: '', subheading: '', button_text: '', button_link: '', background_image: '' },
  text: { body: '' },
  rich_content: { html: '' },
  image: { src: '', alt: '', caption: '' },
  gallery: { images: [] },
  cta: { heading: '', description: '', button_text: '', button_link: '' },
  donation: { heading: '', description: '', button_text: '', button_link: '', amounts: [10, 25, 50, 100] },
  student_cards: { heading: '', students: [] },
  testimonials: { heading: '', testimonials: [] },
  faq: { heading: '', faqs: [] },
  stats: { stats: [] },
  timeline: { events: [] },
  video: { url: '', title: '', description: '' },
  sponsors: { heading: '', sponsors: [] },
  partners: { heading: '' },
  announcements: { heading: '' },
  custom_section: { html: '' },
}

export function AdminPageEditor() {
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageExists, setPageExists] = useState(false)
  const [published, setPublished] = useState(false)
  const [formData, setFormData] = useState<PageContentRecord>({})
  const [seo, setSeo] = useState<SeoMetadata>({})
  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'blocks'>('content')

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
        if (page.seo && typeof page.seo === 'object' && !Array.isArray(page.seo)) {
          setSeo(page.seo as SeoMetadata)
        }
        if (page.blocks && Array.isArray(page.blocks)) {
          setBlocks(page.blocks as unknown as PageBlock[])
        }
      } else {
        setPageExists(false)
        setPublished(false)
        setFormData(meta?.defaultContent ?? {})
        setSeo({})
        setBlocks([])
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
      const blocksToSave = blocks.length > 0 ? blocks : undefined
      const seoToSave = Object.keys(seo).length > 0 ? seo : undefined
      await upsertPage({
        slug,
        title: meta.title,
        content: formData,
        published,
        blocks: blocksToSave as PageBlock[] | undefined,
        seo: seoToSave,
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
      const blocksToSave = blocks.length > 0 ? blocks : undefined
      const seoToSave = Object.keys(seo).length > 0 ? seo : undefined
      await upsertPage({
        slug,
        title: meta.title,
        content: formData,
        published: newPublished,
        blocks: blocksToSave as PageBlock[] | undefined,
        seo: seoToSave,
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

  const addBlock = (type: PageBlockType) => {
    const newBlock: PageBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      title: BLOCK_TYPE_LABELS[type],
      content: { ...DEFAULT_BLOCK_TEMPLATES[type] },
      is_visible: true,
      settings: {
        text_alignment: 'left',
        max_width: '1200px',
        padding_top: '4rem',
        padding_bottom: '4rem',
      },
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const updateBlockContent = (id: string, key: string, value: unknown) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, content: { ...b.content, [key]: value } } : b
    ))
  }

  const reorderBlocks = (reordered: PageBlock[]) => {
    setBlocks(reordered)
  }

  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'content', label: 'Content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { key: 'seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { key: 'blocks', label: 'Blocks', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  ]

  if (!slug || !meta) {
    return <div className="text-center py-12 text-gray-400">Page not found</div>
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading content...</div>
  }

  const fields = Object.keys(formData)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="text-gray-500 mt-1">{meta.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {slug !== 'home' && (
            <Link
              to={`/${slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
          )}
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
            This page has no saved content yet. Edit the fields below and click "Save Changes" to create it.
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'content' && (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No content fields defined. Add content in the editor.</p>
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 resize-vertical"
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
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
                        className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"
                      >
                        + Add Item
                      </button>
                    </div>
                    {value.length === 0 ? (
                      <p className="text-gray-400 text-sm">No items. Click "Add Item" to add one.</p>
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
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
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
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
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
        </motion.div>
      )}

      {activeTab === 'seo' && (
        <motion.div key="seo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">SEO Title</label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Override page title for search engines..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Meta Description</label>
            <textarea
              value={seo.description || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Brief description for search results..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 resize-vertical"
            />
            <p className="text-xs text-gray-400 mt-1">{seo.description ? seo.description.length : 0}/160 characters</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Keywords</label>
            <input
              type="text"
              value={Array.isArray(seo.keywords) ? seo.keywords.join(', ') : ''}
              onChange={(e) => setSeo(prev => ({ ...prev, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">OG Title</label>
              <input
                type="text"
                value={seo.og_title || ''}
                onChange={(e) => setSeo(prev => ({ ...prev, og_title: e.target.value }))}
                placeholder="Title shown when shared on social media"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
              />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">OG Image URL</label>
              <input
                type="url"
                value={seo.og_image || ''}
                onChange={(e) => setSeo(prev => ({ ...prev, og_image: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">OG Description</label>
            <textarea
              value={seo.og_description || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, og_description: e.target.value }))}
              rows={2}
              placeholder="Description shown when shared on social media"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 resize-vertical"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Canonical URL</label>
            <input
              type="url"
              value={seo.canonical_url || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, canonical_url: e.target.value }))}
              placeholder="https://buddhaacademy.edu.np/page-slug"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={seo.no_index || false}
                onChange={(e) => setSeo(prev => ({ ...prev, no_index: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500/50"
              />
              <span className="text-sm font-medium text-gray-600">No Index — Prevent search engines from indexing this page</span>
            </label>
          </div>
        </motion.div>
      )}

      {activeTab === 'blocks' && (
        <motion.div key="blocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Build the page by adding and arranging content blocks.
            </p>
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Block
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible hover:opacity-100 hover:visible transition-all z-50"
                onMouseDown={(e) => e.preventDefault()}
                tabIndex={0}
              >
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {(Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => { addBlock(type); (document.activeElement as HTMLElement)?.blur() }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                    >
                      {BLOCK_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="text-sm">No blocks yet. Click "Add Block" to start building this page.</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={blocks} onReorder={reorderBlocks} className="space-y-3">
              {blocks.map((block, index) => (
                <Reorder.Item key={block.id} value={block} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400 font-mono w-6">{index + 1}</span>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {BLOCK_TYPE_LABELS[block.type]}
                    </span>
                    <span className="text-sm text-gray-700 font-medium flex-1 truncate">{block.title || ''}</span>
                    <label className="flex items-center gap-2 text-xs text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={block.is_visible}
                        onChange={() => updateBlock(block.id, { is_visible: !block.is_visible })}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/50"
                      />
                      Visible
                    </label>
                    <button
                      onClick={() => removeBlock(block.id)}
                      aria-label="Delete block"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById(`block-content-${block.id}`)
                        if (el) el.classList.toggle('hidden')
                      }}
                      aria-label="Edit block content"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div id={`block-content-${block.id}`} className="hidden p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Block Title</label>
                      <input
                        type="text"
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="Block title"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                        <input
                          type="text"
                          value={block.settings?.background_color || ''}
                          onChange={(e) => updateBlock(block.id, { settings: { ...block.settings, background_color: e.target.value } })}
                          placeholder="#ffffff or transparent"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Width</label>
                        <input
                          type="text"
                          value={block.settings?.max_width || ''}
                          onChange={(e) => updateBlock(block.id, { settings: { ...block.settings, max_width: e.target.value } })}
                          placeholder="1200px"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Padding Top</label>
                        <input
                          type="text"
                          value={block.settings?.padding_top || ''}
                          onChange={(e) => updateBlock(block.id, { settings: { ...block.settings, padding_top: e.target.value } })}
                          placeholder="4rem"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Padding Bottom</label>
                        <input
                          type="text"
                          value={block.settings?.padding_bottom || ''}
                          onChange={(e) => updateBlock(block.id, { settings: { ...block.settings, padding_bottom: e.target.value } })}
                          placeholder="4rem"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Text Alignment</label>
                        <select
                          value={block.settings?.text_alignment || 'left'}
                          onChange={(e) => updateBlock(block.id, { settings: { ...block.settings, text_alignment: e.target.value as 'left' | 'center' | 'right' } })}
                          title="Text alignment"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Content Fields</label>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {Object.entries(DEFAULT_BLOCK_TEMPLATES[block.type] || {}).map(([fieldKey, fieldValue]) => (
                          <div key={fieldKey}>
                            <label className="block text-xs text-gray-500 mb-1 capitalize">{fieldKey.replace(/_/g, ' ')}</label>
                            {Array.isArray(fieldValue) ? (
                              <input
                                type="text"
                                value={Array.isArray(block.content[fieldKey]) ? (block.content[fieldKey] as unknown[]).join(', ') : ''}
                                onChange={(e) => updateBlockContent(block.id, fieldKey, e.target.value.split(',').map(s => s.trim()))}
                                placeholder="Comma-separated values"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                              />
                            ) : (
                              <input
                                type="text"
                                value={typeof block.content[fieldKey] === 'string' || typeof block.content[fieldKey] === 'number' ? String(block.content[fieldKey] || '') : ''}
                                onChange={(e) => updateBlockContent(block.id, fieldKey, e.target.value)}
                                placeholder={`Enter ${fieldKey.replace(/_/g, ' ')}`}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </motion.div>
      )}
    </div>
  )
}