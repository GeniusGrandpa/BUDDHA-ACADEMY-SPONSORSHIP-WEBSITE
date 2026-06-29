import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  getLegalPageByType,
  upsertLegalPage,
  upsertLegalPageSections,
  saveLegalPageVersion,
  getLegalPageVersions,
} from '../../../../services/legal-pages'
import { useAuth } from '../../../../context/AuthContext'
import { hasPermission } from '../../../../features/auth/services/permissions'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import type { LegalPageType, LegalPageStatus } from '../../../../services/legal-pages'
import type { PermissionCode } from '../../../../features/auth/types/permissions'
import toast from 'react-hot-toast'

interface SectionForm {
  heading: string
  content: string
  sort_order: number
  is_visible: boolean
}

const PAGE_CONFIG: Record<LegalPageType, { title: string; slug: string; meta: string; desc: string }> = {
  privacy_policy: {
    title: 'Privacy Policy',
    slug: 'privacy',
    meta: 'Privacy Policy - Buddha Academy Sponsorship Platform',
    desc: 'Manage your privacy policy page content, sections, and publishing settings.',
  },
  terms_conditions: {
    title: 'Terms & Conditions',
    slug: 'terms',
    meta: 'Terms & Conditions - Buddha Academy Sponsorship Platform',
    desc: 'Manage your terms and conditions page content, sections, and publishing settings.',
  },
  cookie_policy: {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    meta: 'Cookie Policy - Buddha Academy Sponsorship Platform',
    desc: 'Manage your cookie policy page content.',
  },
  donation_policy: {
    title: 'Donation Policy',
    slug: 'donation-policy',
    meta: 'Donation Policy - Buddha Academy Sponsorship Platform',
    desc: 'Manage your donation policy page content.',
  },
}

interface LegalPagesEditorProps {
  type?: string
}

