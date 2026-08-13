import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getStudentStories, createStudentStory, updateStudentStory, deleteStudentStory } from '../../../services/content'
import type { StudentStory } from '../../../types/database'
import { ListSkeleton } from '../../../components/ui/LoadingSkeleton'
import { useConfirm } from '../../../context/ConfirmContext'

export function AdminStudentStories() {
  const { confirm } = useConfirm()
  const [stories, setStories] = useState<StudentStory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<StudentStory | null>(null)

  const [form, setForm] = useState({
    title: '', title_ne: '', student_name: '', student_name_ne: '', content: '', content_ne: '', image_url: '',
    quote: '', quote_ne: '', achievements: [] as string[], achievements_ne: [] as string[], is_published: false, featured: false,
  })
  const [achievementInput, setAchievementInput] = useState('')

  useEffect(() => { loadStories() }, [])

  const loadStories = async () => {
    setLoading(true)
    try {
      const data = await getStudentStories()
      setStories(data)
    } catch {
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', title_ne: '', student_name: '', student_name_ne: '', content: '', content_ne: '', image_url: '', quote: '', quote_ne: '', achievements: [], achievements_ne: [], is_published: false, featured: false })
    setShowModal(true)
  }

  const openEdit = (s: StudentStory) => {
    setEditing(s)
    setForm({
      title: s.title, title_ne: s.title_ne || '', student_name: s.student_name, student_name_ne: s.student_name_ne || '', content: s.content, content_ne: s.content_ne || '',
      image_url: s.image_url || '', quote: s.quote || '', quote_ne: s.quote_ne || '',
      achievements: s.achievements || [], achievements_ne: s.achievements_ne || [], is_published: s.is_published, featured: s.featured,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.student_name || !form.content) {
      toast.error('Title, student name, and story content are required')
      return
    }
    try {
      if (editing) {
        await updateStudentStory(editing.id, form)
        toast.success('Story updated')
      } else {
        await createStudentStory({ ...form, published_at: form.is_published ? new Date().toISOString() : null })
        toast.success('Story created')
      }
      setShowModal(false)
      loadStories()
    } catch {
      toast.error('Failed to save story')
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this story?'))) return
    try {
      await deleteStudentStory(id)
      setStories(stories.filter(s => s.id !== id))
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setForm({ ...form, achievements: [...form.achievements, achievementInput.trim()] })
      setAchievementInput('')
    }
  }

  const removeAchievement = (idx: number) => {
    setForm({ ...form, achievements: form.achievements.filter((_, i) => i !== idx) })
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Stories</h1>
          <p className="text-gray-500 mt-1">Share success stories, achievements & sponsorship journeys</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          New Story
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <ListSkeleton rows={4} />
        ) : stories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No stories yet</div>
        ) : (
          stories.map((story) => (
            <motion.div key={story.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
              {story.image_url && (
                <div className="h-40 overflow-hidden">
                  <img src={story.image_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{story.title}</h3>
                    <p className="text-sm text-amber-400">{story.student_name}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${story.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {story.is_published ? 'Published' : 'Draft'}
                    </span>
                    {story.featured && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">Featured</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{story.content}</p>
                {story.quote && <p className="text-sm text-amber-400/80 italic mt-2">"{story.quote}"</p>}
                {story.achievements && story.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {story.achievements.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">{a}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {formatDate(story.created_at)}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(story)}
                      className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-blue-600">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(story.id)}
                      className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
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
              className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Student Story</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story Title *</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. A Journey of Hope" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                    <input value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })}
                      placeholder="Full name" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story Content *</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={6} placeholder="Write the student's story..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50 resize-vertical" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspirational Quote</label>
                    <input value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })}
                      placeholder="An inspiring quote..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                  <div className="flex gap-2 mb-2">
                    <input value={achievementInput} onChange={e => setAchievementInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50"
                      placeholder="Add an achievement..." />
                    <button onClick={addAchievement}
                      className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm hover:bg-amber-200">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.achievements.map((a, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                        {a}
                        <button onClick={() => removeAchievement(i)} className="hover:text-red-400 ml-1 text-xs">
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">{editing ? 'Update' : 'Create Story'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
