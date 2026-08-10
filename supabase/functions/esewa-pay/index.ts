import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonOk, jsonError, handleError, getCallerUserId } from '../_shared/response.ts'
import { getEsewaConfig, formatAmount, buildSignedMessage, hmacSha256 } from '../_shared/esewa.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    console.log('[esewa-pay] Request received')

    const config = getEsewaConfig()
    if (!config.secretKey) {
      console.log('[esewa-pay] Configuration error: missing secret key')
      return jsonError('eSewa is not configured. Set ESEWA_SECRET_KEY.', 'GATEWAY_NOT_CONFIGURED', 503)
    }

    const { sessionId, returnUrl } = await req.json().catch(() => ({}))
    console.log('[esewa-pay] Request params', { hasSessionId: !!sessionId, hasReturnUrl: !!returnUrl })

    if (!sessionId || typeof sessionId !== 'string') {
      console.log('[esewa-pay] Validation failed: missing session id')
      return jsonError('Payment session id is required.', 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('[esewa-pay] Fetching payment session', { sessionId })
    const { data: session, error } = await supabase
      .from('payment_sessions')
      .select('id, amount, gateway, status, transaction_id, donor_id, currency')
      .eq('id', sessionId)
      .maybeSingle()

    if (error) {
      console.log('[esewa-pay] Database error', { error: error.message })
      throw error
    }
    if (!session) {
      console.log('[esewa-pay] Session not found', { sessionId })
      return jsonError('Payment session not found.', 'SESSION_NOT_FOUND', 404)
    }
    if (session.gateway !== 'esewa') {
      console.log('[esewa-pay] Invalid gateway', { gateway: session.gateway })
      return jsonError('Payment session is not for eSewa.', 'INVALID_GATEWAY', 400)
    }
    if (session.status !== 'pending') {
      console.log('[esewa-pay] Invalid status', { status: session.status })
      return jsonError('Payment session is not ready for payment.', 'INVALID_STATE', 409)
    }

    console.log('[esewa-pay] Session retrieved', { 
      sessionId, 
      amount: session.amount, 
      currency: session.currency,
      gateway: session.gateway,
      status: session.status 
    })

    const callerId = getCallerUserId(req)
    if (!callerId || !session.donor_id || callerId !== session.donor_id) {
      console.log('[esewa-pay] Authorization failed', { callerId, donorId: session.donor_id })
      return jsonError('You are not authorized to start this payment.', 'FORBIDDEN', 403)
    }

    const transactionUuid = (session.transaction_id || session.id) as string
    const totalAmount = formatAmount(Number(session.amount))
    console.log('[esewa-pay] Creating signature', { 
      transactionUuid, 
      totalAmount, 
      merchantCode: config.merchantCode 
    })

    const signature = await hmacSha256(config.secretKey, buildSignedMessage(totalAmount, transactionUuid, config.merchantCode))

    const base = (returnUrl && typeof returnUrl === 'string' ? returnUrl : config.returnBaseUrl).replace(/\/$/, '')
    if (!base) {
      console.log('[esewa-pay] Missing return URL')
      return jsonError('A return URL is required for the eSewa callback.', 'VALIDATION_ERROR', 400)
    }

    const fields = {
      amount: totalAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: config.merchantCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      tax_amount: '0',
      success_url: `${base}/donate/esewa/return?session=${sessionId}`,
      failure_url: `${base}/donate/esewa/return?session=${sessionId}&failed=1`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    }

    console.log('[esewa-pay] Payment initiated successfully', { transactionUuid, environment: config.environment })

    return jsonOk({
      environment: config.environment,
      pay_url: config.payUrl,
      fields,
    }, 200)
  } catch (err) {
    console.log('[esewa-pay] Request failed', { error: err instanceof Error ? err.message : 'Unknown error' })
    return handleError('esewa-pay', err, 'ESEWA_PAYMENT_FAILED', 500)
  }
})
