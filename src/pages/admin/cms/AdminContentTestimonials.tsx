import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getTestimonialsWithType, createTestimonial, updateTestimonial, deleteTestimonial } from '../../../services/content'
import type { Testimonial } from '../../../types/database'
import { ListSkeleton } from '../../../components/ui/LoadingSkeleton'
import { useConfirm } from '../../../context/ConfirmContext'

const TESTIMONIAL_TYPES = [
  { value: 'donor', label: 'Donor' },
  { value: 'student', label: 'Student' },
  { value: 'volunteer', label: 'Volunteer' },
] as const

type TestimonialType = typeof TESTIMONIAL_TYPES[number]['value']

type TestimonialForm = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>

export function AdminContentTestimonials() {
  const { confirm } = useConfirm()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [filterType, setFilterType] = useState('all')

const [form, setForm] = useState<TestimonialForm>({
    author_name: '', author_role: '', content: '', quote: '',
    avatar_url: '', is_published: true, is_featured: false,
    testimonial_type: 'donor', sort_order: 0,
  })

  const loadTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTestimonialsWithType(filterType)
      setItems(data)
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }, [filterType])

   useEffect(() => { loadTestimonials() }, [loadTestimonials])

  const openCreate = () => {
    setEditing(null)
    setForm({ author_name: '', author_role: '', content: '', quote: '', avatar_url: '', is_published: true, is_featured: false, testimonial_type: 'donor', sort_order: 0 })
    setShowModal(true)
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    setForm({
      author_name: item.author_name, author_role: item.author_role,
      content: item.content, quote: item.quote || '',
      avatar_url: item.avatar_url || '', is_published: item.is_published,
      is_featured: item.is_featured, testimonial_type: item.testimonial_type,
      sort_order: item.sort_order,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.author_name || !form.content) {
      toast.error('Name and testimonial content are required')
      return
    }
    try {
      if (editing) {
        await updateTestimonial(editing.id, form)
        toast.success('Testimonial updated')
      } else {
        await createTestimonial(form)
        toast.success('Testimonial created')
      }
      setShowModal(false)
      loadTestimonials()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this testimonial?'))) return
    try {
      await deleteTestimonial(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const togglePublish = async (item: Testimonial) => {
    const original = items
    const updated = items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i)
    setItems(updated)
    try {
      await updateTestimonial(item.id, { is_published: !item.is_published })
      toast.success(item.is_published ? 'Unpublished' : 'Published')
    } catch {
      setItems(original)
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-gray-400 mt-1">Manage donor, student & volunteer testimonials</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add Testimonial
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterType === 'all' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>All</button>
        {TESTIMONIAL_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterType === t.value ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <ListSkeleton rows={5} />
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No testimonials found</div>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.avatar_url ? (
                    <img src={item.avatar_url} alt="" className="w-full h-full rounded-full object-cover" loading="lazy" decoding="async" />
                  ) : item.author_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{item.author_name}</h3>
                      <p className="text-sm text-gray-400">{item.author_role}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-500/10 text-gray-400'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs capitalize">{item.testimonial_type}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">"{item.content}"</p>
                  {item.quote && <p className="text-amber-600 text-sm italic mt-2">— {item.quote}</p>}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                <button onClick={() => togglePublish(item)}
                  className="px-2 py-1 rounded-lg text-xs hover:bg-white/5 text-gray-400 hover:text-emerald-400 transition-colors">
                  {item.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => openEdit(item)}
                  className="px-2 py-1 rounded-lg text-xs hover:bg-white/5 text-gray-400 hover:text-blue-400 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="px-2 py-1 rounded-lg text-xs hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Testimonial</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
                    <input value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })}
                      placeholder="Author name" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                    <input value={form.author_role} onChange={e => setForm({ ...form, author_role: e.target.value })}
                      placeholder="e.g. Donor, Volunteer" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Testimonial *</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={4} placeholder="Enter testimonial content"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <select value={form.testimonial_type} onChange={e => setForm({ ...form, testimonial_type: e.target.value as TestimonialType })}
                      title="Testimonial type" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      {TESTIMONIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                      placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Avatar URL</label>
                  <input value={form.avatar_url || ''} onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quote (optional)</label>
                  <input value={form.quote || ''} onChange={e => setForm({ ...form, quote: e.target.value })}
                    placeholder="Optional quote" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">{editing ? 'Update' : 'Create'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
