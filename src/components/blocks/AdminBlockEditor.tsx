import { useState, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getPageBlocks,
  createPageBlock,
  updatePageBlock,
  deletePageBlock,
  duplicatePageBlock,
  reorderPageBlocks,
  toggleBlockVisibility,
  toggleBlockDraft,
} from '../../services/pageBlocks'
import type { PageBlockType, PageBlockDB } from '../../types/cms'

const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  hero: 'Hero Banner',
  text: 'Text',
  rich_content: 'Rich Content',
  image: 'Image',
  gallery: 'Gallery',
  cta: 'Call to Action',
  donation: 'Donation',
  student_cards: 'Student Cards',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  stats: 'Statistics',
  timeline: 'Timeline',
  video: 'Video',
  sponsors: 'Sponsors',
  partners: 'Partners',
  announcements: 'Announcements',
  custom_section: 'Custom Section',
}

const BLOCK_ICONS: Record<PageBlockType, string> = {
  hero: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  text: 'M4 6h16M4 12h16M4 18h16',
  rich_content: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 12h18M5 6h14M5 10h14M5 14h14M5 18h14',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  gallery: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  cta: 'M13 10V3L4 14h7v7l9-11h-7z',
  donation: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  student_cards: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  testimonials: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  faq: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  stats: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  timeline: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  sponsors: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  partners: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  announcements: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  custom_section: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
}

const DEFAULT_BLOCK_TEMPLATES: Record<PageBlockType, Record<string, unknown>> = {
  hero: { preTitle: '', title: '', highlight: '', description: '', primaryText: '', primaryLink: '', secondaryText: '', secondaryLink: '', background_image: '' },
  text: { title: '', subtitle: '', body: '' },
  rich_content: { html: '' },
  image: { image_url: '', alt_text: '', caption: '' },
  gallery: { title: '', images: [] },
  cta: { title: '', description: '', primaryText: '', primaryLink: '', secondaryText: '', secondaryLink: '' },
  donation: { title: '', description: '', button_text: 'Donate Now', donate_link: '/donate' },
  student_cards: { title: '', description: '', items: [] },
  testimonials: { title: '', description: '', items: [] },
  faq: { title: '', items: [] },
  stats: { title: '', items: [] },
  timeline: { title: '', description: '', items: [] },
  video: { title: '', video_url: '', thumbnail_url: '' },
  sponsors: { title: '', items: [] },
  partners: { title: '', items: [] },
  announcements: { title: '', items: [] },
  custom_section: { html: '' },
}

interface AdminBlockEditorProps {
  slug: string
  pageId: string
}

