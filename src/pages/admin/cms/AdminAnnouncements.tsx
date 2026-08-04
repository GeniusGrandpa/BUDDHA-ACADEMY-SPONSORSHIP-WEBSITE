import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../services/announcements'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { Announcement, AnnouncementType } from '../../../types/cms'
import { useConfirm } from '../../../context/ConfirmContext'

export function AdminAnnouncements() {
  const { confirm } = useConfirm()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
    link_url: '',
    link_text: '',
    is_active: true,
    is_dismissible: true,
    starts_at: '',
    ends_at: '',
    sort_order: 0,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAnnouncements()
      setAnnouncements(data)
    } catch {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', content: '', type: 'info', link_url: '', link_text: '', is_active: true, is_dismissible: true, starts_at: '', ends_at: '', sort_order: announcements.length })
    setShowModal(true)
  }

  const openEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      title: item.title,
      content: item.content,
      type: item.type,
      link_url: item.link_url || '',
      link_text: item.link_text || '',
      is_active: item.is_active,
      is_dismissible: item.is_dismissible,
      starts_at: item.starts_at ? item.starts_at.slice(0, 16) : '',
      ends_at: item.ends_at ? item.ends_at.slice(0, 16) : '',
      sort_order: item.sort_order,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    try {
      const payload = {
        title: form.title,
        content: form.content,
        type: form.type,
        link_url: form.link_url || null,
        link_text: form.link_text || null,
        is_active: form.is_active,
        is_dismissible: form.is_dismissible,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        sort_order: form.sort_order,
      }

      if (editing) {
        await updateAnnouncement(editing.id, payload)
        toast.success('Announcement updated')
      } else {
        await createAnnouncement(payload as unknown as Announcement)
        toast.success('Announcement created')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (item: Announcement) => {
    if (!(await confirm(`Delete "${item.title}"?`))) return
    try {
      await deleteAnnouncement(item.id)
      toast.success('Announcement deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleActive = async (item: Announcement) => {
    try {
      await updateAnnouncement(item.id, { is_active: !item.is_active })
      toast.success(item.is_active ? 'Announcement hidden' : 'Announcement shown')
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Announcement</Button>
      </div>

      <div className="space-y-3">
        {announcements.map(item => (
          <div key={item.id} className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
              item.type === 'info' ? 'bg-blue-500' :
              item.type === 'warning' ? 'bg-orange-500' :
              item.type === 'success' ? 'bg-green-500' :
              item.type === 'error' ? 'bg-red-500' : 'bg-purple-500'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  item.type === 'info' ? 'bg-blue-100 text-blue-700' :
                  item.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                  item.type === 'success' ? 'bg-green-100 text-green-700' :
                  item.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                }`}>{item.type}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.content}</p>
              {item.link_url && <a href={item.link_url} className="text-sm text-amber-600 hover:underline mt-1 inline-block" target="_blank" rel="noopener noreferrer">{item.link_text || item.link_url}</a>}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                {item.starts_at && <span>From: {new Date(item.starts_at).toLocaleDateString()}</span>}
                {item.ends_at && <span>Until: {new Date(item.ends_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(item)} aria-label="Toggle visibility" className="p-2 text-gray-400 hover:text-amber-600 transition-colors">
                {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(item)} aria-label="Edit announcement" className="p-2 text-gray-400 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item)} aria-label="Delete announcement" className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">No announcements yet. Click "Create Announcement" to add one.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'Create'} Announcement</h2>
            <div className="space-y-4">
              <Input label="Title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} rows={3} placeholder="Enter announcement content" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as AnnouncementType }))} title="Announcement type" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div>
                  <Input label="Link URL" value={form.link_url} onChange={e => setForm(prev => ({ ...prev, link_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <Input label="Link Text" value={form.link_text} onChange={e => setForm(prev => ({ ...prev, link_text: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="datetime-local" value={form.starts_at} onChange={e => setForm(prev => ({ ...prev, starts_at: e.target.value }))} />
                <Input label="End Date" type="datetime-local" value={form.ends_at} onChange={e => setForm(prev => ({ ...prev, ends_at: e.target.value }))} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_dismissible} onChange={e => setForm(prev => ({ ...prev, is_dismissible: e.target.checked }))} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-gray-700">Dismissible</span>
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