export function LegalPagesEditor({ type: propType }: LegalPagesEditorProps) {
  const { type: paramType } = useParams<{ type: string }>()

  const type = propType || paramType || 'privacy'
  const { profile, permissions } = useAuth()

  const pageType = (type === 'privacy' ? 'privacy_policy' :
    type === 'terms' ? 'terms_conditions' :
    type as LegalPageType) || 'privacy_policy'

  const config = PAGE_CONFIG[pageType] || PAGE_CONFIG.privacy_policy

  const canEdit = profile?.role === 'super_admin' || hasPermission(profile?.role || null, 'content.legal' as PermissionCode, permissions)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageTitle, setPageTitle] = useState(config.title)
  const [metaTitle, setMetaTitle] = useState(config.meta)
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<LegalPageStatus>('draft')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [sections, setSections] = useState<SectionForm[]>([])
  const [showCookieSection, setShowCookieSection] = useState(false)
  const [showDonationSection, setShowDonationSection] = useState(false)
  const [showStudentSection, setShowStudentSection] = useState(false)
  const [showRefundSection, setShowRefundSection] = useState(false)
  const [showContactSection, setShowContactSection] = useState(true)
  const [versions, setVersions] = useState<{ version_number: number; created_at: string }[]>([])
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const load = useCallback(async () => {
    try {
      const legalPage = await getLegalPageByType(pageType)
      if (legalPage) {
        setPageTitle(legalPage.title)
        setMetaTitle(legalPage.meta_title || config.meta)
        setMetaDescription(legalPage.meta_description || '')
        setStatus(legalPage.status)
        setEffectiveDate(legalPage.effective_date || '')
        setPublishedAt(legalPage.published_at)
        setUpdatedAt(legalPage.updated_at)
        if (legalPage.sections) {
          setSections(
            legalPage.sections.map(s => ({
              heading: s.heading,
              content: s.content,
              sort_order: s.sort_order,
              is_visible: s.is_visible,
            })),
          )
        }
        const vers = await getLegalPageVersions(pageType)
        setVersions(vers.map(v => ({ version_number: v.version_number, created_at: v.created_at })))
      }
    } catch {
      toast.error('Failed to load legal page')
    } finally {
      setLoading(false)
    }
  }, [pageType, config.meta])

  useEffect(() => {
    load()
  }, [load])

  const markUnsaved = () => setHasUnsaved(true)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsaved])

  const addSection = () => {
    setSections(prev => [...prev, { heading: '', content: '', sort_order: prev.length, is_visible: true }])
    markUnsaved()
  }

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, sort_order: i })))
    markUnsaved()
  }

  const updateSection = (index: number, field: keyof SectionForm, value: string | boolean | number) => {
    setSections(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    markUnsaved()
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return
    setSections(prev => {
      const next = [...prev]
      const temp = next[index]
      next[index] = { ...next[newIndex], sort_order: index }
      next[newIndex] = { ...temp, sort_order: newIndex }
      return next
    })
    markUnsaved()
  }

  const handleSave = async (newStatus?: LegalPageStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit legal pages')
      return
    }
    setSaving(true)
    try {
      const targetStatus = newStatus || status
      const page = await upsertLegalPage(pageType, {
        title: pageTitle,
        slug: config.slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        status: targetStatus,
        effective_date: effectiveDate || null,
      })

      setStatus(page.status as LegalPageStatus)
      if (page.published_at) setPublishedAt(page.published_at)

      if (page.id) {
        await upsertLegalPageSections(page.id, sections)
      }

      await saveLegalPageVersion(pageType)

      const vers = await getLegalPageVersions(pageType)
      setVersions(vers.map(v => ({ version_number: v.version_number, created_at: v.created_at })))

      setHasUnsaved(false)
      toast.success(`${config.title} saved successfully`)
    } catch {
      toast.error('Failed to save legal page')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (status === 'published') {
      await handleSave('draft')
      toast.success(`${config.title} unpublished`)
    } else {
      await handleSave('published')
      toast.success(`${config.title} published`)
    }
  }

  const handleReset = () => {
    load()
    setHasUnsaved(false)
    toast.success('Changes discarded')
  }

  const handlePreview = () => {
    window.open(`/${config.slug}`, '_blank')
  }

  if (!canEdit) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to manage legal pages.</p>
      </div>
    )
  }

  if (loading) return <FormSkeleton fields={6} />

  const statusBadge = () => {
    switch (status) {
      case 'published': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Published</span>
      case 'draft': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Draft</span>
      case 'hidden': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Hidden</span>
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            {statusBadge()}
          </div>
          <p className="text-gray-500">{config.desc}</p>
          {updatedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {publishedAt && (
            <p className="text-xs text-gray-400">
              Published: {new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleReset} disabled={saving || !hasUnsaved}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Reset
          </button>
          <button onClick={handlePreview}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Preview
          </button>
          <button onClick={() => handleSave()} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-lg transition-colors">
            {saving ? 'Processing...' : status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Page Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input value={pageTitle} onChange={e => { setPageTitle(e.target.value); markUnsaved() }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as LegalPageStatus)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input value={metaTitle} onChange={e => { setMetaTitle(e.target.value); markUnsaved() }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <input type="date" value={effectiveDate ? effectiveDate.split('T')[0] : ''} onChange={e => { setEffectiveDate(e.target.value); markUnsaved() }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea value={metaDescription} onChange={e => { setMetaDescription(e.target.value); markUnsaved() }} rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <button onClick={addSection}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors">
            Add Section
          </button>
        </div>
        <p className="text-xs text-gray-400">Each section appears as a heading with content below it on the public page.</p>

        {sections.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">No sections yet. Click "Add Section" to start building your page.</p>
        )}

        {sections.map((section, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase">Section {index + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveSection(index, 'up')} disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move down">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer ml-2">
                  <input type="checkbox" checked={section.is_visible} onChange={e => updateSection(index, 'is_visible', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  Visible
                </label>
                <button onClick={() => removeSection(index)}
                  className="p-1 text-red-400 hover:text-red-600 ml-2" title="Remove section">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Heading</label>
              <input value={section.heading} onChange={e => updateSection(index, 'heading', e.target.value)}
                placeholder="e.g. Introduction, Information We Collect..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
              <textarea value={section.content} onChange={e => updateSection(index, 'content', e.target.value)} rows={6}
                placeholder="Write your section content here. Use clear, professional language."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50 font-mono leading-relaxed" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Visibility Toggles</h2>
        <p className="text-xs text-gray-400">Control which optional sections are shown on this policy page.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showCookieSection} onChange={e => setShowCookieSection(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Cookie Policy Section</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showDonationSection} onChange={e => setShowDonationSection(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Donation Policy Section</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showStudentSection} onChange={e => setShowStudentSection(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Student Data Protection</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showRefundSection} onChange={e => setShowRefundSection(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Refund Policy Section</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showContactSection} onChange={e => setShowContactSection(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Contact Section</span>
          </label>
        </div>
      </div>

      {versions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          <div className="space-y-2">
            {versions.map(v => (
              <div key={v.version_number} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">Version {v.version_number}</span>
                <span className="text-gray-400">{new Date(v.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleReset} disabled={saving || !hasUnsaved}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button onClick={() => handleSave()} disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button onClick={handlePublish} disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-lg transition-colors">
          {saving ? 'Processing...' : status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
