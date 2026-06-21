import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Save, Settings } from 'lucide-react'
import { getSiteSettings, updateSiteSettings } from '../../../services/settings'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { SiteSettings } from '../../../types/cms'

export function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await getSiteSettings()
      setSettings(data)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateSiteSettings(settings)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <div className="grid gap-8">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Site Name" value={settings?.site_name || ''} onChange={e => setSettings(prev => prev ? { ...prev, site_name: e.target.value } : prev)} />
            <Input label="Tagline" value={settings?.tagline || ''} onChange={e => setSettings(prev => prev ? { ...prev, tagline: e.target.value } : prev)} />
            <Input label="Logo URL" value={settings?.logo_url || ''} onChange={e => setSettings(prev => prev ? { ...prev, logo_url: e.target.value } : prev)} />
            <Input label="Favicon URL" value={settings?.favicon_url || ''} onChange={e => setSettings(prev => prev ? { ...prev, favicon_url: e.target.value } : prev)} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Email" value={settings?.contact_email || ''} onChange={e => setSettings(prev => prev ? { ...prev, contact_email: e.target.value } : prev)} />
            <Input label="Phone" value={settings?.contact_phone || ''} onChange={e => setSettings(prev => prev ? { ...prev, contact_phone: e.target.value } : prev)} />
            <div className="md:col-span-2">
              <Input label="Address" value={settings?.contact_address || ''} onChange={e => setSettings(prev => prev ? { ...prev, contact_address: e.target.value } : prev)} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Facebook URL" value={settings?.social_facebook || ''} onChange={e => setSettings(prev => prev ? { ...prev, social_facebook: e.target.value } : prev)} />
            <Input label="Instagram URL" value={settings?.social_instagram || ''} onChange={e => setSettings(prev => prev ? { ...prev, social_instagram: e.target.value } : prev)} />
            <Input label="Twitter URL" value={settings?.social_twitter || ''} onChange={e => setSettings(prev => prev ? { ...prev, social_twitter: e.target.value } : prev)} />
            <Input label="YouTube URL" value={settings?.social_youtube || ''} onChange={e => setSettings(prev => prev ? { ...prev, social_youtube: e.target.value } : prev)} />
            <Input label="LinkedIn URL" value={settings?.social_linkedin || ''} onChange={e => setSettings(prev => prev ? { ...prev, social_linkedin: e.target.value } : prev)} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">SEO Defaults</h2>
          <div className="grid gap-4">
            <Input label="Default Page Title" value={settings?.seo_default_title || ''} onChange={e => setSettings(prev => prev ? { ...prev, seo_default_title: e.target.value } : prev)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea value={settings?.seo_default_description || ''} onChange={e => setSettings(prev => prev ? { ...prev, seo_default_description: e.target.value } : prev)} rows={3} placeholder="Enter default meta description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <Input label="Default OG Image URL" value={settings?.seo_default_image || ''} onChange={e => setSettings(prev => prev ? { ...prev, seo_default_image: e.target.value } : prev)} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Footer</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Description</label>
              <textarea value={settings?.footer_description || ''} onChange={e => setSettings(prev => prev ? { ...prev, footer_description: e.target.value } : prev)} rows={3} placeholder="Enter footer description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <Input label="Copyright Text" value={settings?.footer_copyright || ''} onChange={e => setSettings(prev => prev ? { ...prev, footer_copyright: e.target.value } : prev)} />
            <Input label="Nonprofit Tagline" value={settings?.footer_nonprofit_text || ''} onChange={e => setSettings(prev => prev ? { ...prev, footer_nonprofit_text: e.target.value } : prev)} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Donation Settings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Input label="Default Currency" value={settings?.donation_default_currency || 'USD'} onChange={e => setSettings(prev => prev ? { ...prev, donation_default_currency: e.target.value } : prev)} />
            <Input label="Min Amount" type="number" value={String(settings?.donation_min_amount ?? 1)} onChange={e => setSettings(prev => prev ? { ...prev, donation_min_amount: Number(e.target.value) } : prev)} />
            <Input label="Max Amount" type="number" value={String(settings?.donation_max_amount ?? 100000)} onChange={e => setSettings(prev => prev ? { ...prev, donation_max_amount: Number(e.target.value) } : prev)} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Announcement Banner</h2>
          <div className="grid gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={settings?.announcement_enabled || false} onChange={e => setSettings(prev => prev ? { ...prev, announcement_enabled: e.target.checked } : prev)} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <span className="text-sm text-gray-700">Enable announcement banner</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
              <textarea value={settings?.announcement_text || ''} onChange={e => setSettings(prev => prev ? { ...prev, announcement_text: e.target.value } : prev)} rows={2} placeholder="Enter announcement text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
              <select value={settings?.announcement_type || 'info'} onChange={e => setSettings(prev => prev ? { ...prev, announcement_type: e.target.value as 'info' | 'warning' | 'success' | 'error' } : prev)} title="Banner type" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Maintenance Mode</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={settings?.maintenance_mode || false} onChange={e => setSettings(prev => prev ? { ...prev, maintenance_mode: e.target.checked } : prev)} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
            <span className="text-sm text-gray-700">Enable maintenance mode</span>
          </label>
          {settings?.maintenance_mode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
              <textarea value={settings?.maintenance_message || ''} onChange={e => setSettings(prev => prev ? { ...prev, maintenance_message: e.target.value } : prev)} rows={2} placeholder="Enter maintenance message" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          )}
        </section>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
