import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { getCmsPrograms, upsertCmsProgram, deleteCmsProgram } from '../../../services/cms-programs'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { CmsProgram } from '../../../types/database'

const defaultForm = {
  title: '',
  slug: '',
  description: '',
  full_description: '',
  image_url: '',
  category: 'general',
  status: 'active' as string,
  sort_order: 0,
  is_active: true,
  features: '',
  impact: '',
  funding_goal: 0,
  raised_amount: 0,
}

export function AdminPrograms() {
  const [programs, setPrograms] = useState<CmsProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CmsProgram | null>(null)
  const [form, setForm] = useState(defaultForm)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCmsPrograms(false)
      setPrograms(data)
    } catch {
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...defaultForm, sort_order: programs.length })
    setShowModal(true)
  }

  const openEdit = (item: CmsProgram) => {
    setEditing(item)
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description || '',
      full_description: item.full_description || '',
      image_url: item.image_url || '',
      category: item.category || 'general',
      status: item.status || 'active',
      sort_order: item.sort_order,
      is_active: item.is_active,
      features: JSON.stringify(item.features || [], null, 2),
      impact: item.impact || '',
      funding_goal: item.funding_goal || 0,
      raised_amount: item.raised_amount || 0,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('Title and slug are required')
      return
    }
    let features: unknown[]
    try {
      features = JSON.parse(form.features || '[]')
      if (!Array.isArray(features)) throw new Error()
    } catch {
      toast.error('Features must be a valid JSON array')
      return
    }

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        full_description: form.full_description || null,
        image_url: form.image_url || null,
        category: form.category || 'general',
        status: form.status,
        sort_order: form.sort_order,
        is_active: form.is_active,
        features,
        impact: form.impact || null,
        funding_goal: form.funding_goal,
        raised_amount: form.raised_amount,
      }
      if (editing) {
        await upsertCmsProgram({ ...payload, id: editing.id })
        toast.success('Program updated')
      } else {
        await upsertCmsProgram(payload as CmsProgram)
        toast.success('Program created')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Failed to save program')
    }
  }

  const handleDelete = async (item: CmsProgram) => {
    if (!confirm(`Delete "${item.title}"?`)) return
    try {
      await deleteCmsProgram(item.id)
      toast.success('Program deleted')
      load()
    } catch {
      toast.error('Failed to delete program')
    }
  }

  const toggleActive = async (item: CmsProgram) => {
    try {
      await upsertCmsProgram({ id: item.id, is_active: !item.is_active } as CmsProgram)
      toast.success(item.is_active ? 'Program hidden' : 'Program shown')
      load()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Programs ({programs.length})</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Program</Button>
      </div>

      <div className="space-y-3">
        {programs.map(item => (
          <div key={item.id} className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="text-xs text-gray-400">/programs</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span>Category: {item.category}</span>
                <span>Status: {item.status}</span>
                <span>Sort: {item.sort_order}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(item)} aria-label="Toggle visibility" className="p-2 text-gray-400 hover:text-amber-600 transition-colors">
                {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(item)} aria-label="Edit program" className="p-2 text-gray-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item)} aria-label="Delete program" className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No programs yet. Click "Create Program" to add one.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'Create'} Program</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required />
                <Input label="Slug" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} required placeholder="e.g. student-sponsorship" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Short description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea value={form.full_description} onChange={e => setForm(prev => ({ ...prev, full_description: e.target.value }))} rows={3} placeholder="Full description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <Input label="Image URL" value={form.image_url} onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} title="Category" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="general">General</option>
                    <option value="education">Education</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="health">Health</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} title="Status" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Sort Order" type="number" value={form.sort_order.toString()} onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Funding Goal (NPR)" type="number" value={form.funding_goal.toString()} onChange={e => setForm(prev => ({ ...prev, funding_goal: parseFloat(e.target.value) || 0 }))} />
                <Input label="Raised Amount (NPR)" type="number" value={form.raised_amount.toString()} onChange={e => setForm(prev => ({ ...prev, raised_amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (JSON array)</label>
                <textarea value={form.features} onChange={e => setForm(prev => ({ ...prev, features: e.target.value }))} rows={4} placeholder='[{"title": "Feature", "description": "Description"}]' className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                <textarea value={form.impact} onChange={e => setForm(prev => ({ ...prev, impact: e.target.value }))} rows={2} placeholder="Impact description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
