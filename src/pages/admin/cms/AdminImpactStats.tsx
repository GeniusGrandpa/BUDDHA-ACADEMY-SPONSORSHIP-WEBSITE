import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { getCmsImpactStats, upsertCmsImpactStat, deleteCmsImpactStat } from '../../../services/cms-programs'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { CmsImpactStat } from '../../../types/database'

const defaultForm = {
  label: '',
  value: '',
  prefix: '',
  suffix: '',
  icon: '',
  category: 'general',
  sort_order: 0,
  is_active: true,
}

export function AdminImpactStats() {
  const [stats, setStats] = useState<CmsImpactStat[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CmsImpactStat | null>(null)
  const [form, setForm] = useState(defaultForm)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCmsImpactStats(false)
      setStats(data)
    } catch {
      toast.error('Failed to load impact stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...defaultForm, sort_order: stats.length })
    setShowModal(true)
  }

  const openEdit = (item: CmsImpactStat) => {
    setEditing(item)
    setForm({
      label: item.label,
      value: item.value,
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      icon: item.icon || '',
      category: item.category || 'general',
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.label || !form.value) {
      toast.error('Label and value are required')
      return
    }
    try {
      const payload = {
        label: form.label,
        value: form.value,
        prefix: form.prefix || null,
        suffix: form.suffix || null,
        icon: form.icon || null,
        category: form.category || 'general',
        sort_order: form.sort_order,
        is_active: form.is_active,
      }
      if (editing) {
        await upsertCmsImpactStat({ ...payload, id: editing.id })
        toast.success('Stat updated')
      } else {
        await upsertCmsImpactStat(payload as CmsImpactStat)
        toast.success('Stat created')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Failed to save stat')
    }
  }

  const handleDelete = async (item: CmsImpactStat) => {
    if (!confirm(`Delete "${item.label}"?`)) return
    try {
      await deleteCmsImpactStat(item.id)
      toast.success('Stat deleted')
      load()
    } catch {
      toast.error('Failed to delete stat')
    }
  }

  const toggleActive = async (item: CmsImpactStat) => {
    try {
      await upsertCmsImpactStat({ id: item.id, is_active: !item.is_active } as CmsImpactStat)
      toast.success(item.is_active ? 'Stat hidden' : 'Stat shown')
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
        <h1 className="text-2xl font-bold text-gray-900">Impact Stats ({stats.length})</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Stat</Button>
      </div>

      <div className="space-y-3">
        {stats.map(item => (
          <div key={item.id} className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="text-lg font-bold text-emerald-600">{item.prefix}{item.value}{item.suffix}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>Category: {item.category}</span>
                <span>Sort: {item.sort_order}</span>
                {item.icon && <span>Icon: {item.icon}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(item)} aria-label="Toggle visibility" className="p-2 text-gray-400 hover:text-amber-600 transition-colors">
                {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(item)} aria-label="Edit stat" className="p-2 text-gray-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item)} aria-label="Delete stat" className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="text-center py-12 text-gray-500">No stats yet. Click "Create Stat" to add one.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'Create'} Impact Stat</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Label" value={form.label} onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))} required placeholder="e.g. Students Supported" />
                <Input label="Value" value={form.value} onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))} required placeholder="e.g. 500+" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prefix" value={form.prefix} onChange={e => setForm(prev => ({ ...prev, prefix: e.target.value }))} placeholder="e.g. NPR " />
                <Input label="Suffix" value={form.suffix} onChange={e => setForm(prev => ({ ...prev, suffix: e.target.value }))} placeholder="e.g. %" />
              </div>
              <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="e.g. 🎓" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} title="Category" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="general">General</option>
                  <option value="education">Education</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="community">Community</option>
                </select>
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
