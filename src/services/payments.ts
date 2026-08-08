import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
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
    .select('id, donor_id, amount, frequency, gateway, status, transaction_id, created_at')
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
    .select('*, donation:donations(*, receipt:payment_receipts(*)), donor:profiles!payment_sessions_donor_id_fkey(id, full_name, email)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as unknown as PaymentSession[]
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
