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
    const config = getKhaltiConfig()
    const { sessionId, pidx } = await req.json().catch(() => ({}))
    if (!config.secretKey) {
      return jsonError('Khalti is not configured. Set KHALTI_SECRET_KEY.', 'GATEWAY_NOT_CONFIGURED', 503)
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return jsonError('Payment session id is required.', 'VALIDATION_ERROR', 400)
    }
    if (!pidx || typeof pidx !== 'string') {
      return jsonError('Khalti pidx is required.', 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('id, amount, gateway, status, transaction_id, donor_id')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) throw sessionError
    if (!session) {
      return jsonError('Payment session not found.', 'SESSION_NOT_FOUND', 404)
    }
    if (session.gateway !== 'khalti') {
      return jsonError('Payment session is not for Khalti.', 'INVALID_GATEWAY', 400)
    }

    const callerId = getCallerUserId(req)
    if (!callerId || !session.donor_id || callerId !== session.donor_id) {
      return jsonError('You are not authorized to update this payment session.', 'FORBIDDEN', 403)
    }

    if (session.status === 'completed') {
      return jsonOk({ status: 'confirmed', transaction_id: session.transaction_id }, 200)
    }

    const lookup = await lookupPayment(pidx, config.secretKey, config.apiBaseUrl)
    const status = lookup.status ?? ''

    if (status === 'Completed') {
      const returnedAmount = paisaToNpr(Number(lookup.total_amount))
      const sessionAmount = Number(session.amount)
      if (Math.abs(returnedAmount - sessionAmount) > 0.01) {
        logError('khalti-callback/amount', new Error(`amount mismatch: ${returnedAmount} vs ${sessionAmount}`))
        return jsonError('Payment amount does not match.', 'AMOUNT_MISMATCH', 400)
      }

      const transactionId = (lookup.transaction_id || session.transaction_id) as string

      const { error: confirmError } = await supabase.rpc('khalti_confirm_payment', {
        p_session_id: sessionId,
        p_transaction_id: transactionId,
      })
      if (confirmError) throw confirmError

      console.log(JSON.stringify({ level: 'info', context: 'khalti-callback', message: `confirmed ${sessionId} ${transactionId}` }))

      return jsonOk({ status: 'confirmed', transaction_id: transactionId }, 200)
    }

    if (status === 'User canceled' || status === 'Expired' || status === 'Canceled') {
      const failStatus = status === 'Expired' ? 'failed' : 'cancelled'
      const { error: failError } = await supabase.rpc('khalti_fail_payment', {
        p_session_id: sessionId,
        p_status: failStatus,
      })
      if (failError) throw failError

      return jsonOk({ status: failStatus === 'cancelled' ? 'cancelled' : 'failed' }, 200)
    }

    // Initiated / Pending / Refunded / unknown -> hold for confirmation
    logError('khalti-callback/status', new Error(`unexpected status ${status}`))
    return jsonOk({ status: 'processing' }, 200)
  } catch (err) {
    return handleError('khalti-callback', err, 'KHALTI_CONFIRM_FAILED', 500)
  }
})