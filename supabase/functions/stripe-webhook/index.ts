import { serve } from 'std/http/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders, jsonOk, jsonError, handleError, logError } from '../_shared/response.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-02-24.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

async function markProcessed(eventId: string, eventType: string, details: unknown): Promise<boolean> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .insert({ event_id: eventId, event_type: eventType, details })
  if (!error) return true
  if (error.code === '23505') return false
  throw error
}

function rpcOrThrow(name: string, payload: Record<string, unknown>) {
  return supabase.rpc(name, payload).then(({ error }) => {
    if (error) throw error
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return jsonError('Missing stripe-signature header', 'INVALID_SIGNATURE', 400)
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    logError('stripe-webhook/signature', err)
    return jsonError('Webhook signature verification failed.', 'INVALID_SIGNATURE', 400)
  }

  try {
    const isNew = await markProcessed(event.id, event.type, event.data.object)
    if (!isNew) {
      return jsonOk({ received: true, duplicate: true }, 200)
    }
  } catch (err) {
    return handleError('stripe-webhook/record', err, 'DATABASE_ERROR', 500)
  }

  const pi = event.data.object as Stripe.PaymentIntent
  const sessionId = pi.metadata?.session_id

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        if (!sessionId) return jsonOk({ received: true, skipped: 'no session_id' }, 200)
        await rpcOrThrow('stripe_confirm_payment', {
          p_session_id: sessionId,
          p_transaction_id: pi.id,
        })
        break
      }
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        if (!sessionId) return jsonOk({ received: true, skipped: 'no session_id' }, 200)
        await rpcOrThrow('stripe_fail_payment', {
          p_session_id: sessionId,
          p_status: event.type === 'payment_intent.payment_failed' ? 'failed' : 'cancelled',
        })
        break
      }
      default:
        break
    }
    return jsonOk({ received: true }, 200)
  } catch (err) {
    logError('stripe-webhook/process', err)
    return jsonError('Failed to process payment event.', 'PAYMENT_PROCESSING_FAILED', 500)
  }
})
