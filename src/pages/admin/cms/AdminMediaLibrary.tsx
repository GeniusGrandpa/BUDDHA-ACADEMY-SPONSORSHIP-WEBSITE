import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../../context/AuthContext'
import { getMedia, uploadMedia, updateMedia, deleteMedia } from '../../../services/content'
import type { MediaItem } from '../../../types/database'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp',
  'video/mp4', 'video/webm', 'video/ogg',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed',
]

function getFileCategory(mime: string | null): { label: string; color: string; icon: string } {
  if (!mime) return { label: 'File', color: 'bg-gray-100 text-gray-600', icon: '📄' }
  if (mime.startsWith('image/')) return { label: 'Image', color: 'bg-orange-50 text-orange-600', icon: '🖼' }
  if (mime.startsWith('video/')) return { label: 'Video', color: 'bg-blue-50 text-blue-600', icon: '🎬' }
  if (mime === 'application/pdf') return { label: 'PDF', color: 'bg-red-50 text-red-600', icon: '📕' }
  if (mime.includes('word') || mime.includes('document')) return { label: 'Doc', color: 'bg-blue-50 text-blue-600', icon: '📝' }
  if (mime.includes('excel') || mime.includes('spreadsheet')) return { label: 'Sheet', color: 'bg-green-50 text-green-600', icon: '📊' }
  if (mime.includes('presentation') || mime.includes('powerpoint')) return { label: 'Slides', color: 'bg-orange-50 text-orange-600', icon: '📽' }
  if (mime.startsWith('text/')) return { label: 'Text', color: 'bg-gray-100 text-gray-600', icon: '📃' }
  if (mime.includes('zip') || mime.includes('rar')) return { label: 'Archive', color: 'bg-gray-100 text-gray-600', icon: '📦' }
  return { label: 'File', color: 'bg-gray-100 text-gray-600', icon: '📄' }
}

export function AdminMediaLibrary() {
  const { profile } = useAuth()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'unpublished'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userRole = profile?.role as string | undefined
  const canTogglePublish = !!(userRole && (userRole === 'super_admin' || userRole === 'admin'))
  const canDelete = canTogglePublish

  useEffect(() => { loadMedia() }, [])

  const loadMedia = async () => {
    try {
      const data = await getMedia()
      setMedia(data)
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = useMemo(() => {
    let items = media
    if (filterPublished === 'published') items = items.filter(m => m.is_published)
    else if (filterPublished === 'unpublished') items = items.filter(m => !m.is_published)
    if (filterType === 'image') items = items.filter(m => m.mime_type?.startsWith('image/'))
    else if (filterType === 'video') items = items.filter(m => m.mime_type?.startsWith('video/'))
    else if (filterType === 'document') items = items.filter(m =>
      m.mime_type?.includes('pdf') || m.mime_type?.includes('word') || m.mime_type?.includes('document') ||
      m.mime_type?.includes('excel') || m.mime_type?.includes('spreadsheet') || m.mime_type?.includes('presentation') ||
      m.mime_type?.includes('powerpoint') || m.mime_type?.startsWith('text/')
    )
    else if (filterType === 'archive') items = items.filter(m =>
      m.mime_type?.includes('zip') || m.mime_type?.includes('rar')
    )
    return items
  }, [media, filterPublished, filterType])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        continue
      }
      try {
        await uploadMedia(file)
        successCount++
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded`)
      loadMedia()
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const togglePublish = async (item: MediaItem) => {
    const original = media
    const updated = media.map(m => m.id === item.id ? { ...m, is_published: !m.is_published } : m)
    setMedia(updated)
    try {
      await updateMedia(item.id, { is_published: !item.is_published })
      toast.success(item.is_published ? 'File unpublished' : 'File published')
    } catch {
      setMedia(original)
      toast.error('Failed to update publish status')
    }
  }

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete ${item.file_name}?`)) return
    const original = media
    const updated = media.filter(m => m.id !== item.id)
    setMedia(updated)
    try {
      await deleteMedia(item.id, item.url)
      toast.success('Media deleted')
    } catch {
      setMedia(original)
      toast.error('Failed to delete')
    }
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('URL copied to clipboard')
  }

  const isImage = (mime: string | null) => mime?.startsWith('image/')

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage images, documents, and files</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : null}
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as typeof filterPublished)}
          title="Filter by publish status"
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-200 outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          title="Filter by file type"
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-200 outline-none"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="archive">Archives</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filteredMedia.length} item(s)</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No media found</p>
            <p className="text-sm text-gray-600 mt-1">Upload files or adjust filters</p>
          </div>
        ) : (
          filteredMedia.map((item) => {
            const cat = getFileCategory(item.mime_type)
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group bg-white border rounded-xl overflow-hidden hover:border-amber-500/30 transition-all ${!item.is_published ? 'opacity-60 border-dashed border-gray-300' : 'border-gray-100'}`}
              >
                <div className="relative aspect-square bg-stone-100">
                  {isImage(item.mime_type) ? (
                    <img src={item.url} alt={item.alt_text || item.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
                    </div>
                  )}
                  {!item.is_published && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">
                      Draft
                    </div>
                  )}
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => copyUrl(item.url, item.id)}
                      className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] text-white transition-colors"
                    >
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </button>
                    {canTogglePublish && (
                      <button
                        onClick={() => togglePublish(item)}
                        className={`px-2 py-1 rounded text-[10px] text-white transition-colors ${item.is_published ? 'bg-amber-500/40 hover:bg-amber-500/60' : 'bg-emerald-500/40 hover:bg-emerald-500/60'}`}
                      >
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-[10px] text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-gray-700 truncate" title={item.file_name}>{item.file_name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-400">{formatSize(item.file_size)}</span>
                    {!item.is_published && <span className="text-[10px] text-amber-600 font-medium">Draft</span>}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}