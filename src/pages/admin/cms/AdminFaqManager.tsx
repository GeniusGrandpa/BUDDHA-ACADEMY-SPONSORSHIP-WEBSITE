import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import toast from 'react-hot-toast'
import { getFaqs, createFaq, updateFaq, deleteFaq, reorderFaqs } from '../../../services/content'
import type { Faq } from '../../../types/database'
import { ListSkeleton } from '../../../components/ui/LoadingSkeleton'

const FAQ_CATEGORIES = ['Sponsorship', 'Donations', 'General', 'Volunteering', 'Partnerships']

export function AdminFaqManager() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [filterCat, setFilterCat] = useState('all')

const [form, setForm] = useState({ question: '', answer: '', category: 'General', is_published: true, sort_order: 0 })

  const loadFaqs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFaqs()
      setFaqs(filterCat === 'all' ? data : data.filter(f => f.category === filterCat))
    } catch {
      toast.error('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }, [filterCat])

   useEffect(() => { loadFaqs() }, [loadFaqs])

  const openCreate = () => {
    setEditing(null)
    setForm({ question: '', answer: '', category: 'General', is_published: true, sort_order: faqs.length })
    setShowModal(true)
  }

  const openEdit = (faq: Faq) => {
    setEditing(faq)
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, is_published: faq.is_published, sort_order: faq.sort_order })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error('Question and answer are required')
      return
    }
    try {
      if (editing) {
        await updateFaq(editing.id, form)
        toast.success('FAQ updated')
      } else {
        await createFaq(form)
        toast.success('FAQ created')
      }
      setShowModal(false)
      loadFaqs()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return
    try {
      await deleteFaq(id)
      setFaqs(faqs.filter(f => f.id !== id))
      toast.success('FAQ deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleReorder = async (reordered: Faq[]) => {
    setFaqs(reordered)
    const updates = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }))
    await reorderFaqs(updates)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-500 mt-1">Create, edit, reorder & categorize frequently asked questions</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add FAQ
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterCat === 'all' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>All</button>
        {FAQ_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterCat === cat ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{cat}</button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No FAQs found</div>
      ) : (
        <Reorder.Group axis="y" values={faqs} onReorder={handleReorder} className="space-y-2">
          {faqs.map((faq) => (
            <Reorder.Item key={faq.id} value={faq}>
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-500/30 transition-all cursor-grab active:cursor-grabbing">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{faq.question}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${faq.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {faq.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">{faq.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(faq)}
                      className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(faq.id)}
                      className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} FAQ</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Question *</label>
                  <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
                    rows={2} placeholder="Enter question"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Answer *</label>
                  <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })}
                    rows={5} placeholder="Enter answer"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-vertical" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    title="Category" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                    {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">{editing ? 'Update' : 'Create FAQ'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
