import { useState, useEffect } from 'react'
import { Save, GripVertical, EyeOff, Eye } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings, getSectionVisibility, updateSectionVisibility } from '../../../services/design'
import toast from 'react-hot-toast'
import type { SectionVisibilityEntry } from '../../../types/design'

const sectionOptions = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'impact_stats', label: 'Impact Stats' },
  { key: 'featured_students', label: 'Featured Students' },
  { key: 'about_preview', label: 'About Preview' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'latest_news', label: 'Latest News' },
  { key: 'cta_banner', label: 'CTA Banner' },
  { key: 'donation_goals', label: 'Donation Goals' },
  { key: 'partners', label: 'Partners / Sponsors' },
  { key: 'events', label: 'Upcoming Events' },
  { key: 'video_gallery', label: 'Video Gallery' },
  { key: 'faq_section', label: 'FAQ Section' },
]

export function AdminConfigPage() {
  const { settings, refreshTheme } = useTheme()
  const themeConfig = settings?.config
  const [sections, setSections] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const [sectionVisibilityData, setSectionVisibilityData] = useState<SectionVisibilityEntry[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const featured = (themeConfig as Record<string, unknown>)?.featured_sections as string[] | undefined
    setSections(featured || ['hero', 'stats', 'about', 'students', 'testimonials', 'news', 'cta', 'footer'])
    loadData()
  }, [themeConfig])

  const loadData = async () => {
    try {
      const vis = await getSectionVisibility()
      setSectionVisibilityData(vis)
      const visMap: Record<string, boolean> = {}
      vis.forEach(v => { visMap[v.section_key] = v.is_visible })
      setVisibility(visMap)
    } catch { /* ignore */ }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setSections(items)
  }

  const toggleSectionVisibility = async (sectionKey: string) => {
    const entry = sectionVisibilityData.find(v => v.section_key === sectionKey)
    if (entry) {
      const newVis = !entry.is_visible
      setVisibility(prev => ({ ...prev, [sectionKey]: newVis }))
      await updateSectionVisibility(entry.id, newVis)
      setSectionVisibilityData(prev => prev.map(v => v.id === entry.id ? { ...v, is_visible: newVis } : v))
    } else {
      setVisibility(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({
        config: {
          ...themeConfig,
          featured_sections: sections,
        },
      })
      await refreshTheme()
      toast.success('Configuration saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Website Configuration</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Section ordering, visibility & website settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Section Order (Drag to reorder)</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {sections.map((key, index) => {
                    const option = sectionOptions.find(o => o.key === key)
                    return (
                      <Draggable key={key} draggableId={key} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                          >
                            <div {...provided.dragHandleProps} className="text-[var(--color-text-muted)] cursor-grab">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="flex-1 text-sm text-[var(--color-text-primary)]">{option?.label || key}</span>
                            <button
                              onClick={() => toggleSectionVisibility(key)}
                              className={`p-1.5 rounded-md ${visibility[key] !== false ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}
                              title={visibility[key] !== false ? 'Visible' : 'Hidden'}
                            >
                              {visibility[key] !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Homepage Layout</h3>

          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Layout Style</span>
            <select value={(themeConfig?.homepage_layout as string) || 'default'} onChange={async e => {
              await upsertDesignSettings({ config: { ...themeConfig, homepage_layout: e.target.value } })
              await refreshTheme()
              toast.success('Layout updated')
            }}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)]">
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
              <option value="magazine">Magazine Style</option>
            </select>
          </label>

          <hr className="border-[var(--color-border)]" />

          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Feature Toggles</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-primary)]">Dynamic Banners</span>
              <button
                onClick={async () => {
                  const current = themeConfig?.dynamic_banners_enabled as boolean ?? true
                  await upsertDesignSettings({ config: { ...themeConfig, dynamic_banners_enabled: !current } })
                  await refreshTheme()
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${(themeConfig?.dynamic_banners_enabled as boolean) !== false ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(themeConfig?.dynamic_banners_enabled as boolean) !== false ? 'translate-x-5' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-primary)]">Announcement Bar</span>
              <button
                onClick={async () => {
                  const current = themeConfig?.announcement_bar_enabled as boolean ?? false
                  await upsertDesignSettings({ config: { ...themeConfig, announcement_bar_enabled: !current } })
                  await refreshTheme()
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${(themeConfig?.announcement_bar_enabled as boolean) ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(themeConfig?.announcement_bar_enabled as boolean) ? 'translate-x-5' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-primary)]">Seasonal Theme</span>
              <button
                onClick={async () => {
                  const current = themeConfig?.seasonal_theme_enabled as boolean ?? false
                  await upsertDesignSettings({ config: { ...themeConfig, seasonal_theme_enabled: !current } })
                  await refreshTheme()
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${(themeConfig?.seasonal_theme_enabled as boolean) ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(themeConfig?.seasonal_theme_enabled as boolean) ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
