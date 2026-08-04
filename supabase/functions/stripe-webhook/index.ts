import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-02-24.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

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
    if (error) throw new Error(`${name}: ${error.message}`)
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return json({ error: 'Missing stripe-signature header' }, 400)
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return json({ error: `Webhook signature verification failed: ${message}` }, 400)
  }

  try {
    const isNew = await markProcessed(event.id, event.type, event.data.object)
    if (!isNew) {
      return json({ received: true, duplicate: true }, 200)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not record event'
    return json({ error: message }, 500)
  }

  const pi = event.data.object as Stripe.PaymentIntent
  const sessionId = pi.metadata?.session_id

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        if (!sessionId) return json({ received: true, skipped: 'no session_id' }, 200)
        await rpcOrThrow('stripe_confirm_payment', {
          p_session_id: sessionId,
          p_transaction_id: pi.id,
        })
        break
      }
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        if (!sessionId) return json({ received: true, skipped: 'no session_id' }, 200)
        await rpcOrThrow('stripe_fail_payment', {
          p_session_id: sessionId,
          p_status: event.type === 'payment_intent.payment_failed' ? 'failed' : 'cancelled',
        })
        break
      }
      default:
        break
    }
    return json({ received: true }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json({ error: `Failed to process event: ${message}` }, 500)
  }
})
