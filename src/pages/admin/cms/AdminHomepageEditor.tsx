import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getPageBySlug, upsertPage } from '../../../services/content'
import { AdminBlockEditor } from '../../../components/blocks/AdminBlockEditor'

export function AdminHomepageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageId, setPageId] = useState('')
  const [pageTitle, setPageTitle] = useState('Homepage')
  const [published, setPublished] = useState(false)
  const loadPage = useCallback(async () => {
    setLoading(true)
    try {
      const page = await getPageBySlug('home')
      if (page) {
        setPageId(page.id)
        setPageTitle(page.title)
        setPublished(page.published ?? false)
      }
    } catch {
      toast.error('Failed to load homepage')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPage() }, [loadPage])

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
          <p className="text-gray-500 mt-1">Edit the content sections on your home page</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
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
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Content Sections</h3>
          <p className="text-xs text-gray-500 mt-0.5">Add, edit, and arrange sections on your home page</p>
        </div>
        <div className="p-6">
          <AdminBlockEditor slug="home" pageId={pageId} />
        </div>
      </div>
    </div>
  )
}
