import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { upsertFooterContent, db } from '../../../services/cms-content'
import type { FooterLink, SocialLink } from '../../../types/cms-content'
import { FormSkeleton } from '../../../components/ui/LoadingSkeleton'

export function AdminFooterContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentId, setContentId] = useState<string | undefined>()
  const [description, setDescription] = useState('')
  const [copyrightText, setCopyrightText] = useState('')
  const [nonprofitText, setNonprofitText] = useState('')
  const [quickLinks, setQuickLinks] = useState<FooterLink[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await db('footer_content')
        .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (data) {

        const d = data as unknown as Record<string, unknown> 
        setContentId(d.id)
        setDescription(d.description || '')
        setCopyrightText(d.copyright_text || '')
        setNonprofitText(d.nonprofit_text || '')
        setQuickLinks(d.quick_links || [])
        setSocialLinks(d.social_links || [])
        if (d.contact_info) {
          setAddress(d.contact_info.address || '')
          setPhone(d.contact_info.phone || '')
          setEmail(d.contact_info.email || '')
        }
      }
    } catch { toast.error('Failed to load footer content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertFooterContent({
        id: contentId, description, copyright_text: copyrightText,
        nonprofit_text: nonprofitText, quick_links: quickLinks,
        social_links: socialLinks,
        contact_info: { address, phone, email },
        is_published: true,
      })
      toast.success('Footer content saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer Content</h1>
          <p className="text-gray-500 mt-1">Manage footer description, links, social media & contact info</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Text</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Footer description / about text"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Copyright Text</label>
              <input value={copyrightText} onChange={e => setCopyrightText(e.target.value)}
                placeholder="© 2024 Buddha Academy. All rights reserved."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nonprofit Text</label>
              <input value={nonprofitText} onChange={e => setNonprofitText(e.target.value)}
                placeholder="Registered 501(c)(3) nonprofit"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
            <button onClick={() => setQuickLinks([...quickLinks, { label: '', url: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Link</button>
          </div>
          <div className="space-y-3">
            {quickLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={link.label} onChange={e => {
                  const l = [...quickLinks]; l[idx] = { ...l[idx], label: e.target.value }; setQuickLinks(l)
                }} placeholder="Label" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <input value={link.url} onChange={e => {
                  const l = [...quickLinks]; l[idx] = { ...l[idx], url: e.target.value }; setQuickLinks(l)
                }} placeholder="/about" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <button onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {quickLinks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No quick links yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
            <button onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '', label: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">+ Add Social</button>
          </div>
          <div className="space-y-3">
            {socialLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                <input value={link.platform} onChange={e => {
                  const s = [...socialLinks]; s[idx] = { ...s[idx], platform: e.target.value }; setSocialLinks(s)
                }} placeholder="Platform (facebook)" className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <input value={link.url} onChange={e => {
                  const s = [...socialLinks]; s[idx] = { ...s[idx], url: e.target.value }; setSocialLinks(s)
                }} placeholder="https://facebook.com/..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <input value={link.label} onChange={e => {
                  const s = [...socialLinks]; s[idx] = { ...s[idx], label: e.target.value }; setSocialLinks(s)
                }} placeholder="Label" className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
                <button onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {socialLinks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No social links yet.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                placeholder="Street address, city, country"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+977-..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="info@buddhaacademy.org" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
