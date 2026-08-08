import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonOk, jsonError, handleError, getCallerUserId } from '../_shared/response.ts'
import { getKhaltiConfig, toPaisa } from '../_shared/khalti.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    const config = getKhaltiConfig()
    if (!config.secretKey) {
      return jsonError('Khalti is not configured. Set KHALTI_SECRET_KEY.', 'GATEWAY_NOT_CONFIGURED', 503)
    }

    const { sessionId, returnUrl } = await req.json().catch(() => ({}))
    if (!sessionId || typeof sessionId !== 'string') {
      return jsonError('Payment session id is required.', 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: session, error } = await supabase
      .from('payment_sessions')
      .select('id, amount, gateway, status, transaction_id, donor_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (error) throw error
    if (!session) {
      return jsonError('Payment session not found.', 'SESSION_NOT_FOUND', 404)
    }
    if (session.gateway !== 'khalti') {
      return jsonError('Payment session is not for Khalti.', 'INVALID_GATEWAY', 400)
    }
    if (session.status !== 'pending') {
      return jsonError('Payment session is not ready for payment.', 'INVALID_STATE', 409)
    }

    const callerId = getCallerUserId(req)
    if (!callerId || !session.donor_id || callerId !== session.donor_id) {
      return jsonError('You are not authorized to start this payment.', 'FORBIDDEN', 403)
    }

    const { data: donor, error: donorError } = await supabase
      .from('profiles')
      .select('full_name, email, phone, phone_code')
      .eq('id', session.donor_id)
      .maybeSingle()

    if (donorError && donorError.code !== 'PGRST116') throw donorError

    const purchaseOrderId = (session.transaction_id || session.id) as string
    const amountPaisa = toPaisa(Number(session.amount))

    const base = (returnUrl && typeof returnUrl === 'string' ? returnUrl : config.returnUrl).replace(/\/$/, '')
    const websiteUrl = config.websiteUrl || base
    if (!base) {
      return jsonError('A return URL is required for the Khalti callback.', 'VALIDATION_ERROR', 400)
    }

    const customerInfo: Record<string, string> = {}
    if (donor) {
      if (donor.full_name) customerInfo.name = donor.full_name
      if (donor.email) customerInfo.email = donor.email
      if (donor.phone) customerInfo.phone = donor.phone
    }

    const body: Record<string, unknown> = {
      return_url: `${base}/donate/khalti/return?session=${sessionId}`,
      website_url: websiteUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: 'Buddha Academy Donation',
    }
    if (Object.keys(customerInfo).length > 0) {
      body.customer_info = customerInfo
    }

    const initiateUrl = `${config.apiBaseUrl}/epayment/initiate/`
    const response = await fetch(initiateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json().catch(() => ({})) as Record<string, unknown>

    if (!response.ok || typeof result.pidx !== 'string' || typeof result.payment_url !== 'string') {
      const message = typeof result.detail === 'string'
        ? result.detail
        : `Khalti payment initiation failed (${response.status}).`
      console.log(JSON.stringify({ level: 'error', context: 'khalti-pay', message, status: response.status }))
      return jsonError(message, 'KHALTI_INITIATE_FAILED', 502)
    }

    console.log(JSON.stringify({ level: 'info', context: 'khalti-pay', message: `initiated ${purchaseOrderId} (${result.pidx})` }))

    return jsonOk({
      environment: config.environment,
      pidx: result.pidx,
      payment_url: result.payment_url,
      expires_at: result.expires_at ?? null,
      expires_in: result.expires_in ?? null,
    }, 200)
  } catch (err) {
    return handleError('khalti-pay', err, 'KHALTI_PAYMENT_FAILED', 500)
  }
})