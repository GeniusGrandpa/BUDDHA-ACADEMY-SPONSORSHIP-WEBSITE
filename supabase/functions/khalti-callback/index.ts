import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonOk, jsonError, handleError, logError, getCallerUserId } from '../_shared/response.ts'
import { getKhaltiConfig, paisaToNpr } from '../_shared/khalti.ts'

interface KhaltiLookupResult {
  pidx?: string
  total_amount?: number
  status?: string
  transaction_id?: string | null
  fee?: number
  refunded?: boolean
}

async function lookupPayment(pidx: string, secretKey: string, apiBaseUrl: string): Promise<KhaltiLookupResult> {
  const response = await fetch(`${apiBaseUrl}/epayment/lookup/`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
  })

  if (!response.ok) {
    throw new Error(`Khalti lookup endpoint responded ${response.status}`)
  }

  return (await response.json().catch(() => ({}))) as KhaltiLookupResult
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    console.log('[khalti-callback] Request received')

    const config = getKhaltiConfig()
    const { sessionId, pidx } = await req.json().catch(() => ({}))
    
    console.log('[khalti-callback] Request params', { hasSessionId: !!sessionId, hasPidx: !!pidx })

    if (!config.secretKey) {
      console.log('[khalti-callback] Configuration error: missing secret key')
      return jsonError('Khalti is not configured. Set KHALTI_SECRET_KEY.', 'GATEWAY_NOT_CONFIGURED', 503)
    }
    if (!sessionId || typeof sessionId !== 'string') {
      console.log('[khalti-callback] Validation failed: missing session id')
      return jsonError('Payment session id is required.', 'VALIDATION_ERROR', 400)
    }
    if (!pidx || typeof pidx !== 'string') {
      console.log('[khalti-callback] Validation failed: missing pidx')
      return jsonError('Khalti pidx is required.', 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('[khalti-callback] Fetching payment session', { sessionId })
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('id, amount, gateway, status, transaction_id, donor_id, currency')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.log('[khalti-callback] Database error', { error: sessionError.message })
      throw sessionError
    }
    if (!session) {
      console.log('[khalti-callback] Session not found', { sessionId })
      return jsonError('Payment session not found.', 'SESSION_NOT_FOUND', 404)
    }
    if (session.gateway !== 'khalti') {
      console.log('[khalti-callback] Invalid gateway', { gateway: session.gateway })
      return jsonError('Payment session is not for Khalti.', 'INVALID_GATEWAY', 400)
    }

    console.log('[khalti-callback] Session retrieved', { 
      sessionId, 
      amount: session.amount, 
      currency: session.currency,
      gateway: session.gateway,
      status: session.status 
    })

    const callerId = getCallerUserId(req)
    if (!callerId || !session.donor_id || callerId !== session.donor_id) {
      console.log('[khalti-callback] Authorization failed', { callerId, donorId: session.donor_id })
      return jsonError('You are not authorized to update this payment session.', 'FORBIDDEN', 403)
    }

    if (session.status === 'completed') {
      console.log('[khalti-callback] Already completed', { sessionId })
      return jsonOk({ status: 'confirmed', transaction_id: session.transaction_id }, 200)
    }

    console.log('[khalti-callback] Looking up payment', { pidx })
    const lookup = await lookupPayment(pidx, config.secretKey, config.apiBaseUrl)
    const status = lookup.status ?? ''

    console.log('[khalti-callback] Payment status', { status, pidx })

    if (status === 'Completed') {
      const returnedAmount = paisaToNpr(Number(lookup.total_amount))
      const sessionAmount = Number(session.amount)
      if (Math.abs(returnedAmount - sessionAmount) > 0.01) {
        console.log('[khalti-callback] Amount mismatch', { returnedAmount, sessionAmount })
        logError('khalti-callback/amount', new Error(`amount mismatch: ${returnedAmount} vs ${sessionAmount}`))
        return jsonError('Payment amount does not match.', 'AMOUNT_MISMATCH', 400)
      }

      const transactionId = (lookup.transaction_id || session.transaction_id) as string

      console.log('[khalti-callback] Confirming payment', { sessionId, transactionId, currency: session.currency })
      const { error: confirmError } = await supabase.rpc('khalti_confirm_payment', {
        p_session_id: sessionId,
        p_transaction_id: transactionId,
        p_currency: session.currency || 'NPR',
      })
      if (confirmError) {
        console.log('[khalti-callback] Confirmation failed', { error: confirmError.message })
        throw confirmError
      }

      console.log('[khalti-callback] Payment confirmed successfully', { sessionId, transactionId })

      return jsonOk({ status: 'confirmed', transaction_id: transactionId }, 200)
    }

    if (status === 'User canceled' || status === 'Expired' || status === 'Canceled') {
      console.log('[khalti-callback] Payment cancelled/expired', { status })
      const failStatus = status === 'Expired' ? 'failed' : 'cancelled'
      const { error: failError } = await supabase.rpc('khalti_fail_payment', {
        p_session_id: sessionId,
        p_status: failStatus,
      })
      if (failError) throw failError

      return jsonOk({ status: failStatus === 'cancelled' ? 'cancelled' : 'failed' }, 200)
    }

    // Initiated / Pending / Refunded / unknown -> hold for confirmation
    console.log('[khalti-callback] Payment processing', { status })
    logError('khalti-callback/status', new Error(`unexpected status ${status}`))
    return jsonOk({ status: 'processing' }, 200)
  } catch (err) {
    console.log('[khalti-callback] Request failed', { error: err instanceof Error ? err.message : 'Unknown error' })
    return handleError('khalti-callback', err, 'KHALTI_CONFIRM_FAILED', 500)
  }
})