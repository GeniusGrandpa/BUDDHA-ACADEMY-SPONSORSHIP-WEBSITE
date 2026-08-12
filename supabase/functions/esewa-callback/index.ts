import { createClient } from '@supabase/supabase-js'
import { corsHeaders, jsonOk, jsonError, handleError, logError, getCallerUserId } from '../_shared/response.ts'
import { getEsewaConfig, formatAmount, hmacSha256 } from '../_shared/esewa.ts'

interface EsewaCallbackPayload {
  transaction_code?: string
  status?: string
  total_amount?: number | string
  transaction_uuid?: string
  product_code?: string
  signed_field_names?: string
  signature?: string
  [key: string]: unknown
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function verifySignature(payload: EsewaCallbackPayload, secretKey: string, expected: Record<string, unknown>): Promise<boolean> {
  const names = (payload.signed_field_names ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
  if (names.length === 0) return false

  const message = names
    .map((name) => `${name}=${expected[name] ?? payload[name] ?? ''}`)
    .join(',')

  const computed = await hmacSha256(secretKey, message)
  return safeEqual(computed, payload.signature ?? '')
}

async function runTransactionStatus(
  statusUrl: string,
  productCode: string,
  totalAmount: string,
  transactionUuid: string,
): Promise<{ status: string }> {
  const url = `${statusUrl}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`eSewa status endpoint responded ${res.status}`)
  const body = await res.json().catch(() => ({})) as { status?: string }
  return { status: body.status ?? '' }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    console.log('[esewa-callback] Request received')

    const config = getEsewaConfig()
    const { sessionId, data, failed } = await req.json().catch(() => ({}))

    console.log('[esewa-callback] Request params', { hasSessionId: !!sessionId, hasData: !!data, failed })

    if (!sessionId || typeof sessionId !== 'string') {
      console.log('[esewa-callback] Validation failed: missing session id')
      return jsonError('Payment session id is required.', 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('[esewa-callback] Fetching payment session', { sessionId })
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('id, amount, gateway, status, transaction_id, donor_id, currency')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.log('[esewa-callback] Database error', { error: sessionError.message })
      throw sessionError
    }
    if (!session) {
      console.log('[esewa-callback] Session not found', { sessionId })
      return jsonError('Payment session not found.', 'SESSION_NOT_FOUND', 404)
    }
    if (session.gateway !== 'esewa') {
      console.log('[esewa-callback] Invalid gateway', { gateway: session.gateway })
      return jsonError('Payment session is not for eSewa.', 'INVALID_GATEWAY', 400)
    }

    console.log('[esewa-callback] Session retrieved', { 
      sessionId, 
      amount: session.amount, 
      currency: session.currency,
      gateway: session.gateway,
      status: session.status 
    })

    const callerId = getCallerUserId(req)
    if (!callerId || !session.donor_id || callerId !== session.donor_id) {
      console.log('[esewa-callback] Authorization failed', { callerId, donorId: session.donor_id })
      return jsonError('You are not authorized to update this payment session.', 'FORBIDDEN', 403)
    }

    if (failed === true || failed === 'true' || failed === '1') {
      console.log('[esewa-callback] Payment failed/cancelled', { sessionId })
      const { error: cancelError } = await supabase.rpc('cancel_payment_session', {
        p_session_id: sessionId,
      })
      if (cancelError) throw cancelError
      return jsonOk({ status: 'cancelled' }, 200)
    }

    if (!data || typeof data !== 'string') {
      console.log('[esewa-callback] Missing callback data')
      return jsonError('Missing eSewa response data.', 'INVALID_CALLBACK', 400)
    }

    console.log('[esewa-callback] Decoding callback data')
    const decoded = decodeURIComponent(data)
    const payload = JSON.parse(atob(decoded)) as EsewaCallbackPayload

    if (!payload.signature) {
      console.log('[esewa-callback] Missing signature')
      return jsonError('eSewa callback signature is missing.', 'INVALID_SIGNATURE', 400)
    }

    console.log('[esewa-callback] Verifying signature')
    const verified = await verifySignature(payload, config.secretKey, {
      total_amount: session.amount,
      transaction_uuid: session.transaction_id || session.id,
      product_code: config.merchantCode,
    })
    if (!verified) {
      console.log('[esewa-callback] Signature verification failed')
      logError('esewa-callback/verify', new Error('signature mismatch'))
      return jsonError('eSewa callback signature verification failed.', 'INVALID_SIGNATURE', 400)
    }

    console.log('[esewa-callback] Signature verified successfully')

    const returnedAmount = Number(payload.total_amount)
    const sessionAmount = Number(session.amount)
    if (Math.abs(returnedAmount - sessionAmount) > 0.01) {
      console.log('[esewa-callback] Amount mismatch', { returnedAmount, sessionAmount })
      logError('esewa-callback/amount', new Error(`amount mismatch: ${returnedAmount} vs ${sessionAmount}`))
      return jsonError('Payment amount does not match.', 'AMOUNT_MISMATCH', 400)
    }

    console.log('[esewa-callback] Checking transaction status')
    const statusResult = await runTransactionStatus(
      config.statusUrl,
      config.merchantCode,
      formatAmount(sessionAmount),
      (session.transaction_id || session.id) as string,
    )

    console.log('[esewa-callback] Transaction status', { status: statusResult.status })

    if (statusResult.status !== 'COMPLETE') {
      console.log('[esewa-callback] Transaction not complete', { status: statusResult.status })
      logError('esewa-callback/status', new Error(`unexpected status ${statusResult.status}`))
      return jsonOk({ status: 'processing' }, 200)
    }

    const transactionCode = (payload.transaction_code || session.transaction_id) as string

    console.log('[esewa-callback] eSewa transaction verified', { sessionId, transactionCode })

    /*
     * IMPORTANT: Do NOT call esewa_confirm_payment().
     * That function has been intentionally removed.
     * Mark payment_session as payment_received with pending_verification.
     * Finance/Admin must manually verify and approve.
     */
    const { error: updateError } = await supabase
      .from('payment_sessions')
      .update({
        status: 'payment_received',
        transaction_id: transactionCode,
        verification_status: 'pending_verification',
        verification_notes: 'eSewa transaction verified by callback. Awaiting manual Finance/Admin verification.',
      })
      .eq('id', sessionId)

    if (updateError) {
      console.log('[esewa-callback] Failed to update payment session', { error: updateError.message })
      throw updateError
    }

    console.log('[esewa-callback] Payment received and awaiting manual verification', { sessionId, transactionCode })

    return jsonOk({ status: 'pending_verification', transaction_id: transactionCode }, 200)
  } catch (err) {
    console.log('[esewa-callback] Request failed', { error: err instanceof Error ? err.message : 'Unknown error' })
    return handleError('esewa-callback', err, 'ESEWA_CONFIRM_FAILED', 500)
  }
})