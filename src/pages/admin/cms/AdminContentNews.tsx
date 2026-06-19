import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAllNews, createNewsWithAuthor, updateNewsWithAuthor } from '../../../services/content'
import type { News } from '../../../types/database'

const NEWS_CATEGORIES = ['updates', 'events', 'impact'] as const
const NEWS_TAGS = ['Sponsorship', 'Education', 'Community', 'Events', 'Achievements', 'General']

type NewsCategory = typeof NEWS_CATEGORIES[number]

type NewsForm = Omit<News, 'id' | 'created_at' | 'updated_at' | 'updated_by'>

export function AdminContentNews() {
  const [articles, setArticles] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<News | null>(null)

  const [form, setForm] = useState<NewsForm>({
    title: '', slug: '', category: 'updates',
    content: '', excerpt: '', image_url: '',
    tags: [], published: false, published_at: '',
  })

  useEffect(() => { loadArticles() }, [])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const data = await getAllNews(true)
      setArticles(data)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', slug: '', category: 'updates', content: '', excerpt: '', image_url: '', tags: [], published: false, published_at: '' })
    setShowModal(true)
  }

  const openEdit = (article: News) => {
    setEditing(article)
    setForm({
      title: article.title, slug: article.slug || '', category: article.category,
      content: article.content, excerpt: article.excerpt, image_url: article.image_url || '',
      tags: article.tags || [], published: article.published, published_at: article.published_at,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    try {
      if (editing) {
        await updateNewsWithAuthor(editing.id, form)
        toast.success('Article updated')
      } else {
        await createNewsWithAuthor(form)
        toast.success('Article created')
      }
      setShowModal(false)
      loadArticles()
    } catch {
      toast.error('Failed to save article')
    }
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }))
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Announcements</h1>
          <p className="text-gray-500 mt-1">Create, edit, publish news articles with rich content & images</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          New Article
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No articles yet</div>
        ) : (
          articles.map((article) => (
            <motion.div key={article.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
              <div className="flex">
                {article.image_url && (
                  <div className="w-48 flex-shrink-0 hidden sm:block">
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">{article.category}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${article.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      {article.excerpt && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {article.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(article)}
                        className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                        Edit
                      </button>
                    </div>
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
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Article</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as NewsCategory })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50">
                      {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
                    <button onClick={() => setForm({ ...form, published: !form.published })}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm border transition-colors ${form.published ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                      {form.published ? 'Published' : 'Draft'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={8}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50 resize-vertical font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                  <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-amber-500/50" />
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="mt-2 h-32 w-full object-cover rounded-lg" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${form.tags.includes(tag) ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">{editing ? 'Update' : 'Create Article'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