export function AdminBlockEditor({ slug, pageId }: AdminBlockEditorProps) {
  const [blocks, setBlocks] = useState<PageBlockDB[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPageBlocks(slug)
      setBlocks(data)
    } catch {
      toast.error('Failed to load blocks')
    } finally {
      setLoading(false)
    }
  }, [slug])

  const handleReorder = async (reordered: PageBlockDB[]) => {
    setBlocks(reordered)
    const orderedIds = reordered.map(b => b.id)
    try {
      await reorderPageBlocks(pageId, orderedIds)
    } catch {
      toast.error('Failed to reorder')
      load()
    }
  }

  const handleAddBlock = async (type: PageBlockType) => {
    setShowAddMenu(false)
    try {
      const block = await createPageBlock(slug, {
        block_type: type,
        title: BLOCK_TYPE_LABELS[type],
        content: { ...DEFAULT_BLOCK_TEMPLATES[type] },
      })
      setBlocks(prev => [...prev, block])
      setExpandedId(block.id)
      toast.success(`Added ${BLOCK_TYPE_LABELS[type]}`)
    } catch {
      toast.error('Failed to add block')
    }
  }

  const handleUpdateBlock = async (blockId: string, updates: Partial<PageBlockDB>) => {
    setSavingId(blockId)
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b))
    try {
      const updated = await updatePageBlock(blockId, updates)
      setBlocks(prev => prev.map(b => b.id === blockId ? updated : b))
    } catch {
      toast.error('Failed to update block')
      load()
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    setDeletingId(blockId)
    try {
      await deletePageBlock(blockId)
      setBlocks(prev => prev.filter(b => b.id !== blockId))
      toast.success('Block deleted')
    } catch {
      toast.error('Failed to delete block')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (blockId: string) => {
    try {
      const dup = await duplicatePageBlock(blockId)
      setBlocks(prev => [...prev, dup])
      toast.success('Block duplicated')
    } catch {
      toast.error('Failed to duplicate block')
    }
  }

  const handleToggleVisibility = async (blockId: string) => {
    const current = blocks.find(b => b.id === blockId)
    if (!current) return
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, is_visible: !b.is_visible } : b))
    try {
      await toggleBlockVisibility(blockId)
    } catch {
      toast.error('Failed to toggle visibility')
      setBlocks(prev => prev.map(b => b.id === blockId ? current : b))
    }
  }

  const handleToggleDraft = async (blockId: string) => {
    const current = blocks.find(b => b.id === blockId)
    if (!current) return
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, is_draft: !b.is_draft } : b))
    try {
      await toggleBlockDraft(blockId)
    } catch {
      toast.error('Failed to toggle draft')
      setBlocks(prev => prev.map(b => b.id === blockId ? current : b))
    }
  }

  const updateBlockContentField = (blockId: string, key: string, value: unknown) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, content: { ...b.content, [key]: value } } : b
    ))
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''} on this page
        </p>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Block
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-72 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {(Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleAddBlock(type)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={BLOCK_ICONS[type]} />
                      </svg>
                      {BLOCK_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-sm">No blocks yet. Click "Add Block" to start building this page.</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={blocks} onReorder={handleReorder} className="space-y-3">
          {blocks.map((block, index) => (
            <Reorder.Item key={block.id} value={block} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400 font-mono w-6">{index + 1}</span>
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={BLOCK_ICONS[block.block_type]} />
                </svg>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {BLOCK_TYPE_LABELS[block.block_type]}
                </span>
                <span className="text-sm text-gray-700 font-medium flex-1 truncate">{block.title || ''}</span>

                {block.is_draft && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Draft</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleVisibility(block.id)}
                    title={block.is_visible ? 'Hide block' : 'Show block'}
                    className={`p-1.5 rounded-lg transition-colors ${block.is_visible ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {block.is_visible ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>

                  <button
                    onClick={() => handleToggleDraft(block.id)}
                    title={block.is_draft ? 'Publish block' : 'Mark as draft'}
                    className={`p-1.5 rounded-lg transition-colors ${block.is_draft ? 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {block.is_draft ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      )}
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDuplicate(block.id)}
                    title="Duplicate block"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                    title={expandedId === block.id ? 'Collapse' : 'Edit'}
                    className={`p-1.5 rounded-lg transition-colors ${expandedId === block.id ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${block.title || BLOCK_TYPE_LABELS[block.block_type]}" block?`)) {
                        handleDeleteBlock(block.id)
                      }
                    }}
                    disabled={deletingId === block.id}
                    title="Delete block"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === block.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {expandedId === block.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-4 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Block Title</label>
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => {
                        setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))
                      }}
                      onBlur={() => handleUpdateBlock(block.id, { title: block.title })}
                      placeholder="Block title (internal use)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={block.settings?.background_color ? String(block.settings.background_color).padStart(7, '#') : '#ffffff'}
                          onChange={(e) => {
                            const val = e.target.value
                            setBlocks(prev => prev.map(b =>
                              b.id === block.id ? { ...b, settings: { ...b.settings, background_color: val } } : b
                            ))
                          }}
                          onBlur={() => handleUpdateBlock(block.id, { settings: block.settings })}
                          className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={block.settings?.background_color ? String(block.settings.background_color) : ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setBlocks(prev => prev.map(b =>
                              b.id === block.id ? { ...b, settings: { ...b.settings, background_color: val } } : b
                            ))
                          }}
                          onBlur={() => handleUpdateBlock(block.id, { settings: block.settings })}
                          placeholder="#ffffff"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Max Width</label>
                      <input
                        type="text"
                        value={block.settings?.max_width ? String(block.settings.max_width) : ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setBlocks(prev => prev.map(b =>
                            b.id === block.id ? { ...b, settings: { ...b.settings, max_width: val } } : b
                          ))
                        }}
                        onBlur={() => handleUpdateBlock(block.id, { settings: block.settings })}
                        placeholder="1200px"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Padding Top</label>
                      <input
                        type="text"
                        value={block.settings?.padding_top ? String(block.settings.padding_top) : ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setBlocks(prev => prev.map(b =>
                            b.id === block.id ? { ...b, settings: { ...b.settings, padding_top: val } } : b
                          ))
                        }}
                        onBlur={() => handleUpdateBlock(block.id, { settings: block.settings })}
                        placeholder="4rem"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Padding Bottom</label>
                      <input
                        type="text"
                        value={block.settings?.padding_bottom ? String(block.settings.padding_bottom) : ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setBlocks(prev => prev.map(b =>
                            b.id === block.id ? { ...b, settings: { ...b.settings, padding_bottom: val } } : b
                          ))
                        }}
                        onBlur={() => handleUpdateBlock(block.id, { settings: block.settings })}
                        placeholder="4rem"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Text Alignment</label>
                      <select
                        value={block.settings?.text_alignment ? String(block.settings.text_alignment) : 'left'}
                        onChange={(e) => {
                          const val = e.target.value
                          const updated = { ...block, settings: { ...block.settings, text_alignment: val } }
                          setBlocks(prev => prev.map(b => b.id === block.id ? updated : b))
                          handleUpdateBlock(block.id, { settings: updated.settings })
                        }}
                        title="Text alignment"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Content Fields</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {Object.entries(DEFAULT_BLOCK_TEMPLATES[block.block_type] || {}).map(([fieldKey, fieldValue]) => (
                        <div key={fieldKey}>
                          <label className="block text-xs text-gray-500 mb-1 capitalize">{fieldKey.replace(/_/g, ' ')}</label>
                          {Array.isArray(fieldValue) ? (
                            <input
                              type="text"
                              value={Array.isArray(block.content[fieldKey]) ? (block.content[fieldKey] as unknown[]).join(', ') : ''}
                              onChange={(e) => updateBlockContentField(block.id, fieldKey, e.target.value.split(',').map(s => s.trim()))}
                              onBlur={() => handleUpdateBlock(block.id, { content: block.content })}
                              placeholder={`Enter ${fieldKey.replace(/_/g, ' ')} (comma-separated)`}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50"
                            />
                          ) : (
                            <textarea
                              value={typeof block.content[fieldKey] === 'string' ? String(block.content[fieldKey] || '') : ''}
                              onChange={(e) => updateBlockContentField(block.id, fieldKey, e.target.value)}
                              onBlur={() => {
                                if (savingId !== block.id) handleUpdateBlock(block.id, { content: block.content })
                              }}
                              placeholder={`Enter ${fieldKey.replace(/_/g, ' ')}`}
                              rows={fieldKey === 'title' || fieldKey === 'preTitle' ? 1 : 3}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500/50 resize-vertical"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateBlock(block.id, { content: block.content, settings: block.settings })}
                      disabled={savingId === block.id}
                      className="px-3 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                    >
                      {savingId === block.id ? 'Saving...' : 'Save Block'}
                    </button>
                  </div>
                </motion.div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}
