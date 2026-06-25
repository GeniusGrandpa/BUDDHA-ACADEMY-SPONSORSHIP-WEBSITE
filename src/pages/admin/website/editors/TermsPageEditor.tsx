import { useState, useEffect } from 'react'
import { getPageBySlug, upsertPage } from '../../../../services/content'
import { getPageHeader, upsertPageHeader } from '../../../../services/cms-content'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

export function TermsPageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [header, setHeader] = useState({ title: '', subtitle: '' })
  const [body, setBody] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [hdr, page] = await Promise.all([
        getPageHeader('terms').catch(() => null),
        getPageBySlug('terms').catch(() => null),
      ])
      if (hdr) setHeader({ title: hdr.title || '', subtitle: hdr.subtitle || '' })
      if (page?.content) {
        const c = page.content as { body?: string; lastUpdated?: string }
        if (c.body) setBody(c.body)
        if (c.lastUpdated) setLastUpdated(c.lastUpdated)
      }
    } catch { toast.error('Failed to load terms page') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        upsertPageHeader({ page_slug: 'terms', title: header.title, subtitle: header.subtitle, is_visible: true } as never),
        upsertPage({ slug: 'terms', title: 'Terms of Service', content: { body, lastUpdated } as unknown as Record<string, unknown>, published: true }),
      ])
      toast.success('Terms page saved')
    } catch { toast.error('Failed to save terms page') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton fields={4} />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-500 mt-1">Edit the terms of service page content</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Page Header</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={header.title} onChange={e => setHeader(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input value={header.subtitle} onChange={e => setHeader(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Content</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated Date</label>
          <input value={lastUpdated} onChange={e => setLastUpdated(e.target.value)} placeholder="e.g. January 1, 2025"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
          <p className="text-xs text-gray-400 mb-2">Each paragraph will be rendered as a separate paragraph on the page.</p>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={16}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50 font-mono" />
        </div>
      </div>
    </div>
  )
}
