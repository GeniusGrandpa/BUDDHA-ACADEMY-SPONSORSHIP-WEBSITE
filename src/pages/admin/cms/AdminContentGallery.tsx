import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../../../services/gallery'
import type { GalleryItem } from '../../../types/database'
import { GallerySkeleton } from '../../../components/ui/LoadingSkeleton'
import { useConfirm } from '../../../context/ConfirmContext'

const GALLERY_TYPES = ['photo', 'video', 'testimonial']
const GALLERY_CATEGORIES = ['School Life', 'Events', 'Community', 'Sponsorship', 'General']

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=600'

export function AdminContentGallery() {
  const { confirm } = useConfirm()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())

    const [form, setForm] = useState<{
      title: string; url: string; thumbnail_url: string; type: 'photo' | 'video' | 'testimonial';
      caption: string; category: string; is_featured: boolean;
    }>({
      title: '', url: '', thumbnail_url: '', type: 'photo',
      caption: '', category: 'General', is_featured: false,
    })

  const loadItems = useCallback(async (featuredOnly?: boolean) => {
    setLoading(true)
    try {
      const data = await getGalleryItems({ featuredOnly: featuredOnly ?? (filterFeatured || undefined) })
      setItems(data)
    } catch {
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [filterFeatured])

   useEffect(() => { loadItems() }, [loadItems])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', url: '', thumbnail_url: '', type: 'photo', caption: '', category: 'General', is_featured: false })
    setShowModal(true)
  }

  const openEdit = (item: GalleryItem) => {
    setEditing(item)
    setForm({
      title: item.title, url: item.url, thumbnail_url: item.thumbnail_url || '',
      type: item.type, caption: item.caption || '', category: item.category || 'General',
      is_featured: item.is_featured,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Title and URL are required')
      return
    }
    try {
      if (editing) {
        await updateGalleryItem(editing.id, form as unknown as Partial<GalleryItem>)
        toast.success('Gallery item updated')
      } else {
        await createGalleryItem(form as unknown as Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>)
        toast.success('Gallery item added')
      }
      setShowModal(false)
      loadItems()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this item?'))) return
    try {
      await deleteGalleryItem(id)
      toast.success('Gallery item deleted')
      loadItems()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const togglePublish = async (item: GalleryItem) => {
    const original = items
    const updated = items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i)
    setItems(updated)
    try {
      await updateGalleryItem(item.id, { is_published: !item.is_published })
      toast.success(item.is_published ? 'Item unpublished' : 'Item published')
    } catch {
      setItems(original)
      toast.error('Failed to update publish status')
    }
  }

  const toggleFeatured = async (item: GalleryItem) => {
    const original = items
    const updated = items.map(i => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i)
    setItems(updated)
    try {
      await updateGalleryItem(item.id, { is_featured: !item.is_featured })
      toast.success(item.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch {
      setItems(original)
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 mt-1">Manage photos, videos and testimonials</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add Item
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setFilterFeatured(false); loadItems(false) }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filterFeatured ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All Items
        </button>
        <button onClick={() => { setFilterFeatured(true); loadItems(true) }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterFeatured ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Featured Only
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <GallerySkeleton />
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No gallery items found</div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all"
            >
              <div className="relative aspect-[4/3]">
                {item.type === 'video' ? (
                  item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={() => setBrokenImages(prev => new Set(prev).add(item.id))} />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  )
                ) : (
                  <img src={brokenImages.has(item.id) ? FALLBACK_IMAGE : item.url} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={() => setBrokenImages(prev => new Set(prev).add(item.id))} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button onClick={() => togglePublish(item)} className="px-2 py-1 rounded-lg text-xs text-white transition-colors bg-stone-900/60 hover:bg-emerald-500">
                      {item.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => toggleFeatured(item)} className="px-2 py-1 rounded-lg bg-stone-900/60 hover:bg-amber-500 text-xs text-white transition-colors">
                      {item.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => openEdit(item)} className="px-2 py-1 rounded-lg bg-stone-900/60 hover:bg-blue-500 text-xs text-white transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="px-2 py-1 rounded-lg bg-stone-900/60 hover:bg-red-500 text-xs text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {!item.is_published && (
                    <div className="px-2 py-0.5 rounded-full bg-gray-500 text-xs font-medium text-white">
                      Draft
                    </div>
                  )}
                  {item.is_featured && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-500 text-xs font-medium text-white">
                      Featured
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-stone-900/50 text-xs text-gray-200">
                  {item.type}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                {item.caption && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.caption}</p>}
                {item.category && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-50 text-xs text-amber-700">
                    {item.category}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Gallery Item</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">
                  Close
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">URL *</label>
                  <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Thumbnail URL</label>
                  <input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                    placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'photo' | 'video' | 'testimonial' })}
                      title="Gallery type" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      {GALLERY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      title="Category" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Caption</label>
                  <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })}
                    rows={3} placeholder="Enter caption..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">
                  {editing ? 'Update' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
