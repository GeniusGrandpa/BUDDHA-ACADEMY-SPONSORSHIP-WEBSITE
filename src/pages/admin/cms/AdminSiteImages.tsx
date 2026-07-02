import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { upsertSiteImage, deleteSiteImage, db } from '../../../services/cms-content'
import type { SiteImage } from '../../../types/cms-content'
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton'

const SECTIONS = ['home', 'about', 'donation', 'sponsorship', 'volunteer', 'gallery', 'footer']

export function AdminSiteImages() {
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SiteImage | null>(null)
  const [filterSection, setFilterSection] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    image_key: '', image_url: '', alt_text: '', title: '', position: 'center', section: 'home',
  })

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db('site_images').select('*').order('created_at', { ascending: false })

      setImages((data || []) as any[]) 
    } catch { toast.error('Failed to load site images') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const filtered = images.filter(img => {
    const matchSection = filterSection === 'all' || img.section === filterSection
    const matchSearch = !search || img.image_key.toLowerCase().includes(search.toLowerCase()) ||
      img.alt_text?.toLowerCase().includes(search.toLowerCase()) || img.title?.toLowerCase().includes(search.toLowerCase())
    return matchSection && matchSearch
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ image_key: '', image_url: '', alt_text: '', title: '', position: 'center', section: 'home' })
    setShowModal(true)
  }

  const openEdit = (img: SiteImage) => {
    setEditing(img)
    setForm({
      image_key: img.image_key, image_url: img.image_url, alt_text: img.alt_text || '',
      title: img.title || '', position: img.position || 'center', section: img.section || 'home',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.image_key || !form.image_url) {
      toast.error('Image key and URL are required')
      return
    }
    try {
      await upsertSiteImage(editing ? { id: editing.id, ...form } : form)
      toast.success(editing ? 'Image updated' : 'Image created')
      setShowModal(false)
      loadAll()
    } catch { toast.error('Failed to save image') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return
    try {
      await deleteSiteImage(id)
      setImages(images.filter(i => i.id !== id))
      toast.success('Image deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Images</h1>
          <p className="text-gray-500 mt-1">Manage all site images across sections</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add Image
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterSection('all')}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterSection === 'all' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>All</button>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setFilterSection(s)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap capitalize ${filterSection === s ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{s}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search images..."
          className="ml-auto bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50 w-48" />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No images found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Image</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Key</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Title</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Section</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Position</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(img => (
                <tr key={img.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-2">
                    <div className="w-12 h-10 rounded-lg bg-gray-100 overflow-hidden">
                      {img.image_url ? (
                        <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-700">{img.image_key}</td>
                  <td className="py-3 px-2 text-gray-700">{img.title || '-'}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs capitalize">{img.section || 'home'}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{img.position || 'center'}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => openEdit(img)}
                      className="px-2 py-1 rounded text-xs hover:bg-gray-100 text-gray-500 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(img.id)}
                      className="px-2 py-1 rounded text-xs hover:bg-gray-100 text-gray-500 hover:text-red-600 ml-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Image</h2>
                <button onClick={() => setShowModal(false)}
                  className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Image Key *</label>
                  <input value={form.image_key} onChange={e => setForm({ ...form, image_key: e.target.value })}
                    placeholder="e.g. hero_donation, about_team"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Image URL *</label>
                  <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Image title"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                    <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                      title="Section" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      {SECTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                    <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                      title="Position" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Alt Text</label>
                    <input value={form.alt_text} onChange={e => setForm({ ...form, alt_text: e.target.value })}
                      placeholder="Accessibility description"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">
                  {editing ? 'Update' : 'Create Image'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
