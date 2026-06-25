import { useState, useEffect } from 'react'
import { getPageHeader, upsertPageHeader } from '../../../../services/cms-content'
import { getSiteSettings, updateSiteSettings } from '../../../../services/settings'
import { getAllCmsStrings, upsertCmsString } from '../../../../services/cms-content'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

export function ContactPageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [header, setHeader] = useState({ title: '', subtitle: '' })
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [strings, setStrings] = useState<Record<string, string>>({} as Record<string, string>)

  const stringKeys = [
    'contact_form_title', 'contact_address_label', 'contact_phone_label', 'contact_email_label',
    'contact_send_message_heading', 'contact_success_title', 'contact_success_text', 'contact_send_another',
    'contact_name_label', 'contact_email_label_form', 'contact_phone_label_form', 'contact_phone_placeholder',
    'contact_subject_label', 'contact_message_label', 'contact_message_placeholder',
    'contact_submitting_text', 'contact_submit_text', 'contact_location_heading', 'contact_map_button',
    'contact_phone_error', 'contact_error_text',
  ]

  const load = async () => {
    setLoading(true)
    try {
      const [hdr, settings, cmsStrings] = await Promise.all([
        getPageHeader('contact').catch(() => null),
        getSiteSettings().catch(() => null),
        getAllCmsStrings().catch(() => ({}) as Record<string, string>),
      ])
      if (hdr) setHeader({ title: hdr.title || '', subtitle: hdr.subtitle || '' })
      if (settings) {
        setEmail(settings.contact_email || '')
        setPhone(settings.contact_phone || '')
        setAddress(settings.contact_address || '')
      }
      const strMap: Record<string, string> = {}
      for (const key of stringKeys) {
        strMap[key] = cmsStrings[key] || ''
      }
      setStrings(strMap)
    } catch { toast.error('Failed to load contact page data') }
    finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        upsertPageHeader({ page_slug: 'contact', title: header.title, subtitle: header.subtitle, is_visible: true } as never),
        updateSiteSettings({ contact_email: email, contact_phone: phone, contact_address: address } as never),
        ...Object.entries(strings).map(([key, value]) =>
          upsertCmsString({ key, value, page_slug: 'contact', category: 'contact' })
        ),
      ])
      toast.success('Contact page saved')
    } catch { toast.error('Failed to save contact page') }
    finally { setSaving(false) }
  }

  const updateString = (key: string, value: string) => {
    setStrings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <FormSkeleton fields={6} />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Page</h1>
          <p className="text-gray-500 mt-1">Manage contact information, page header, and form text</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
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
        <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Form Labels & Text</h2>
        <div className="grid grid-cols-2 gap-4">
          {stringKeys.map(key => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</label>
              <input value={strings[key] || ''} onChange={e => updateString(key, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
