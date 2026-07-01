import { useState, useEffect, useCallback } from 'react'
import { Save, Upload, Send } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { upsertDesignSettings, publishDesignSettings } from '../../../services/design'
import { uploadMedia } from '../../../services/content'
import toast from 'react-hot-toast'
import type { DesignBranding } from '../../../types/design'

const CACHE_KEY = 'ba_branding_cache'

function updateBrandingCache(branding: DesignBranding) {
  try {
    const tagline = branding?.tagline || ''
    const siteName = branding?.browser_tab_title || branding?.organization_name || 'Buddha Academy'
    const title = tagline ? `${siteName} - ${tagline}` : siteName
    const now = Date.now()
    const cb = (url: string) => `${url}${url.includes('?') ? '&' : '?'}_cb=${now}`
    const fv = branding?.favicon_url
    const og = branding?.og_image_url
    const at = branding?.apple_touch_icon_url || branding?.favicon_url
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      title,
      favicon: fv ? cb(fv) : null,
      themeColor: branding?.theme_color || null,
      ogImage: og ? cb(og) : null,
      appleTouchIcon: at ? cb(at) : null,
    }))
  } catch {}
}

export function AdminBrandingPage() {
  const { branding, refreshTheme } = useTheme()
  const [form, setForm] = useState<DesignBranding>(branding)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [uploadingHeaderLogo, setUploadingHeaderLogo] = useState(false)
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false)
  const [uploadingAppIcon, setUploadingAppIcon] = useState(false)
  const [uploadingAppleTouch, setUploadingAppleTouch] = useState(false)
  const [uploadingOgImage, setUploadingOgImage] = useState(false)
  const [uploadingTwitterImage, setUploadingTwitterImage] = useState(false)

  useEffect(() => { setForm(branding) }, [branding])

  const handleChange = useCallback((key: keyof DesignBranding, value: string | null) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: keyof DesignBranding) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploadMap: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
      logo_url: setUploadingLogo,
      secondary_logo_url: setUploadingLogo,
      header_logo_url: setUploadingHeaderLogo,
      footer_logo_url: setUploadingFooterLogo,
      favicon_url: setUploadingFavicon,
      app_icon_url: setUploadingAppIcon,
      apple_touch_icon_url: setUploadingAppleTouch,
      og_image_url: setUploadingOgImage,
      twitter_image_url: setUploadingTwitterImage,
    }
    const setUploading = uploadMap[field] || setUploadingLogo
    setUploading(true)
    try {
      const media = await uploadMedia(file, `${field} upload`)
      handleChange(field, media.url)
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }, [handleChange])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertDesignSettings({ branding: form })
      await refreshTheme()
      updateBrandingCache(form)
      toast.success('Draft saved — click Publish to make live.')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await upsertDesignSettings({ branding: form })
      await publishDesignSettings()
      await refreshTheme()
      updateBrandingCache(form)
      toast.success('Branding published live!')
    } catch { toast.error('Failed to publish') }
    finally { setPublishing(false) }
  }

  function imageUploader(label: string, field: keyof DesignBranding, uploading: boolean, height = 'h-16') {
    return (
      <div>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        <div className="mt-2 p-4 rounded-lg border-2 border-dashed border-[var(--color-border)]">
          {form[field] ? (
            <div className="space-y-2">
              <img src={form[field] as string} alt={`${label} preview`} className={`${height} object-contain`} loading="eager" decoding="async" />
              <button onClick={() => handleChange(field, null)} className="text-xs text-red-500">Remove</button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer text-[var(--color-text-muted)]">
              <Upload className="w-8 h-8" />
              <span className="text-sm">{uploading ? 'Uploading...' : `Click to upload ${label.toLowerCase()}`}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, field)} />
            </label>
          )}
        </div>
      </div>
    )
  }

  function textField(label: string, field: keyof DesignBranding, placeholder = '') {
    return (
      <label className="block">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        <input
          type="text" value={form[field] as string}
          onChange={e => handleChange(field, e.target.value || null)}
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </label>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Branding</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your organization's visual identity</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Send className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textField('Organization Name', 'organization_name')}
          {textField('Browser Tab Title', 'browser_tab_title', 'Defaults to organization name')}
          {textField('Tagline', 'tagline')}
          {textField('Slogan', 'slogan')}
          {textField('Theme Color (hex)', 'theme_color', '#f26b1d')}
          {textField('Footer Branding', 'footer_branding')}
          {textField('Email Branding', 'email_branding')}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Logos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {imageUploader('Primary Logo', 'logo_url', uploadingLogo)}
          {imageUploader('Header Logo', 'header_logo_url', uploadingHeaderLogo)}
          {imageUploader('Footer Logo', 'footer_logo_url', uploadingFooterLogo)}
          {imageUploader('Secondary Logo', 'secondary_logo_url', uploadingLogo)}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Icons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {imageUploader('Favicon', 'favicon_url', uploadingFavicon, 'h-10')}
          {imageUploader('App Icon', 'app_icon_url', uploadingAppIcon, 'h-12')}
          {imageUploader('Apple Touch Icon', 'apple_touch_icon_url', uploadingAppleTouch, 'h-12')}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Social Sharing</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Default images for social media previews (Open Graph, Twitter Cards)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {imageUploader('OG Image (1200x630)', 'og_image_url', uploadingOgImage)}
          {imageUploader('Twitter Image', 'twitter_image_url', uploadingTwitterImage)}
        </div>
      </div>
    </div>
  )
}
