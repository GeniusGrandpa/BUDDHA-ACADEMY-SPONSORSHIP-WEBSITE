import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { PaymentSetting, PaymentGateway } from '../types/payments'
const supabase = getSupabaseClient()

export async function getActivePaymentSettings(): Promise<PaymentSetting[]> {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as PaymentSetting[]
}

export async function getAllPaymentSettings(): Promise<PaymentSetting[]> {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as PaymentSetting[]
}

export async function updatePaymentSetting(
  id: string,
  updates: Partial<PaymentSetting>,
): Promise<PaymentSetting> {
  const { data, error } = await supabase
    .from('payment_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logAuditEvent({
    action: 'payment_settings.updated',
    entityType: 'payment_settings',
    entityId: id,
    changes: updates,
  })

  return data as unknown as PaymentSetting
}

export async function createPaymentSetting(
  setting: Omit<PaymentSetting, 'id' | 'created_at' | 'updated_at'>,
): Promise<PaymentSetting> {
  const { data, error } = await supabase
    .from('payment_settings')
    .insert(setting)
    .select()
    .single()

  if (error) throw error

  await logAuditEvent({
    action: 'payment_settings.created',
    entityType: 'payment_settings',
    entityId: data.id,
    metadata: setting,
  })

  return data as unknown as PaymentSetting
}

export async function togglePaymentGateway(
  id: string,
  isActive: boolean,
): Promise<PaymentSetting> {
  return updatePaymentSetting(id, { is_active: isActive })
}

export async function uploadQRCode(
  file: File,
): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`)
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `qr-codes/${Date.now()}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('payment-qr-codes')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('payment-qr-codes')
    .getPublicUrl(filePath)

  let publicUrl = urlData.publicUrl

  if (!publicUrl.startsWith('http://') && !publicUrl.startsWith('https://')) {
    publicUrl = `https://${publicUrl}`
  }

  return publicUrl
}

export async function getPaymentSettingByGateway(
  gateway: PaymentGateway,
): Promise<PaymentSetting | null> {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('gateway_name', gateway)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as unknown as PaymentSetting | null
}
