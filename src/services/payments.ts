import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import { markDonorAsVerified } from './profiles'
import { logger } from '../lib/logger'
import { AppError, ErrorCodes, getErrorMessage } from '../lib/errors'
import type {
  PaymentSession,
  PaymentVerification,
  PaymentReceipt,
  DonationWithPayment,
  PaymentGateway,
  PaymentSessionStatus,
  PaymentCheckoutResponse,
} from '../types/payments'
const supabase = getSupabaseClient()

function extractCheckoutResponse(data: unknown): PaymentCheckoutResponse {
  if (!data) return {}
  const rows = Array.isArray(data) ? data : [data]
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const record = row as Record<string, unknown>
    if (typeof record.session_id === 'string' || typeof record.payment_id === 'string') {
      return record as unknown as PaymentCheckoutResponse
    }
    for (const value of Object.values(record)) {
      if (typeof value === 'object' && value !== null) {
        const nested = value as Record<string, unknown>
        if (typeof nested.session_id === 'string' || typeof nested.payment_id === 'string') {
          return nested as unknown as PaymentCheckoutResponse
        }
      }
    }
  }
  return {}
}

export async function initiatePaymentCheckout(
  amount: number,
  frequency: 'one-time' | 'monthly' | 'annual',
  gateway: PaymentGateway,
  studentId?: string | null,
  message?: string | null,
  idempotencyKey?: string | null,
): Promise<{ sessionId: string; transactionId: string | null }> {
  logger.info('payment.checkout.start', { gateway, amount, frequency, hasStudentId: !!studentId })

  const { data, error } = await supabase.rpc('initiate_payment_checkout', {
    p_amount: amount,
    p_frequency: frequency,
    p_gateway: gateway,
    p_idempotency_key: idempotencyKey || null,
    p_message: message || null,
    p_student_id: studentId || null,
  })

  if (error) {
    logger.error('payment.checkout.rpc_error', { code: error.code, message: error.message })
    throw error
  }

  const response = extractCheckoutResponse(data)

  if (response.success === false) {
    logger.warn('payment.checkout.rejected', { message: response.message ?? 'Payment initiation failed' })
    throw new AppError(getErrorMessage(response.message, 'Payment initiation failed'), {
      code: ErrorCodes.PAYMENT_FAILED,
      retryable: true,
    })
  }

  const sessionId = (response.payment_id || response.session_id) as string
  const transactionId = (response.transaction_id) as string | null

  if (!sessionId) {
    logger.error('payment.checkout.no_session_id', {
      responseShape: Array.isArray(data) ? 'array' : typeof data,
    })
    throw new Error('No payment session ID returned')
  }

  logger.info('payment.checkout.created', { sessionId, hasTransactionId: !!transactionId })

  await logAuditEvent({
    action: 'payment_session.created',
    entityType: 'payment_sessions',
    entityId: sessionId,
    metadata: { gateway, amount, frequency },
  })

  return { sessionId, transactionId }
}

export async function cancelPaymentSession(sessionId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_payment_session', {
    p_session_id: sessionId,
  })

  if (error) throw error

  await logAuditEvent({
    action: 'payment_session.cancelled',
    entityType: 'payment_sessions',
    entityId: sessionId,
  })
}

export async function submitPaymentConfirmation(
  sessionId: string,
  screenshots: string[] = [],
  paymentReference?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('submit_payment_confirmation', {
    p_session_id: sessionId,
    p_screenshots: screenshots,
    p_payment_reference: paymentReference || null,
  })

  if (error) throw error

  await logAuditEvent({
    action: 'payment_session.submitted',
    entityType: 'payment_sessions',
    entityId: sessionId,
    metadata: { screenshotsCount: screenshots.length },
  })
}

