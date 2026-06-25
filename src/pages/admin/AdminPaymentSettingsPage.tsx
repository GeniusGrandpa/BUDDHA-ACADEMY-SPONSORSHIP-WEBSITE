import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { getAllPaymentSettings, updatePaymentSetting, togglePaymentGateway, createPaymentSetting, uploadQRCode } from '../../services/paymentSettings'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { FormSkeleton } from '../../components/ui/LoadingSkeleton'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import type { PaymentSetting, PaymentGateway } from '../../types/payments'

export function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGateway, setNewGateway] = useState({
    gateway_name: '' as PaymentGateway | '',
    gateway_display_name: '',
    gateway_description: '',
    qr_image_url: null as string | null,
    account_name: '',
    account_number: '',
    instructions: null as string | null,
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await getAllPaymentSettings()
      setSettings(data)
    } catch (err) {
      console.error('Error loading payment settings:', err)
      toast.error('Failed to load payment settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    setSaving(id)
    try {
      await togglePaymentGateway(id, !current)
      await loadSettings()
    } catch (err) {
      console.error('Error toggling payment gateway:', err)
      toast.error('Failed to update payment gateway')
    } finally {
      setSaving(null)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<PaymentSetting>) => {
    setSaving(id)
    try {
      await updatePaymentSetting(id, updates)
      await loadSettings()
    } catch (err) {
      console.error('Error updating payment setting:', err)
      toast.error('Failed to update payment setting')
    } finally {
      setSaving(null)
    }
  }

  const handleAddGateway = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGateway.gateway_name) return
    setSaving('__new__')
    try {
      await createPaymentSetting({
        gateway_name: newGateway.gateway_name as PaymentGateway,
        gateway_display_name: newGateway.gateway_display_name,
        gateway_description: newGateway.gateway_description || null,
        qr_image_url: newGateway.qr_image_url,
        account_name: newGateway.account_name,
        account_number: newGateway.account_number,
        instructions: newGateway.instructions,
        is_active: true,
        sort_order: settings.length + 1,
      })
      toast.success('Gateway added successfully')
      setShowAddForm(false)
      setNewGateway({
        gateway_name: '',
        gateway_display_name: '',
        gateway_description: '',
        qr_image_url: null,
        account_name: '',
        account_number: '',
        instructions: null,
        is_active: true,
        sort_order: 0,
      })
      await loadSettings()
    } catch (err) {
      console.error('Error adding gateway:', err)
      toast.error('Failed to add gateway')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-500 mt-1">Configure payment gateways and account details</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          Add Gateway
        </Button>
      </div>

      <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="font-medium text-gray-600 mb-1">Security Note</p>
        <p>Payment settings are stored securely in the database. QR codes and account information are only visible to authenticated users during checkout. All changes are logged in the audit trail.</p>
      </div>

      {showAddForm && (
        <Card variant="bordered" className="bg-white border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Gateway</h3>
          <form onSubmit={handleAddGateway} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gateway Name (key)</label>
                <select
                  required
                  value={newGateway.gateway_name}
                  onChange={(e) => setNewGateway({ ...newGateway, gateway_name: e.target.value as PaymentGateway })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                  aria-label="Select gateway"
                >
                  <option value="">Select gateway...</option>
                  <option value="khalti">khalti</option>
                  <option value="esewa">esewa</option>
                  <option value="mobile_banking">mobile_banking</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={newGateway.gateway_display_name}
                  onChange={(e) => setNewGateway({ ...newGateway, gateway_display_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g. Khalti"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={newGateway.account_name}
                  onChange={(e) => setNewGateway({ ...newGateway, account_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                  placeholder="Buddha Academy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={newGateway.account_number}
                  onChange={(e) => setNewGateway({ ...newGateway, account_number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                  placeholder="9800000000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">QR Image</label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    {newGateway.qr_image_url && (
                      <img src={newGateway.qr_image_url} alt="QR preview" className="h-20 w-20 object-contain rounded border border-gray-200" />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGateway.qr_image_url || ''}
                        onChange={(e) => setNewGateway({ ...newGateway, qr_image_url: e.target.value || null })}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                        placeholder="https://example.com/qr.png"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                        Upload
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const url = await uploadQRCode(file)
                              setNewGateway(prev => ({ ...prev, qr_image_url: url }))
                            } catch {
                              toast.error('Failed to upload QR image')
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Payment Instructions</label>
                <textarea
                  value={newGateway.instructions || ''}
                  onChange={(e) => setNewGateway({ ...newGateway, instructions: e.target.value || null })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                  placeholder="Instructions for donors..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving === '__new__'}>
                {saving === '__new__' ? 'Adding...' : 'Add Gateway'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {settings.map((setting) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="bordered" className="bg-white border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    setting.is_active ? 'bg-amber-500/20 text-amber-600' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {setting.gateway_display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">{setting.gateway_display_name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{setting.gateway_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${setting.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {setting.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggle(setting.id, setting.is_active)}
                    disabled={saving === setting.id}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {setting.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Account Name</label>
                  <input
                    type="text"
                    defaultValue={setting.account_name}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                    placeholder="Account name"
                    onBlur={(e) => {
                      if (e.target.value !== setting.account_name) {
                        handleUpdate(setting.id, { account_name: e.target.value })
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                  <input
                    type="text"
                    defaultValue={setting.account_number}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
                    placeholder="Account number"
                    onBlur={(e) => {
                      if (e.target.value !== setting.account_number) {
                        handleUpdate(setting.id, { account_number: e.target.value })
                      }
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">QR Image</label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      {setting.qr_image_url && (
                        <img src={setting.qr_image_url} alt="QR" className="h-20 w-20 object-contain rounded border border-gray-200" />
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={setting.qr_image_url || ''}
                          placeholder="https://example.com/qr.png"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                          onBlur={(e) => {
                            if (e.target.value !== (setting.qr_image_url || '')) {
                              handleUpdate(setting.id, { qr_image_url: e.target.value || null })
                            }
                          }}
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                          Upload
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={saving === setting.id}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setSaving(setting.id)
                              try {
                                const url = await uploadQRCode(file)
                                await handleUpdate(setting.id, { qr_image_url: url })
                              } catch {
                                toast.error('Failed to upload QR image')
                              } finally {
                                setSaving(null)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Payment Instructions</label>
                  <textarea
                    defaultValue={setting.instructions || ''}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                    placeholder="Payment instructions"
                    onBlur={(e) => {
                      if (e.target.value !== (setting.instructions || '')) {
                        handleUpdate(setting.id, { instructions: e.target.value || null })
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Sort Order: {setting.sort_order} | Last Updated: {new Date(setting.updated_at).toLocaleString()}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
