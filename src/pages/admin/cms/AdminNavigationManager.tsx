import { useState, useEffect, useCallback } from 'react'
import { Reorder } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, GripVertical, Pencil, Trash2, Menu } from 'lucide-react'
import { getNavigationItems, createNavigationItem, updateNavigationItem, deleteNavigationItem, reorderNavigationItems } from '../../../services/navigation'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { NavigationItem, NavigationLocation } from '../../../types/cms'

const LOCATIONS: { value: NavigationLocation; label: string }[] = [
  { value: 'header', label: 'Header Navigation' },
  { value: 'footer_get_involved', label: 'Footer - Get Involved' },
  { value: 'footer_information', label: 'Footer - Information' },
  { value: 'quick_links', label: 'Quick Links' },
]

export function AdminNavigationManager() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLocation, setActiveLocation] = useState<NavigationLocation>('header')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<NavigationItem | null>(null)
  const [form, setForm] = useState({
    label: '',
    url: '',
    route: '/',
    location: 'header' as NavigationLocation,
    sort_order: 0,
    is_visible: true,
    is_cta: false,
    cta_style: '' as string,
    target: '_self' as '_self' | '_blank',
    requires_auth: false,
    roles: '',
  })

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getNavigationItems()
      setItems(data)
    } catch {
      toast.error('Failed to load navigation items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const filteredItems = items.filter(i => i.location === activeLocation)

  const openCreate = () => {
    setEditing(null)
    setForm({ label: '', url: '', route: '/', location: activeLocation, sort_order: filteredItems.length, is_visible: true, is_cta: false, cta_style: '', target: '_self', requires_auth: false, roles: '' })
    setShowModal(true)
  }

  const openEdit = (item: NavigationItem) => {
    setEditing(item)
    setForm({
      label: item.label,
      url: item.url || '',
      route: item.route || '/',
      location: item.location,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      is_cta: item.is_cta,
      cta_style: item.cta_style || '',
      target: item.target,
      requires_auth: item.requires_auth,
      roles: item.roles.join(', '),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.label) {
      toast.error('Label is required')
      return
    }
    try {
      const payload = {
        label: form.label,
        url: form.url || null,
        route: form.route || null,
        location: form.location,
        sort_order: form.sort_order,
        is_visible: form.is_visible,
        is_cta: form.is_cta,
        cta_style: (form.cta_style || null) as 'primary' | 'secondary' | 'glass' | 'outline' | null,
        target: form.target as '_self' | '_blank',
        requires_auth: form.requires_auth,
        roles: form.roles ? form.roles.split(',').map(r => r.trim()).filter(Boolean) : [],
        parent_id: null,
      }

      if (editing) {
        await updateNavigationItem(editing.id, payload)
        toast.success('Navigation item updated')
      } else {
        await createNavigationItem(payload as unknown as NavigationItem)
        toast.success('Navigation item created')
      }
      setShowModal(false)
      loadItems()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (item: NavigationItem) => {
    if (!confirm(`Delete "${item.label}"?`)) return
    try {
      await deleteNavigationItem(item.id)
      toast.success('Navigation item deleted')
      loadItems()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleReorder = async (reordered: NavigationItem[]) => {
    setItems(prev => prev.map(i => {
      const found = reordered.find(r => r.id === i.id)
      if (found && i.location === activeLocation) return { ...i, sort_order: reordered.indexOf(found) }
      return i
    }))
    const updated = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }))
    try {
      await reorderNavigationItems(updated)
    } catch {
      toast.error('Failed to reorder')
      loadItems()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Navigation Manager</h1>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {LOCATIONS.map(loc => (
          <button key={loc.value} onClick={() => setActiveLocation(loc.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeLocation === loc.value ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{loc.label}</button>
        ))}
      </div>

      <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder} className="space-y-2">
        {filteredItems.map(item => (
          <Reorder.Item key={item.id} value={item} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                {item.is_cta && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">CTA</span>}
                {!item.is_visible && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Hidden</span>}
              </div>
              <div className="text-sm text-gray-500 truncate">{item.route || item.url || 'No link'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(item)} aria-label="Edit navigation item" className="p-2 text-gray-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item)} aria-label="Delete navigation item" className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">No navigation items in this location. Click "Add Item" to create one.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'Add'} Navigation Item</h2>
            <div className="space-y-4">
              <Input label="Label" value={form.label} onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_cta} onChange={e => setForm(prev => ({ ...prev, is_cta: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-sm text-gray-700">CTA Button</span>
              </label>
              {form.is_cta && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Style</label>
                  <select value={form.cta_style} onChange={e => setForm(prev => ({ ...prev, cta_style: e.target.value }))} title="CTA style" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="">Default</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="glass">Glass</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Route (e.g., /about)" value={form.route} onChange={e => setForm(prev => ({ ...prev, route: e.target.value }))} />
                <Input label="External URL" value={form.url} onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open in</label>
                  <select value={form.target} onChange={e => setForm(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))} title="Link target" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value as NavigationLocation }))} title="Navigation location" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    {LOCATIONS.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_visible} onChange={e => setForm(prev => ({ ...prev, is_visible: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-sm text-gray-700">Visible</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.requires_auth} onChange={e => setForm(prev => ({ ...prev, requires_auth: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-sm text-gray-700">Requires authentication</span>
              </label>
              <Input label="Role restriction (comma-separated)" value={form.roles} onChange={e => setForm(prev => ({ ...prev, roles: e.target.value }))} placeholder="admin, super_admin" />
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