export async function verifyPayment(
  sessionId: string,
  status: 'verified' | 'rejected' | 'failed',
  notes?: string,
): Promise<void> {
  const { data: session, error: sessionError } = await supabase
    .from('payment_sessions')
    .select('donor_id')
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError

  const { error } = await supabase.rpc('verify_payment', {
    p_session_id: sessionId,
    p_status: status,
    p_notes: notes || null,
  })

  if (error) throw error

  await logAuditEvent({
    action: `payment_session.${status}`,
    entityType: 'payment_sessions',
    entityId: sessionId,
    metadata: { notes },
  })

  if (status === 'verified' && session?.donor_id) {
    await markDonorAsVerified(session.donor_id)
  }
}

export async function getDonorDonationsWithPayment(donorId: string): Promise<DonationWithPayment[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      payment_session:payment_sessions!inner(*),
      receipt:payment_receipts(*)
    `)
    .eq('donor_id', donorId)
    .eq('payment_session.status', 'completed')
    .order('created_at', { ascending: false })

  if (error) throw error
  const donations = (data || []) as unknown as DonationWithPayment[]
  return donations.map((d) => ({
    ...d,
    status: d.payment_session?.status === 'completed' && d.status === 'pending' ? 'completed' : d.status,
  }))
}

export async function getDonorPaymentSessions(donorId: string): Promise<PaymentSession[]> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('id, donor_id, amount, frequency, gateway, status, created_at')
    .eq('donor_id', donorId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as PaymentSession[]
}

export async function getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('id, donor_id, amount, frequency, gateway, status, created_at')
    .eq('id', sessionId)
    .single()

  if (error) return null
  return data as unknown as PaymentSession | null
}

export async function getPaymentVerifications(sessionId: string): Promise<PaymentVerification[]> {
  const { data, error } = await supabase
    .from('payment_verifications')
    .select('id, payment_session_id, verified_by, action, notes, created_at')
    .eq('payment_session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as PaymentVerification[]
}

export async function getPaymentReceipt(donationId: string): Promise<PaymentReceipt | null> {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select('id, donation_id, receipt_number, receipt_data, generated_at')
    .eq('donation_id', donationId)
    .single()

  if (error) return null
  return data as unknown as PaymentReceipt | null
}

export async function getAllPaymentSessions(status?: PaymentSessionStatus): Promise<PaymentSession[]> {
  let query = supabase
    .from('payment_sessions')
    .select('*, donation:donations(*), donor:profiles!payment_sessions_donor_id_fkey(id, full_name, email)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as unknown as PaymentSession[]
}

export async function getPendingVerifications(): Promise<PaymentSession[]> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('*, donation:donations(*), donor:profiles!payment_sessions_donor_id_fkey(id, full_name, email)')
    .eq('status', 'processing')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as PaymentSession[]
}

export async function uploadPaymentScreenshot(
  sessionId: string,
  file: File,
): Promise<string> {
  const { data: session } = await supabase
    .from('payment_sessions')
    .select('donor_id')
    .eq('id', sessionId)
    .maybeSingle()

  const userId = session?.donor_id
  if (!userId) throw new Error('Session not found')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`)
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit')
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
    throw new Error(`Invalid file extension: .${fileExt}`)
  }
  const sanitizedName = `${sessionId}-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${sanitizedName}`

  const { error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function getPaymentStats() {
  const { data: sessions, error } = await supabase
    .from('payment_sessions')
    .select('status, amount')

  if (error) throw error

  const stats = {
    total: sessions.length,
    totalAmount: sessions.reduce((s, p) => s + Number(p.amount), 0),
    pending: sessions.filter(s => s.status === 'pending').length,
    processing: sessions.filter(s => s.status === 'processing').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    rejected: sessions.filter(s => s.status === 'rejected').length,
    failed: sessions.filter(s => s.status === 'failed').length,
    completedAmount: sessions
      .filter(s => s.status === 'completed')
      .reduce((s, p) => s + Number(p.amount), 0),
    awaitingVerification: sessions
      .filter(s => s.status === 'processing')
      .reduce((s, p) => s + Number(p.amount), 0),
    processingCount: sessions.filter(s => s.status === 'processing').length,
  }

  return stats
}
