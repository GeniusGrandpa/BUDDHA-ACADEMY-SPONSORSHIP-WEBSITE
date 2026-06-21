import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getHomepageSections, updateHomepageSection } from '../../../services/content'
import type { Json } from '../../../types/database'
import type { HomepageSection } from '../../../types/database'
import type { HomepageSectionContent, HomepageSectionContentItem } from '../../../types/cms'

type HomepageSectionFieldValue = string | boolean | HomepageSectionContentItem[]

function normalizeHomepageContent(content: Json): HomepageSectionContent {
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    return Object.fromEntries(
      Object.entries(content).filter(([, value]) => (
        typeof value === 'string'
        || typeof value === 'boolean'
        || (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null))
      ))
    ) as HomepageSectionContent
  }
  return {}
}

export function AdminHomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [formData, setFormData] = useState<HomepageSectionContent>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    if (sections.length > 0) {
      const section = sections.find(s => s.section_key === activeSection)
      if (section) {
        setFormData(normalizeHomepageContent(section.content))
      }
    }
  }, [activeSection, sections])

  const loadSections = async () => {
    try {
      const data = await getHomepageSections()
      setSections(data)
    } catch {
      toast.error('Failed to load homepage sections')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const section = sections.find(s => s.section_key === activeSection)
      if (section) {
        await updateHomepageSection(section.id, { content: formData })
        toast.success(`${section.title} updated successfully`)
      }
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: string, value: HomepageSectionFieldValue) => {
    setFormData((prev: HomepageSectionContent) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading sections...</div>
  }

  const section = sections.find(s => s.section_key === activeSection)

  const renderEditor = () => {
    if (!section) return null

    const fields = Object.keys(formData)

    return (
      <div className="space-y-4">
        {fields.map((key) => {
          const value = formData[key]

          if (key === 'background_image' || key === 'image') {
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-600 mb-1.5 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <div className="flex gap-3">
                  <input
                    id={key}
                    type="text"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                    placeholder="Image URL"
                  />
                  {typeof value === 'string' && value && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={value} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )
          }

          if (typeof value === 'string' && value.length > 100) {
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-600 mb-1.5 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <textarea
                  id={key}
                  value={value || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-vertical"
                />
              </div>
            )
          }

          if (typeof value === 'boolean') {
            return (
              <div key={key} className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <button
                  onClick={() => updateField(key, !value)}
                  aria-label={`Toggle ${key.replace(/_/g, ' ')}`}
                  className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            )
          }

          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {value.map((item: HomepageSectionContentItem, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
                    {Object.keys(item).map((subKey) => (
                      <div key={subKey} className="mb-2 last:mb-0">
                        <label className="block text-xs text-gray-500 mb-0.5 capitalize">{subKey}</label>
                        <input
                          type="text"
                          value={item[subKey] || ''}
                          onChange={(e) => {
                            const newVal = [...value]
                            newVal[idx] = { ...newVal[idx], [subKey]: e.target.value }
                            updateField(key, newVal)
                          }}
                          placeholder={`Enter ${subKey.replace(/_/g, ' ')}`}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-gray-500 mt-1">Edit hero, stats, and featured sections</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 rounded-lg text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
          >
            {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">Sections</p>
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.section_key}
                  onClick={() => setActiveSection(s.section_key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s.section_key
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {section && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-100 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  {section.subtitle && (
                    <p className="text-sm text-gray-500 mt-0.5">{section.subtitle}</p>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  section.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {section.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {preview ? (
                <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              ) : (
                renderEditor()
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
