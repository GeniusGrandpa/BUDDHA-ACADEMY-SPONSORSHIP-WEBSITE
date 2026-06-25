import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { upsertVolunteerContent, db } from '../../../services/cms-content'
import type { VolunteerOpportunity, SkillOption } from '../../../types/cms-content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminVolunteerContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentId, setContentId] = useState<string | undefined>()
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db('volunteer_content')
        .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = data as any
        setContentId(d.id)
        setHeroTitle(d.hero_title || '')
        setHeroSubtitle(d.hero_subtitle || '')
        setSectionTitle(d.section_title || '')
        setSectionDescription(d.section_description || '')
        setSuccessMessage(d.success_message || '')
        setOpportunities(d.opportunities || [])
        setSkillOptions(d.skill_options || [])
      }
    } catch { toast.error('Failed to load volunteer content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertVolunteerContent({
        id: contentId, hero_title: heroTitle, hero_subtitle: heroSubtitle,
        section_title: sectionTitle, section_description: sectionDescription,
        success_message: successMessage, opportunities, skill_options: skillOptions,
        is_published: true,
      })
      toast.success('Volunteer content saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Page Content</h1>
          <p className="text-gray-500 mt-1">Manage volunteer hero, opportunities & skill options</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Title</label>
              <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
                placeholder="Volunteer hero title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hero Subtitle</label>
              <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2}
                placeholder="Volunteer hero subtitle" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Section Title</label>
              <input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}
                placeholder="e.g. Volunteer Opportunities" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Section Description</label>
              <textarea value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} rows={3}
                placeholder="Describe volunteer opportunities" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
            <button onClick={() => setOpportunities([...opportunities, { title: '', description: '', icon: 'HandHeart' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Opportunity</button>
          </div>
          <div className="space-y-4">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Opportunity {idx + 1}</span>
                  <button onClick={() => setOpportunities(opportunities.filter((_, i) => i !== idx))}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input value={opp.title} onChange={e => {
                      const o = [...opportunities]; o[idx] = { ...o[idx], title: e.target.value }; setOpportunities(o)
                    }} placeholder="Opportunity title" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea value={opp.description} onChange={e => {
                      const o = [...opportunities]; o[idx] = { ...o[idx], description: e.target.value }; setOpportunities(o)
                    }} rows={2} placeholder="Opportunity description" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                    <input value={opp.icon} onChange={e => {
                      const o = [...opportunities]; o[idx] = { ...o[idx], icon: e.target.value }; setOpportunities(o)
                    }} placeholder="HandHeart" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                  </div>
                </div>
              </div>
            ))}
            {opportunities.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No opportunities yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Skill Options</h2>
            <button onClick={() => setSkillOptions([...skillOptions, { value: '', label: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Skill</button>
          </div>
          <div className="space-y-3">
            {skillOptions.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={skill.value} onChange={e => {
                  const s = [...skillOptions]; s[idx] = { ...s[idx], value: e.target.value }; setSkillOptions(s)
                }} placeholder="Value (e.g. teaching)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <input value={skill.label} onChange={e => {
                  const s = [...skillOptions]; s[idx] = { ...s[idx], label: e.target.value }; setSkillOptions(s)
                }} placeholder="Label (e.g. Teaching)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <button onClick={() => setSkillOptions(skillOptions.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {skillOptions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No skill options yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Success Message</h2>
          <textarea value={successMessage} onChange={e => setSuccessMessage(e.target.value)} rows={3}
            placeholder="Message shown after successful volunteer signup"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
        </motion.div>
      </div>
    </div>
  )
}
