import { useState, useRef } from 'react'
import { getMedia, uploadMedia } from '../../services/content'
import toast from 'react-hot-toast'
import type { MediaItem } from '../../types/database'

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const openPicker = async () => {
    setShowPicker(true)
    setLoading(true)
    try {
      const data = await getMedia()
      setMedia(data.filter(m => m.mime_type?.startsWith('image/')))
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const mediaItem = await uploadMedia(file, file.name)
      setMedia(prev => [mediaItem, ...prev])
      onChange(mediaItem.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>}
      <div className="space-y-2">
        {value && (
          <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img src={value} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Image URL..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
          <button
            type="button"
            onClick={openPicker}
            className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
            title="Browse Media Library"
          >
            Browse
          </button>
        </div>
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {uploading ? 'Uploading...' : 'Upload new image'}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Select Image</h3>
              <button onClick={() => setShowPicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">No images found. Upload one above.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {media.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onChange(item.url); setShowPicker(false) }}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:border-amber-500 ${value === item.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent'}`}
                    >
                      <img src={item.url} alt={item.file_name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
