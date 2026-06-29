import { useState, useEffect, useCallback } from 'react'
import { getMedia, uploadMedia, deleteMedia, updateMedia } from '../../../services/content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { MediaItem } from '../../../types/database'
import toast from 'react-hot-toast'
import { Search, Grid3X3, List, Upload, Trash2, X, Edit3, Check } from 'lucide-react'

type ViewMode = 'grid' | 'list'

interface EditingMedia {
  id: string
  altText: string
  caption: string
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditingMedia | null>(null)

  const loadMedia = useCallback(async () => {
    try {
      const data = await getMedia()
      setItems(data)
    } catch {
      toast.error('Failed to load media library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMedia() }, [loadMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const media = await uploadMedia(file, file.name)
      setItems(prev => [media, ...prev])
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await deleteMedia(id, url)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleUpdateMetadata = async () => {
    if (!editing) return
    try {
      await updateMedia(editing.id, { alt_text: editing.altText } as Partial<MediaItem>)
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, alt_text: editing.altText } : i))
      toast.success('Metadata updated')
      setEditing(null)
    } catch {
      toast.error('Failed to update')
    }
  }

  const filtered = search
    ? items.filter(i => i.file_name.toLowerCase().includes(search.toLowerCase()) || (i.alt_text || '').toLowerCase().includes(search.toLowerCase()))
    : items

  if (loading) return <FormSkeleton fields={6} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage images, documents, and videos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['grid', 'list'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {v === 'grid' ? 'Grid' : 'List'}
              </button>
            ))}
          </div>
          <label className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
            {uploading ? (
              <>Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload File</>
            )}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*,.pdf,.mp4,.webm" />
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files by name or alt text..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'No media uploaded yet'}
          message={search ? 'Try a different search term' : 'Upload your first image or file to get started'}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                {item.mime_type?.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-300">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs mt-1">{item.mime_type?.split('/').pop() || 'file'}</span>
                  </div>
                )}
                {editing?.id === item.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-3 mx-2 w-full max-w-[200px] space-y-2">
                      <input
                        type="text"
                        value={editing.altText}
                        onChange={e => setEditing({ ...editing, altText: e.target.value })}
                        placeholder="Alt text"
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={handleUpdateMetadata} className="flex-1 px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">
                          <Check className="w-3 h-3 mx-auto" />
                        </button>
                        <button onClick={() => setEditing(null)} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-700 truncate font-medium">{item.file_name}</p>
                {item.alt_text && <p className="text-[10px] text-gray-400 truncate mt-0.5">Alt: {item.alt_text}</p>}
                <p className="text-[10px] text-gray-400">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : ''}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing({ id: item.id, altText: item.alt_text || '', caption: '' })}
                  className="p-1.5 rounded-full bg-white text-gray-600 shadow hover:bg-gray-100"
                  title="Edit alt text"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.url)}
                  className="p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alt Text</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.mime_type?.startsWith('image/') ? (
                          <img src={item.url} alt={item.alt_text || ''} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{item.file_name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.mime_type?.split('/').pop() || 'unknown'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                  <td className="px-4 py-3">
                    {editing?.id === item.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editing.altText}
                          onChange={e => setEditing({ ...editing, altText: e.target.value })}
                          className="w-32 px-2 py-1 text-xs border border-gray-200 rounded"
                          autoFocus
                        />
                        <button onClick={handleUpdateMetadata} className="p-1 text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditing(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">{item.alt_text || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing({ id: item.id, altText: item.alt_text || '', caption: '' })}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.url)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
