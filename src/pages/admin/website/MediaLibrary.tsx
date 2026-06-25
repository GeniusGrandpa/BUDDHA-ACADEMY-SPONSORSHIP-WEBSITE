import { useState, useEffect } from 'react'
import { getMedia, uploadMedia, deleteMedia } from '../../../services/content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'
import type { MediaItem } from '../../../types/database'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')

  useEffect(() => { loadMedia() }, [])

  const loadMedia = async () => {
    try {
      const data = await getMedia()
      setItems(data)
    } catch {
      toast.error('Failed to load media library')
    } finally {
      setLoading(false)
    }
  }

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
    try {
      await deleteMedia(id, url)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const filtered = search ? items.filter(i => i.file_name.toLowerCase().includes(search.toLowerCase())) : items

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
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'grid' ? 'Grid' : 'List'}
              </button>
            ))}
          </div>
          <label className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
            {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">{search ? 'No results found' : 'No media uploaded yet'}</p>
          <p className="text-gray-400 text-sm mt-1">{search ? 'Try a different search term' : 'Upload your first file to get started'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                {item.mime_type?.startsWith('image/') ? (
                  <img src={item.url} alt={item.file_name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-700 truncate">{item.file_name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : ''}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id, item.url)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.mime_type?.startsWith('image/') ? (
                          <img src={item.url} alt={item.file_name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">{item.file_name}</p>
                        <p className="text-xs text-gray-400">{item.url}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.mime_type?.split('/').pop() || 'unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(item.id, item.url)} className="text-xs text-red-500 hover:text-red-600">Delete</button>
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
