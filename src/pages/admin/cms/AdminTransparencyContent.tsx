import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getPageBySlug, upsertPage, updatePagePublished } from '../../../services/content'
import type { TransparencyAllocation, TransparencyContent } from '../../../types/cms'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminTransparencyContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageExists, setPageExists] = useState(false)
  const [published, setPublished] = useState(false)
  const [content, setContent] = useState<TransparencyContent>({
    title: 'Transparency & Accountability',
    subtitle: 'Built on Trust',
    description: 'We are committed to complete transparency in how we use donor funds and the impact we create.',
    allocationData: [
      { name: "Children's Education & Welfare", value: 70 },
      { name: 'Teachers & Staff', value: 20 },
      { name: 'Facilities & Operations', value: 10 },
    ],
    impactStats: [
      { label: 'Students Supported', value: '250+' },
      { label: 'Active Sponsors', value: '180+' },
      { label: 'Years of Impact', value: '12+' },
      { label: 'Donation Efficiency', value: '95%' },
    ],
    trustMessage: '',
  })

  const loadContent = useCallback(async () => {
    try {
      const page = await getPageBySlug('transparency')
      if (page) {
        setPageExists(true)
        setPublished(page.published ?? false)
        if (page.content) {
          const c = page.content as Partial<TransparencyContent>
          setContent(prev => ({
            ...prev,
            ...c,
            allocationData: Array.isArray(c.allocationData) ? c.allocationData : prev.allocationData,
            impactStats: Array.isArray(c.impactStats) ? c.impactStats : prev.impactStats,
          }))
        }
      }
    } catch {
      toast.error('Failed to load transparency content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertPage({
        slug: 'transparency',
        title: 'Transparency & Accountability',
        content: content as unknown as Record<string, unknown>,
        published,
      })
      toast.success('Transparency content saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      await updatePagePublished('transparency', !published)
      setPublished(!published)
      toast.success(`Page ${!published ? 'published' : 'unpublished'}`)
    } catch {
      toast.error('Failed to update publish status')
    }
  }

  const addAllocation = () => {
    setContent({
      ...content,
      allocationData: [...content.allocationData, { name: '', value: 0 }],
    })
  }

  const updateAllocation = (idx: number, field: keyof TransparencyAllocation, value: string) => {
    const newData = [...content.allocationData]
    newData[idx] = { ...newData[idx], [field]: field === 'value' ? parseInt(value) || 0 : value }
    setContent({ ...content, allocationData: newData })
  }

  const removeAllocation = (idx: number) => {
    setContent({ ...content, allocationData: content.allocationData.filter((_, i) => i !== idx) })
  }

  const addStat = () => {
    setContent({
      ...content,
      impactStats: [...content.impactStats, { label: '', value: '' }],
    })
  }

  const updateStat = (idx: number, field: string, value: string) => {
    const newStats = [...content.impactStats]
    newStats[idx] = { ...newStats[idx], [field]: value }
    setContent({ ...content, impactStats: newStats })
  }

  const removeStat = (idx: number) => {
    setContent({ ...content, impactStats: content.impactStats.filter((_, i) => i !== idx) })
  }

  if (loading) return <FormSkeleton />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transparency Content</h1>
          <p className="text-gray-500 mt-1">Edit donation allocation, impact stats & trust messaging</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transparency"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Link>
          <button
            onClick={handleTogglePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
              published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {published ? 'Published' : 'Publish'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50">
            {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {!pageExists && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-2m4 0h-6" />
          </svg>
          <p className="text-sm text-amber-700">This page has no saved content yet. Edit the fields below and click "Save Changes" to create it.</p>
        </div>
      )}

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Header</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <input value={content.title} onChange={e => setContent({ ...content, title: e.target.value })}
                placeholder="Page title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subtitle Badge</label>
              <input value={content.subtitle} onChange={e => setContent({ ...content, subtitle: e.target.value })}
                placeholder="e.g. Built on Trust" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea value={content.description} onChange={e => setContent({ ...content, description: e.target.value })}
                rows={3} placeholder="Enter description"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Donation Allocation</h2>
            <button onClick={addAllocation}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">+ Add Category</button>
          </div>
          <div className="space-y-3">
            {content.allocationData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={item.name} onChange={e => updateAllocation(idx, 'name', e.target.value)}
                  placeholder="Category name"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <div className="flex items-center gap-2">
                  <input type="number" value={item.value} onChange={e => updateAllocation(idx, 'value', e.target.value)}
                    min={0} max={100} aria-label={`Allocation percentage for ${item.name || 'category ' + (idx + 1)}`}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 text-center" />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
                <button onClick={() => removeAllocation(idx)} aria-label="Remove allocation"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Impact Statistics</h2>
            <button onClick={addStat}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">+ Add Stat</button>
          </div>
          <div className="space-y-3">
            {content.impactStats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={stat.label} onChange={e => updateStat(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Students Supported)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <input value={stat.value} onChange={e => updateStat(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. 250+)"
                  className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 text-center" />
                <button onClick={() => removeStat(idx)} aria-label="Remove stat"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Message</h2>
          <textarea value={content.trustMessage} onChange={e => setContent({ ...content, trustMessage: e.target.value })}
            rows={4}
            placeholder="Your trust message for the transparency page..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
        </motion.div>
      </div>
    </div>
  )
}
