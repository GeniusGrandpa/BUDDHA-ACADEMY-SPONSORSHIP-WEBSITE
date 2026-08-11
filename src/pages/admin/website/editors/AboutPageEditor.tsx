import { useState, useEffect } from 'react'
import { getPageHeader, upsertPageHeader, getSiteImagesBySection, upsertSiteImage, deleteSiteImage } from '../../../../services/cms-content'
import { getPageBySlug, upsertPage } from '../../../../services/content'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import { openPreview } from '../../../../lib/preview-mode'
import toast from 'react-hot-toast'

interface TimelineItem { year: string; title: string; desc: string }
interface ValueItem { title: string; desc: string }
interface StatItem { value: string; label: string }

interface AboutContent {
  mission?: string
  mission_ne?: string
  vision?: string
  vision_ne?: string
  description?: string
  description_ne?: string
  stats?: StatItem[]
  stats_ne?: StatItem[]
  values?: ValueItem[]
  values_ne?: ValueItem[]
  timeline?: TimelineItem[]
  timeline_ne?: TimelineItem[]
  location?: string
  locationDesc?: string
}

export function AboutPageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [header, setHeader] = useState({ title: '', subtitle: '' })
  const [mission, setMission] = useState('')
  const [missionNe, setMissionNe] = useState('')
  const [vision, setVision] = useState('')
  const [visionNe, setVisionNe] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionNe, setDescriptionNe] = useState('')
  const [stats, setStats] = useState<StatItem[]>([])
  const [statsNe, setStatsNe] = useState<StatItem[]>([])
  const [values, setValues] = useState<ValueItem[]>([])
  const [valuesNe, setValuesNe] = useState<ValueItem[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [timelineNe, setTimelineNe] = useState<TimelineItem[]>([])
  const [images, setImages] = useState<{ id?: string; url: string; alt: string }[]>([])

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [hdr, page, imgs] = await Promise.all([
        getPageHeader('about').catch(() => null),
        getPageBySlug('about').catch(() => null),
        getSiteImagesBySection('about').catch(() => []),
      ])
      if (hdr) setHeader({ title: hdr.title || '', subtitle: hdr.subtitle || '' })
      if (page?.content) {
        const c = page.content as AboutContent
        if (c.mission) setMission(c.mission)
        if (c.vision) setVision(c.vision)
        if (c.description) setDescription(c.description)
        if (c.stats) setStats(c.stats)
        else setStats([
          { value: '४९ +', label: 'Years of Service' },
          { value: '२०० +', label: 'Children Supported' },
          { value: '१०० %', label: 'Free Education' },
          { value: '१२ +', label: 'Trust' },
        ])
        if (c.values) setValues(c.values)
        if (c.timeline) setTimeline(c.timeline)
        else setTimeline([
          { year: '१९७७', title: 'Founded', desc: 'Opened with 12 students.' },
          { year: '१९८५', title: 'First Graduation', desc: 'First batch of students completed their secondary education.' },
          { year: '१९९५', title: 'Permanent Campus', desc: 'Moved to a dedicated campus with proper classrooms.' },
          { year: '२००५', title: 'Reaching Milestones', desc: 'Enrollment crossed 500 students with expanded programs.' },
          { year: '२०१५', title: 'Global Outreach', desc: 'International sponsorships began connecting students worldwide.' },
          { year: '२०२६', title: 'Today', desc: 'Serving over 2,000 children with free, quality education.' },
        ])
      }
      if (page?.content_ne && typeof page.content_ne === 'object' && Object.keys(page.content_ne).length > 0) {
        const cn = page.content_ne as AboutContent
        if (cn.mission) setMissionNe(cn.mission)
        if (cn.vision) setVisionNe(cn.vision)
        if (cn.description) setDescriptionNe(cn.description)
        if (cn.stats) setStatsNe(cn.stats)
        if (cn.values) setValuesNe(cn.values)
        if (cn.timeline) setTimelineNe(cn.timeline)
      }
      if (imgs.length > 0) setImages(imgs.map(i => ({ id: i.id, url: i.image_url, alt: i.alt_text || '' })))
    } catch { toast.error('Failed to load about page data') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        upsertPageHeader({ page_slug: 'about', title: header.title, subtitle: header.subtitle, is_visible: true } as never),
        upsertPage({
          slug: 'about',
          title: 'About Us',
          content: { mission, vision, description, stats, values, timeline } as unknown as Record<string, unknown>,
          content_ne: { mission: missionNe, vision: visionNe, description: descriptionNe, stats: statsNe, values: valuesNe, timeline: timelineNe } as unknown as Record<string, unknown>,
          published: true,
        }),
      ])
      toast.success('About page saved')
    } catch { toast.error('Failed to save about page') }
    finally { setSaving(false) }
  }

  const addStat = () => setStats(prev => [...prev, { value: '', label: '' }])
  const removeStat = (i: number) => setStats(prev => prev.filter((_, idx) => idx !== i))
  const updateStat = (i: number, field: keyof StatItem, val: string) => {
    setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  const addValue = () => setValues(prev => [...prev, { title: '', desc: '' }])
  const removeValue = (i: number) => setValues(prev => prev.filter((_, idx) => idx !== i))
  const updateValue = (i: number, field: keyof ValueItem, val: string) => {
    setValues(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))
  }

  const addTimelineItem = () => setTimeline(prev => [...prev, { year: '', title: '', desc: '' }])
  const removeTimelineItem = (i: number) => setTimeline(prev => prev.filter((_, idx) => idx !== i))
  const updateTimelineItem = (i: number, field: keyof TimelineItem, val: string) => {
    setTimeline(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  const addImage = () => setImages(prev => [...prev, { url: '', alt: '' }])
  const removeImage = async (i: number) => {
    const img = images[i]
    if (img.id) {
      try { await deleteSiteImage(img.id) } catch {}
    }
    setImages(prev => prev.filter((_, idx) => idx !== i))
  }
  const updateImage = (i: number, field: 'url' | 'alt', val: string) => {
    setImages(prev => prev.map((img, idx) => idx === i ? { ...img, [field]: val } : img))
  }
  const saveImage = async (img: { id?: string; url: string; alt: string }) => {
    await upsertSiteImage({ id: img.id, image_key: `about_${Date.now()}`, image_url: img.url, alt_text: img.alt, section: 'about' } as never)
  }

  const addStatNe = () => setStatsNe(prev => [...prev, { value: '', label: '' }])
  const removeStatNe = (i: number) => setStatsNe(prev => prev.filter((_, idx) => idx !== i))
  const updateStatNe = (i: number, field: keyof StatItem, val: string) => {
    setStatsNe(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  const addValueNe = () => setValuesNe(prev => [...prev, { title: '', desc: '' }])
  const removeValueNe = (i: number) => setValuesNe(prev => prev.filter((_, idx) => idx !== i))
  const updateValueNe = (i: number, field: keyof ValueItem, val: string) => {
    setValuesNe(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))
  }

  const addTimelineItemNe = () => setTimelineNe(prev => [...prev, { year: '', title: '', desc: '' }])
  const removeTimelineItemNe = (i: number) => setTimelineNe(prev => prev.filter((_, idx) => idx !== i))
  const updateTimelineItemNe = (i: number, field: keyof TimelineItem, val: string) => {
    setTimelineNe(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  const handleSaveImages = async () => {
    try {
      await Promise.all(images.map(img => saveImage(img)))
      toast.success('Images saved')
    } catch { toast.error('Failed to save images') }
  }

  if (loading) return <FormSkeleton fields={8} />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
          <p className="text-gray-500 mt-1">Manage all content for the About Us page</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openPreview('about')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Preview
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Page Header</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={header.title} onChange={e => setHeader(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input value={header.subtitle} onChange={e => setHeader(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Mission & Vision</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission (English)</label>
            <textarea value={mission} onChange={e => setMission(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission (Nepali)</label>
            <textarea value={missionNe} onChange={e => setMissionNe(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vision (English)</label>
            <textarea value={vision} onChange={e => setVision(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vision (Nepali)</label>
            <textarea value={visionNe} onChange={e => setVisionNe(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Nepali)</label>
            <textarea value={descriptionNe} onChange={e => setDescriptionNe(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
          <div className="flex gap-2">
            <button onClick={addStat} className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Add Stat</button>
            <button onClick={addStatNe} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Nepali</button>
          </div>
        </div>
        {stats.map((stat, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-3 items-start">
              <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="Value (e.g. 49+)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Years of Service)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <button onClick={() => removeStat(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
            <div className="flex gap-3 items-start pl-2">
              <input value={statsNe[i]?.value || ''} onChange={e => updateStatNe(i, 'value', e.target.value)} placeholder="Nepali Value"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <input value={statsNe[i]?.label || ''} onChange={e => updateStatNe(i, 'label', e.target.value)} placeholder="Nepali Label"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <button onClick={() => removeStatNe(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Core Values</h2>
          <div className="flex gap-2">
            <button onClick={addValue} className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Add Value</button>
            <button onClick={addValueNe} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Nepali</button>
          </div>
        </div>
        {values.map((val, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-3 items-start">
              <input value={val.title} onChange={e => updateValue(i, 'title', e.target.value)} placeholder="Title"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <input value={val.desc} onChange={e => updateValue(i, 'desc', e.target.value)} placeholder="Description"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <button onClick={() => removeValue(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
            <div className="flex gap-3 items-start pl-2">
              <input value={valuesNe[i]?.title || ''} onChange={e => updateValueNe(i, 'title', e.target.value)} placeholder="Nepali Title"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <input value={valuesNe[i]?.desc || ''} onChange={e => updateValueNe(i, 'desc', e.target.value)} placeholder="Nepali Description"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <button onClick={() => removeValueNe(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          <div className="flex gap-2">
            <button onClick={addTimelineItem} className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Add Event</button>
            <button onClick={addTimelineItemNe} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Nepali</button>
          </div>
        </div>
        {timeline.map((item, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-3 items-start">
              <input value={item.year} onChange={e => updateTimelineItem(i, 'year', e.target.value)} placeholder="Year"
                className="w-24 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <input value={item.title} onChange={e => updateTimelineItem(i, 'title', e.target.value)} placeholder="Title"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <input value={item.desc} onChange={e => updateTimelineItem(i, 'desc', e.target.value)} placeholder="Description"
                className="flex-[2] px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              <button onClick={() => removeTimelineItem(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
            <div className="flex gap-3 items-start pl-2">
              <input value={timelineNe[i]?.year || ''} onChange={e => updateTimelineItemNe(i, 'year', e.target.value)} placeholder="Year"
                className="w-24 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <input value={timelineNe[i]?.title || ''} onChange={e => updateTimelineItemNe(i, 'title', e.target.value)} placeholder="Nepali Title"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <input value={timelineNe[i]?.desc || ''} onChange={e => updateTimelineItemNe(i, 'desc', e.target.value)} placeholder="Nepali Description"
                className="flex-[2] px-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-500/50" />
              <button onClick={() => removeTimelineItemNe(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">About Images</h2>
          <button onClick={addImage} className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Add Image</button>
        </div>
        {images.map((img, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input value={img.url} onChange={e => updateImage(i, 'url', e.target.value)} placeholder="Image URL"
              className="flex-[2] px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
            <input value={img.alt} onChange={e => updateImage(i, 'alt', e.target.value)} placeholder="Alt text"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
            <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-500 p-2">&times;</button>
          </div>
        ))}
        {images.length > 0 && (
          <button onClick={handleSaveImages} className="text-sm text-amber-600 hover:text-amber-700 font-medium">Save Images</button>
        )}
      </div>
    </div>
  )
}
