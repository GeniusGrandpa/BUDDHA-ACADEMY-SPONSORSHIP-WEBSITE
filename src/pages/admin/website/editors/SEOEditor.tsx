import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getSeoContent, upsertSeoContent } from '../../../../services/cms-content'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import { SaveButton } from '../shared/SaveButton'

const PAGES = [
  { slug: 'home', label: 'Home Page' },
  { slug: 'about', label: 'About Us' },
  { slug: 'sponsor', label: 'Sponsorship' },
  { slug: 'donate', label: 'Donations' },
  { slug: 'contact', label: 'Contact Us' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'volunteer', label: 'Volunteer' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms of Service' },
]

export function SEOEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seoData, setSeoData] = useState<Record<string, { meta_title: string; meta_description: string }>>({})

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      try {
        const results: Record<string, { meta_title: string; meta_description: string }> = {}
        for (const page of PAGES) {
          const data = await getSeoContent(page.slug)
          results[page.slug] = {
            meta_title: data?.meta_title || '',
            meta_description: data?.meta_description || '',
          }
        }
        setSeoData(results)
      } catch {
        toast.error('Failed to load SEO data')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [slug, data] of Object.entries(seoData)) {
        await upsertSeoContent({ page_slug: slug, ...data })
      }
      toast.success('SEO settings saved')
    } catch {
      toast.error('Failed to save SEO settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-500 mt-1">Set the title and description that appear in search results for each page</p>
        </div>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

      {PAGES.map(page => {
        const data = seoData[page.slug] || { meta_title: '', meta_description: '' }
        return (
          <div key={page.slug} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{page.label}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Page Title</label>
                <input type="text" value={data.meta_title} onChange={e => setSeoData(p => ({ ...p, [page.slug]: { ...p[page.slug], meta_title: e.target.value } }))}
                  placeholder={`${page.label} - Buddha Academy`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <p className="text-xs text-gray-400 mt-1">Shown in browser tabs and search results. Recommended: 50-60 characters.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea value={data.meta_description} onChange={e => setSeoData(p => ({ ...p, [page.slug]: { ...p[page.slug], meta_description: e.target.value } }))}
                  rows={2} placeholder={`Learn about ${page.label.toLowerCase()} at Buddha Academy...`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                <p className="text-xs text-gray-400 mt-1">A short summary shown under the title in search results. Recommended: 120-160 characters.</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
