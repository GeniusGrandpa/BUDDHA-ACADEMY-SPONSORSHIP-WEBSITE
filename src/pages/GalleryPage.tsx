import { useEffect, useState } from 'react'
import { Play, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui/Tabs'
import { getGalleryItems } from '../services/gallery'
import { getVideos } from '../services/content'
import { getPageHeader, getSiteImage } from '../services/cms-content'
import { useCmsStrings } from '../context/CmsStringsContext'
import { Tr } from '../components/Translated'
import type { GalleryItem, Video } from '../types/database'
import type { PageHeader } from '../types/cms-content'
import { GallerySkeleton } from '../components/ui/LoadingSkeleton'

type GalleryVideo = GalleryItem & { video_type?: string | null }

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

function getVideoEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | 'unknown'; embedUrl: string } {
  const youtubeId = getYoutubeId(url)
  if (youtubeId) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1` }
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }
  }
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return { type: 'direct', embedUrl: url }
  }
  return { type: 'unknown', embedUrl: url }
}

export function GalleryPage() {
  const { t } = useCmsStrings()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
  const [pageHeader, setPageHeader] = useState<PageHeader | null>(null)
  const [fallbackImage, setFallbackImage] = useState('')

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const [galleryData, videoData, header, fallbackImg] = await Promise.all([
        getGalleryItems({ publishedOnly: true }),
        getVideos(),
        getPageHeader('gallery'),
        getSiteImage('gallery_fallback'),
      ])
      if (header) setPageHeader(header)
      if (fallbackImg?.image_url) setFallbackImage(fallbackImg.image_url)
      const mappedVideos: GalleryVideo[] = videoData.map((v: Video) => {
        const ytThumb = getYoutubeThumbnail(v.url)
        return {
          id: v.id,
          type: 'video' as const,
          title: v.title,
          caption: v.description || null,
          url: v.url,
          thumbnail_url: v.thumbnail_url && v.thumbnail_url !== v.url && !v.thumbnail_url.match(/^https?:\/\/(youtu\.be|www\.youtube\.com)/) ? v.thumbnail_url : ytThumb,
          author: null,
          category: v.category || 'General',
          is_featured: v.is_featured,
          is_published: true,
          uploaded_by: v.uploaded_by,
          created_at: v.created_at,
          updated_at: v.updated_at,
          video_type: v.video_type,
        }
      })
      setItems([...galleryData, ...mappedVideos])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'all', label: t('gallery_tab_all'), count: items.length },
    { id: 'photo', label: t('gallery_tab_photos'), count: items.filter(i => i.type === 'photo').length },
    { id: 'video', label: t('gallery_tab_videos'), count: items.filter(i => i.type === 'video').length },
    { id: 'testimonial', label: t('gallery_tab_testimonials'), count: items.filter(i => i.type === 'testimonial').length },
  ]

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter(i => i.type === activeTab)

  return (
    <div>
      {pageHeader && (
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                <Tr text={pageHeader.title} />
              </h1>
              {pageHeader.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-gray-600">
                  <Tr text={pageHeader.subtitle} />
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6 sm:mb-8" />

          {loading ? (
            <GallerySkeleton />
          ) : filteredItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredItems.map((item) => (
                <Card key={item.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.type === 'photo' && (
                    <>
                      <img
                        src={brokenImages.has(item.id) ? fallbackImage || '' : item.url || ''}
                        alt={item.title}
                        className="w-full h-56 object-cover cursor-pointer"
                        loading="lazy" decoding="async"
                        onClick={() => setSelectedImage(brokenImages.has(item.id) ? item.url : item.url)}
                        onError={() => setBrokenImages(prev => new Set(prev).add(item.id))}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1"><Tr text={item.title} /></h3>
                        {item.caption && <p className="text-sm text-gray-600"><Tr text={item.caption} /></p>}
                      </div>
                    </>
                  )}

                  {item.type === 'video' && (
                    <div className="relative">
                      {item.thumbnail_url && !brokenImages.has(item.id) ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy" decoding="async"
                        />
                      ) : (
                        <div className="w-full h-56 bg-stone-100 flex items-center justify-center">
                          <Play className="w-12 h-12 text-stone-300" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-stone-900/30 cursor-pointer"
                        onClick={() => setSelectedVideo(item)}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                          <Play className="w-8 h-8 text-amber-600 ml-1" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1"><Tr text={item.title} /></h3>
                        {item.caption && <p className="text-sm text-gray-600"><Tr text={item.caption} /></p>}
                      </div>
                    </div>
                  )}

                  {item.type === 'testimonial' && (
                    <div className="p-6 bg-amber-50 h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {item.author?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.author}</h3>
                        </div>
                      </div>
                      <p className="text-gray-700 italic leading-relaxed">
                        "<Tr text={item.url} />"
                      </p>
                      {item.caption && (
                        <p className="text-sm text-gray-500 mt-4"><Tr text={item.caption} /></p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('gallery_empty')}</p>
            </div>
          )}
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-stone-950/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            aria-label={t('gallery_close_image')}
            className="absolute top-4 right-4 text-white text-2xl hover:text-amber-400 transition-colors"
          >
            &times;
          </button>
              <img
                src={selectedImage}
                alt="Gallery image"
                className="max-w-full max-h-[80vh] object-contain"
                loading="lazy" decoding="async"
              />
        </div>
      )}

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-stone-950/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            aria-label={t('gallery_close_video')}
            className="absolute top-4 right-4 z-10 text-white hover:text-amber-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const videoType = selectedVideo.video_type
              if (videoType === 'upload') {
                return (
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    className="w-full h-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              }
              const { type, embedUrl } = getVideoEmbedUrl(selectedVideo.url)
              if (type === 'direct') {
                return (
                  <video
                    src={embedUrl}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              }
              return (
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                  {type === 'youtube' && (
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors z-10"
                      >
                        {t('gallery_open_youtube')}
                      </a>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
