import { useState, useEffect } from 'react'
import { Save, Upload } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings } from '../../../services/design'
import { uploadMedia } from '../../../services/content'
import toast from 'react-hot-toast'
import type { DesignBranding } from '../../../types/design'

export function AdminBrandingPage() {
  const { branding, refreshTheme } = useTheme()
  const [form, setForm] = useState<DesignBranding>(branding)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  useEffect(() => { setForm(branding) }, [branding])

  const handleChange = (key: keyof DesignBranding, value: string | null) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'secondary_logo_url' | 'favicon_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    const setUploading = field === 'favicon_url' ? setUploadingFavicon : setUploadingLogo
    setUploading(true)
    try {
      const media = await uploadMedia(file, `${field} upload`)
      handleChange(field, media.url)
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ branding: form })
      await refreshTheme()
      toast.success('Branding saved! Use Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Branding</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your organization's visual identity</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Organization Name</span>
              <input
                type="text" value={form.organization_name}
                onChange={e => handleChange('organization_name', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Tagline</span>
              <input
                type="text" value={form.tagline}
                onChange={e => handleChange('tagline', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Slogan</span>
              <input
                type="text" value={form.slogan}
                onChange={e => handleChange('slogan', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Footer Branding</span>
              <input
                type="text" value={form.footer_branding}
                onChange={e => handleChange('footer_branding', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Email Branding</span>
              <input
                type="text" value={form.email_branding}
                onChange={e => handleChange('email_branding', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Primary Logo</span>
              <div className="mt-2 p-4 rounded-lg border-2 border-dashed border-[var(--color-border)]">
                {form.logo_url ? (
                  <div className="space-y-2">
                    <img src={form.logo_url} alt="Logo preview" className="h-16 object-contain" />
                    <button onClick={() => handleChange('logo_url', null)} className="text-xs text-red-500">Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-[var(--color-text-muted)]">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">{uploadingLogo ? 'Uploading...' : 'Click to upload logo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo_url')} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Favicon</span>
              <div className="mt-2 p-4 rounded-lg border-2 border-dashed border-[var(--color-border)]">
                {form.favicon_url ? (
                  <div className="space-y-2">
                    <img src={form.favicon_url} alt="Favicon preview" className="h-10 object-contain" />
                    <button onClick={() => handleChange('favicon_url', null)} className="text-xs text-red-500">Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-[var(--color-text-muted)]">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">{uploadingFavicon ? 'Uploading...' : 'Click to upload favicon'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'favicon_url')} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
