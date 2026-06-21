import { useEffect, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { getGalleryItems, updateGalleryItem, deleteGalleryItem } from '../../services/gallery'
import type { GalleryItem } from '../../types/database'

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const data = await getGalleryItems()
      setItems(data)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { is_published: !item.is_published })
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i))
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteGalleryItem(id)
        setItems(items.filter(i => i.id !== id))
      } catch (error) {
        console.error('Error deleting gallery item:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage photos, videos, and testimonials</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
          Add Item
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No gallery items found</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} variant="bordered" className="overflow-hidden">
              {item.type === 'photo' && (
                <img src={item.url} alt={item.title} className="w-full h-40 object-cover" />
              )}
              {item.type === 'video' && (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Video</span>
                </div>
              )}
              {item.type === 'testimonial' && (
                <div className="p-4 bg-amber-50 h-40 flex items-center">
                  <p className="text-sm text-gray-700 italic line-clamp-3">"{item.url}"</p>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'photo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.type === 'video' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-purple-50 text-purple-700 border-purple-200'} border`}>{item.type}</span>
                  </div>
                </div>
                {item.caption && (
                  <p className="text-sm text-gray-500 mb-3 truncate">{item.caption}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(item.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublishToggle(item)}
                      className="hover:text-emerald-600"
                      title={item.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {item.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="hover:text-amber-600" aria-label="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
