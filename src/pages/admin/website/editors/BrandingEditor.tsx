import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTheme } from '../../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../../services/design'
import { uploadMedia } from '../../../../services/content'
import { getSiteSettings, updateSiteSettings } from '../../../../services/settings'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import { SaveButton } from '../shared/SaveButton'
import type { DesignBranding } from '../../../../types/design'
import type { SiteSettings } from '../../../../types/cms'

export function BrandingEditor() {
  const { branding, refreshTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [brandingForm, setBrandingForm] = useState<DesignBranding>(branding)
  const [colors, setColors] = useState({ primary: '#F59E0B', secondary: '#D97706', accent: '#1C1917' })
  const [contact, setContact] = useState({ contact_email: '', contact_phone: '', contact_address: '' })
  const [social, setSocial] = useState({ social_facebook: '', social_twitter: '', social_instagram: '', social_youtube: '' })

  useEffect(() => {
    setBrandingForm(branding)
  }, [branding])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSiteSettings()
        if (settings) {
          setContact({
            contact_email: settings.contact_email || '',
            contact_phone: settings.contact_phone || '',
            contact_address: settings.contact_address || '',
          })
          setSocial({
            social_facebook: settings.social_facebook || '',
            social_twitter: settings.social_twitter || '',
            social_instagram: settings.social_instagram || '',
            social_youtube: settings.social_youtube || '',
          })
        }
      } catch { } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    const setUploading = field === 'favicon_url' ? setUploadingFavicon : setUploadingLogo
    setUploading(true)
    try {
      const media = await uploadMedia(file, `${field} upload`)
      setBrandingForm(prev => ({ ...prev, [field]: media.url }))
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({
        branding: { ...brandingForm },
        colors: { ...colors } as never,
      })
      await updateSiteSettings({
        contact_email: contact.contact_email,
        contact_phone: contact.contact_phone,
        contact_address: contact.contact_address,
        social_facebook: social.social_facebook,
        social_twitter: social.social_twitter,
        social_instagram: social.social_instagram,
        social_youtube: social.social_youtube,
      } as Partial<SiteSettings>)
      await refreshTheme()
      toast.success('Branding saved and published')
    } catch { toast.error('Failed to save branding') }
    finally { setSaving(false) }
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
          <p className="text-gray-500 mt-1">Manage your organization's logo, colors, contact information, and social links</p>
        </div>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>

      <Section title="Organization Identity" desc="Your logo, name, tagline, and favicon">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Organization Name" value={brandingForm.organization_name} onChange={v => setBrandingForm(p => ({ ...p, organization_name: v }))} />
          <Field label="Tagline" value={brandingForm.tagline} onChange={v => setBrandingForm(p => ({ ...p, tagline: v }))} />
          <Field label="Footer Branding" value={brandingForm.footer_branding} onChange={v => setBrandingForm(p => ({ ...p, footer_branding: v }))} />
          <Field label="Email Branding" value={brandingForm.email_branding} onChange={v => setBrandingForm(p => ({ ...p, email_branding: v }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ImageUpload label="Primary Logo" url={brandingForm.logo_url} uploading={uploadingLogo} onChange={e => handleImageUpload(e, 'logo_url')} onRemove={() => setBrandingForm(p => ({ ...p, logo_url: '' }))} />
          <ImageUpload label="Favicon" url={brandingForm.favicon_url} uploading={uploadingFavicon} onChange={e => handleImageUpload(e, 'favicon_url')} onRemove={() => setBrandingForm(p => ({ ...p, favicon_url: '' }))} />
        </div>
      </Section>

      <Section title="Brand Colors" desc="Your primary, secondary, and accent colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorField label="Primary Color" value={colors.primary} onChange={v => setColors(p => ({ ...p, primary: v }))} />
          <ColorField label="Secondary Color" value={colors.secondary} onChange={v => setColors(p => ({ ...p, secondary: v }))} />
          <ColorField label="Accent Color" value={colors.accent} onChange={v => setColors(p => ({ ...p, accent: v }))} />
        </div>
      </Section>

      <Section title="Contact Information" desc="Your organization's contact details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email Address" value={contact.contact_email} onChange={v => setContact(p => ({ ...p, contact_email: v }))} />
          <Field label="Phone Number" value={contact.contact_phone} onChange={v => setContact(p => ({ ...p, contact_phone: v }))} />
          <div className="md:col-span-2">
            <Field label="Address" value={contact.contact_address} onChange={v => setContact(p => ({ ...p, contact_address: v }))} textarea />
          </div>
        </div>
      </Section>

      <Section title="Social Links" desc="Links to your social media profiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Facebook URL" value={social.social_facebook} onChange={v => setSocial(p => ({ ...p, social_facebook: v }))} />
          <Field label="Twitter URL" value={social.social_twitter} onChange={v => setSocial(p => ({ ...p, social_twitter: v }))} />
          <Field label="Instagram URL" value={social.social_instagram} onChange={v => setSocial(p => ({ ...p, social_instagram: v }))} />
          <Field label="YouTube URL" value={social.social_youtube} onChange={v => setSocial(p => ({ ...p, social_youtube: v }))} />
        </div>
      </Section>
    </div>
  )
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20" />
      )}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [textVal, setTextVal] = useState(value)
  useEffect(() => { setTextVal(value) }, [value])
  const commit = (v: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v)) { onChange(v) }
    else { setTextVal(value) }
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
        <input type="text" value={textVal} onChange={e => setTextVal(e.target.value)}
          onBlur={() => commit(textVal)} onKeyDown={e => { if (e.key === 'Enter') commit(textVal) }}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20" />
      </div>
    </div>
  )
}

function ImageUpload({ label, url, uploading, onChange, onRemove }: { label: string; url: string | null; uploading: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        {url ? (
          <div className="space-y-2">
            <img src={url} alt={label} className="h-16 object-contain" loading="eager" decoding="async" />
            <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-amber-600 transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm">{uploading ? 'Uploading...' : `Click to upload ${label.toLowerCase()}`}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  )
}
