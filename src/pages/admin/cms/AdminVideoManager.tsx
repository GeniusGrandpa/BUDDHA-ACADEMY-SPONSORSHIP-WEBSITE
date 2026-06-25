import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getVideos, createVideo, updateVideo, deleteVideo } from '../../../services/content'
import type { Video } from '../../../types/database'
import { GallerySkeleton } from '../../../components/ui/LoadingSkeleton'

const VIDEO_CATEGORIES = [
  'School Events', 'Community Activities', 'Student Stories', 'Sponsorship Impact', 'General',
]

type VideoType = 'youtube' | 'upload' | 'vimeo'

export function AdminVideoManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)
  const [filterFeatured, setFilterFeatured] = useState(false)

const [form, setForm] = useState({
     title: '', url: '', video_type: 'youtube' as VideoType,
     thumbnail_url: '', description: '', category: 'General', is_featured: false,
   })

  const loadVideos = useCallback(async (featured?: boolean) => {
    setLoading(true)
    try {
      const data = await getVideos(featured ?? filterFeatured)
      setVideos(data)
    } catch {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [filterFeatured])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', url: '', video_type: 'youtube', thumbnail_url: '', description: '', category: 'General', is_featured: false })
    setShowModal(true)
  }

  const openEdit = (v: Video) => {
    setEditing(v)
    setForm({
      title: v.title, url: v.url, video_type: v.video_type,
      thumbnail_url: v.thumbnail_url || '', description: v.description || '',
      category: v.category, is_featured: v.is_featured,
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
        await updateVideo(editing.id, form as unknown as Partial<Video>)
        toast.success('Video updated')
      } else {
        await createVideo(form as unknown as Omit<Video, 'id' | 'created_at' | 'updated_at'>)
        toast.success('Video added')
      }
      setShowModal(false)
      loadVideos()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      await deleteVideo(id)
      toast.success('Video deleted')
      loadVideos()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleFeatured = async (v: Video) => {
    const original = videos
    const updated = videos.map(i => i.id === v.id ? { ...i, is_featured: !i.is_featured } : i)
    setVideos(updated)
    try {
      await updateVideo(v.id, { is_featured: !v.is_featured })
      toast.success(v.is_featured ? 'Removed from featured' : 'Marked as featured')
    } catch {
      setVideos(original)
      toast.error('Failed to update')
    }
  }

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    return match ? match[1] : null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-500 mt-1">Manage YouTube embeds, thumbnails & featured videos</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add Video
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setFilterFeatured(false); loadVideos(false) }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filterFeatured ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All Videos
        </button>
        <button onClick={() => { setFilterFeatured(true); loadVideos(true) }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterFeatured ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Featured Only
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <GallerySkeleton />
        ) : videos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No videos found</div>
        ) : (
          videos.map((v) => {
            const ytId = getYoutubeId(v.url)
            return (
              <motion.div key={v.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
                <div className="relative aspect-video bg-stone-100">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                  ) : ytId ? (
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No thumbnail
                    </div>
                  )}
                  {v.is_featured && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-xs font-medium text-white">Featured</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{v.title}</h3>
                      {v.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{v.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-xs text-amber-700">{v.category}</span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleFeatured(v)} className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-amber-600">
                        {v.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => openEdit(v)} className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-blue-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="px-2 py-1 rounded-lg text-xs hover:bg-gray-100 text-gray-500 hover:text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Video</h2>
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm text-gray-500">
                  Close
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Video title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Video URL *</label>
                  <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Thumbnail URL</label>
                  <input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                    placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Enter description"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <select value={form.video_type} onChange={e => setForm({ ...form, video_type: e.target.value as VideoType })}
                      title="Video type" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="upload">Upload</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      title="Category" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50">
                      {VIDEO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white">
                  {editing ? 'Update' : 'Add Video'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
