import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { Search, Grid3X3, List, Upload, Trash2, X, Edit3, Check, Copy, Image, Loader2 } from 'lucide-react'
import { fetchMedia, updateMedia, deleteMedia, uploadImage } from '../../../services/website-builder'
import { DashboardSkeleton } from '../../../components/ui/LoadingSkeleton'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useDebounce } from '../../../hooks/useDebounce'
import type { WebsiteMedia } from '../../../types/website-builder'

type ViewMode = 'grid' | 'list'
const PER_PAGE = 50

export function MediaLibrary() {
  const [items, setItems] = useState<WebsiteMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [editingAlt, setEditingAlt] = useState<{ id: string; alt: string } | null>(null)
  const debouncedSearch = useDebounce(search, 300)
  const loadMedia = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    try {
      const data = await fetchMedia(pageNum, PER_PAGE)
      if (append) {
        setItems(prev => [...prev, ...data])
      } else {
        setItems(data)
      }
      setHasMore(data.length === PER_PAGE)
      setPage(pageNum)
    } catch {
      toast.error('Failed to load media library')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMedia(page + 1, true)
      }
    }, { rootMargin: '200px' })
    observerRef.current.observe(node)
  }, [hasMore, loadingMore, page, loadMedia])

  useEffect(() => { loadMedia(1) }, [loadMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB')
      return
    }
    setUploading(true)
    try {
      const media = await uploadImage(file)
      setItems(prev => [media, ...prev])
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleSaveAltText = async () => {
    if (!editingAlt) return
    try {
      await updateMedia(editingAlt.id, { alt_text: editingAlt.alt })
      setItems(prev => prev.map(i => i.id === editingAlt.id ? { ...i, alt_text: editingAlt.alt } : i))
      toast.success('Alt text updated')
      setEditingAlt(null)
    } catch {
      toast.error('Failed to update')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard')
    })
  }

  const filtered = debouncedSearch
    ? items.filter(i => i.file_name.toLowerCase().includes(debouncedSearch.toLowerCase()) || i.alt_text?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : items

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage website images</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['grid', 'list'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          <label className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
            {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Image</>}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by name or alt text..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={debouncedSearch ? 'No results found' : 'No images uploaded'} message={debouncedSearch ? 'Try a different search term' : 'Upload your first image to get started'} icon={<Image className="w-12 h-12" />} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-gray-50 relative">
                <img src={item.file_url} alt={item.alt_text || item.file_name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-700 truncate font-medium">{item.file_name}</p>
                {item.alt_text && <p className="text-[10px] text-gray-400 truncate mt-0.5">Alt: {item.alt_text}</p>}
                <p className="text-[10px] text-gray-400">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : ''}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingAlt({ id: item.id, alt: item.alt_text || '' })} className="p-1.5 rounded-full bg-white text-gray-600 shadow hover:bg-gray-100" title="Edit alt text">
                  <Edit3 className="w-3 h-3" />
                </button>
                <button onClick={() => copyUrl(item.file_url)} className="p-1.5 rounded-full bg-white text-gray-600 shadow hover:bg-gray-100" title="Copy URL">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => { if (confirm('Delete this image?')) handleDelete(item.id) }} className="p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {editingAlt?.id === item.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10" onClick={() => setEditingAlt(null)}>
                  <div className="bg-white rounded-lg p-3 mx-2 w-full max-w-[200px] space-y-2" onClick={e => e.stopPropagation()}>
                    <input type="text" value={editingAlt.alt} onChange={e => setEditingAlt({ ...editingAlt, alt: e.target.value })} placeholder="Alt text" className="w-full px-2 py-1 text-xs border border-gray-200 rounded" autoFocus />
                    <div className="flex gap-1">
                      <button onClick={handleSaveAltText} className="flex-1 px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"><Check className="w-3 h-3 mx-auto" /></button>
                      <button onClick={() => setEditingAlt(null)} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X className="w-3 h-3 mx-auto" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={sentinelCallbackRef} className="col-span-full flex items-center justify-center py-4">
            {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
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
                      <div className="w-10 h-10 rounded-lg bg-gray-50 shrink-0 overflow-hidden">
                        <img src={item.file_url} alt={item.alt_text || ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{item.file_name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[250px]">{item.file_url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                  <td className="px-4 py-3">
                    {editingAlt?.id === item.id ? (
                      <div className="flex gap-1">
                        <input type="text" value={editingAlt.alt} onChange={e => setEditingAlt({ ...editingAlt, alt: e.target.value })} className="w-32 px-2 py-1 text-xs border border-gray-200 rounded" autoFocus />
                        <button onClick={handleSaveAltText} className="p-1 text-green-600"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingAlt(null)} className="p-1 text-gray-400"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">{item.alt_text || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyUrl(item.file_url)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Copy URL"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingAlt({ id: item.id, alt: item.alt_text || '' })} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (confirm('Delete this image?')) handleDelete(item.id) }} className="p-1.5 rounded hover:bg-red-50 text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <div ref={sentinelCallbackRef}>
                    {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
