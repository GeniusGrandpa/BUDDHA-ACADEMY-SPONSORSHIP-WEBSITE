import { useState, useEffect, useCallback } from 'react'
import { Reorder } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { getPartners, createPartner, updatePartner, deletePartner, reorderPartners } from '../../../services/partners'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { Partner, PartnerType } from '../../../types/cms'
import { useConfirm } from '../../../context/ConfirmContext'

const PARTNER_TYPES: { value: PartnerType; label: string }[] = [
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'donor', label: 'Donor' },
  { value: 'partner', label: 'Partner' },
  { value: 'media', label: 'Media' },
  { value: 'community', label: 'Community' },
  { value: 'government', label: 'Government' },
]

export function AdminPartners() {
  const { confirm } = useConfirm()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    partner_type: 'sponsor' as PartnerType,
    description: '',
    sort_order: 0,
    is_visible: true,
    is_featured: false,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPartners()
      setPartners(filterType === 'all' ? data : data.filter(p => p.partner_type === filterType))
    } catch {
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', logo_url: '', website_url: '', partner_type: 'sponsor', description: '', sort_order: partners.length, is_visible: true, is_featured: false })
    setShowModal(true)
  }

  const openEdit = (item: Partner) => {
    setEditing(item)
    setForm({
      name: item.name,
      logo_url: item.logo_url,
      website_url: item.website_url || '',
      partner_type: item.partner_type,
      description: item.description || '',
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      is_featured: item.is_featured,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.logo_url) {
      toast.error('Name and logo URL are required')
      return
    }
    try {
      const payload = {
        name: form.name,
        logo_url: form.logo_url,
        website_url: form.website_url || null,
        partner_type: form.partner_type,
        description: form.description || null,
        sort_order: form.sort_order,
        is_visible: form.is_visible,
        is_featured: form.is_featured,
      }

      if (editing) {
        await updatePartner(editing.id, payload)
        toast.success('Partner updated')
      } else {
        await createPartner(payload as unknown as Partner)
        toast.success('Partner created')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (item: Partner) => {
    if (!(await confirm(`Delete "${item.name}"?`))) return
    try {
      await deletePartner(item.id)
      toast.success('Partner deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleReorder = async (reordered: Partner[]) => {
    setPartners(reordered)
    const updated = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }))
    try {
      await reorderPartners(updated)
    } catch {
      toast.error('Failed to reorder')
      load()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
  }

  const filteredPartners = filterType === 'all' ? partners : partners.filter(p => p.partner_type === filterType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners & Sponsors</h1>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Partner</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {PARTNER_TYPES.map(pt => (
          <button key={pt.value} onClick={() => setFilterType(pt.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === pt.value ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{pt.label}</button>
        ))}
      </div>

      <Reorder.Group axis="y" values={filteredPartners} onReorder={handleReorder} className="space-y-3">
        {filteredPartners.map(item => (
          <Reorder.Item key={item.id} value={item} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab shrink-0" />
            <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain" loading="lazy" decoding="async" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{item.partner_type}</span>
                {!item.is_visible && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Hidden</span>}
              </div>
              {item.website_url && <a href={item.website_url} className="text-xs text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">{item.website_url}</a>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(item)} aria-label="Edit partner" className="p-2 text-gray-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item)} aria-label="Delete partner" className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12 text-gray-500">No partners found. Click "Add Partner" to add one.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'Add'} Partner</h2>
            <div className="space-y-4">
              <Input label="Organization Name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
              <Input label="Logo URL" value={form.logo_url} onChange={e => setForm(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://..." />
              {form.logo_url && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={form.logo_url} alt="Preview" className="h-10 w-auto object-contain" loading="lazy" decoding="async" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className="text-sm text-gray-500">Logo preview</span>
                </div>
              )}
              <Input label="Website URL" value={form.website_url} onChange={e => setForm(prev => ({ ...prev, website_url: e.target.value }))} placeholder="https://..." />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.partner_type} onChange={e => setForm(prev => ({ ...prev, partner_type: e.target.value as PartnerType }))} title="Partner type" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  {PARTNER_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Enter description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm(prev => ({ ...prev, is_visible: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-gray-700">Visible</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
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
