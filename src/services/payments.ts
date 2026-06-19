import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
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

export async function initiatePaymentCheckout(
  amount: number,
  frequency: 'one-time' | 'monthly' | 'annual',
  gateway: PaymentGateway,
  studentId?: string | null,
  message?: string | null,
  idempotencyKey?: string | null,
): Promise<{ sessionId: string; transactionId: string | null }> {
  const { data, error } = await supabase.rpc('initiate_payment_checkout', {
    p_amount: amount,
    p_frequency: frequency,
    p_gateway: gateway,
    p_idempotency_key: idempotencyKey || null,
    p_message: message || null,
    p_student_id: studentId || null,
  })

  if (error) throw error

  
  const response = data as PaymentCheckoutResponse

  if (response && response.success === false) {
    throw new Error(response.message || 'Payment initiation failed')
  }

  const sessionId = (response?.payment_id || response?.session_id) as string
  const transactionId = (response?.transaction_id) as string | null

  if (!sessionId) {
    throw new Error('No payment session ID returned')
  }

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
  return (data || []) as unknown as DonationWithPayment[]
}

export async function getDonorPaymentSessions(donorId: string): Promise<PaymentSession[]> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('*')
    .eq('donor_id', donorId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) return null
  return data
}

export async function getPaymentVerifications(sessionId: string): Promise<PaymentVerification[]> {
  const { data, error } = await supabase
    .from('payment_verifications')
    .select('*')
    .eq('payment_session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getPaymentReceipt(donationId: string): Promise<PaymentReceipt | null> {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select('*')
    .eq('donation_id', donationId)
    .single()

  if (error) return null
  return data
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
  return data || []
}

/** Only sessions where donor submitted payment confirmation — not abandoned checkouts */
export async function getPendingVerifications(): Promise<PaymentSession[]> {
  const { data, error } = await supabase
    .from('payment_sessions')
    .select('*, donation:donations(*), donor:profiles!payment_sessions_donor_id_fkey(id, full_name, email)')
    .eq('status', 'processing')
    .is('donation_id', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function uploadPaymentScreenshot(
  sessionId: string,
  file: File,
): Promise<string> {
  const { data: session } = await supabase
    .from('payment_sessions')
    .select('donor_id')
    .eq('id', sessionId)
    .single()

  const userId = session?.donor_id
  if (!userId) throw new Error('Session not found')

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
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
