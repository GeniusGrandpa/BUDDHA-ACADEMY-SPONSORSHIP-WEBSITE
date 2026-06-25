import { useState, useEffect, useCallback } from 'react'
import { GripVertical, Eye, EyeOff } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { getSectionVisibility, updateSectionVisibility, db } from '../../../services/cms-content'
import type { SectionVisibility } from '../../../types/cms-content'
import { ListSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminSectionVisibility() {
  const [sections, setSections] = useState<SectionVisibility[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSectionVisibility()
      setSections(data)
    } catch { toast.error('Failed to load sections') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setSections(items.map((item, idx) => ({ ...item, sort_order: idx })))
  }

  const toggleVisibility = async (key: string) => {
    const section = sections.find(s => s.section_key === key)
    if (!section) return
    const newVis = !section.is_visible
    setSections(sections.map(s => s.section_key === key ? { ...s, is_visible: newVis } : s))
    try {
      await updateSectionVisibility(key, newVis)
      toast.success(`Section ${newVis ? 'shown' : 'hidden'}`)
    } catch {
      setSections(sections.map(s => s.section_key === key ? { ...s, is_visible: !newVis } : s))
      toast.error('Failed to update')
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      const updates = sections.map((s, idx) => ({
        section_key: s.section_key,
        sort_order: idx,
        updated_at: new Date().toISOString(),
      }))
      for (const u of updates) {
        await db('section_visibility').update(u).eq('section_key', u.section_key)
      }
      toast.success('Section order saved')
    } catch { toast.error('Failed to save order') }
    finally { setSaving(false) }
  }

  if (loading) return <ListSkeleton rows={5} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Section Visibility</h1>
          <p className="text-gray-500 mt-1">Show/hide and reorder sections across the site</p>
        </div>
        <div className="flex items-center gap-3">
          {sections.some((s, i) => s.sort_order !== i) && (
            <button onClick={handleSaveOrder} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          )}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No sections found</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.section_key} draggableId={section.section_key} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}
                        className="bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900">{section.section_name || section.section_key}</h3>
                            <p className="text-xs text-gray-500 font-mono">{section.section_key}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">#{section.sort_order + 1}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${section.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {section.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                            <button onClick={() => toggleVisibility(section.section_key)}
                              className={`p-1.5 rounded-lg hover:bg-gray-100 ${section.is_visible ? 'text-emerald-600' : 'text-gray-400'}`}
                              title={section.is_visible ? 'Hide section' : 'Show section'}>
                              {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
