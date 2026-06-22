import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getPageBySlug, upsertPage, getContentVersions } from '../../../services/content'
import { AdminBlockEditor } from '../../../components/blocks/AdminBlockEditor'
import type { SeoMetadata } from '../../../types/cms'
import type { ContentVersion } from '../../../types/database'

export function AdminHomepageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageId, setPageId] = useState<string>('')
  const [pageTitle, setPageTitle] = useState('Homepage')
  const [published, setPublished] = useState(false)
  const [seo, setSeo] = useState<SeoMetadata>({})
  const [activeTab, setActiveTab] = useState<'blocks' | 'seo' | 'versions'>('blocks')
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)

  const loadPage = useCallback(async () => {
    setLoading(true)
    try {
      const page = await getPageBySlug('home')
      if (page) {
        setPageId(page.id)
        setPageTitle(page.title)
        setPublished(page.published ?? false)
        if (page.seo && typeof page.seo === 'object' && !Array.isArray(page.seo)) {
          setSeo(page.seo as SeoMetadata)
        }
      }
    } catch {
      toast.error('Failed to load homepage')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPage() }, [loadPage])

  const loadVersions = useCallback(async () => {
    if (!pageId) return
    setVersionsLoading(true)
    try {
      const data = await getContentVersions('pages', pageId)
      setVersions(data)
    } catch {
      toast.error('Failed to load version history')
    } finally {
      setVersionsLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    if (activeTab === 'versions' && pageId) {
      loadVersions()
    }
  }, [activeTab, pageId, loadVersions])

  const handleSaveSeo = async () => {
    setSaving(true)
    try {
      const currentPage = await getPageBySlug('home')
      await upsertPage({
        slug: 'home',
        title: pageTitle,
        content: currentPage?.content as Record<string, unknown> || {},
        published,
        seo,
      })
      toast.success('SEO settings saved')
    } catch {
      toast.error('Failed to save SEO')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    const newPublished = !published
    setPublished(newPublished)
    setSaving(true)
    try {
      const currentPage = await getPageBySlug('home')
      await upsertPage({
        slug: 'home',
        title: pageTitle,
        content: currentPage?.content as Record<string, unknown> || {},
        published: newPublished,
        seo,
      })
      toast.success(newPublished ? 'Homepage published' : 'Homepage unpublished')
    } catch {
      toast.error('Failed to update publish status')
      setPublished(!newPublished)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading homepage...</div>
  }

  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'blocks', label: 'Page Builder', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { key: 'seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { key: 'versions', label: 'Version History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-gray-500 mt-1">
            Build your homepage by adding and arranging content blocks
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

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

      {activeTab === 'blocks' && pageId && (
        <motion.div key="blocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminBlockEditor slug="home" pageId={pageId} />
        </motion.div>
      )}

      {activeTab === 'seo' && (
        <motion.div key="seo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Page Title</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Homepage"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">SEO Title</label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Buddha Academy - Empowering Through Education"
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
              placeholder="education, sponsorship, nepal, charity"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Canonical URL</label>
              <input
                type="url"
                value={seo.canonical_url || ''}
                onChange={(e) => setSeo(prev => ({ ...prev, canonical_url: e.target.value }))}
                placeholder="https://buddhaacademy.edu.np"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveSeo}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
            >
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {saving ? 'Saving...' : 'Save SEO'}
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'versions' && (
        <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Version History</h3>
              <p className="text-xs text-gray-500 mt-0.5">Each save creates a new version that can be restored</p>
            </div>
            {versionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No versions yet. Save the page to create a version.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {versions.map((version) => (
                  <div key={version.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">v{version.version_number}</span>
                      {version.restored_at && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Restored</span>
                      )}
                      {version.published && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Published</span>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
