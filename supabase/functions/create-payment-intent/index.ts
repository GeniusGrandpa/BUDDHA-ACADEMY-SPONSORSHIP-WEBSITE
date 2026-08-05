import Stripe from 'npm:stripe@18.0.0'
import { corsHeaders, jsonOk, jsonError, handleError, safeMessage, logError } from '../_shared/response.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-02-24.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

function isStripeError(err: unknown): err is Stripe.errors.StripeError {
  return typeof err === 'object' && err !== null && (err as { type?: string }).type !== undefined
}

function stripeErrorMessage(err: Stripe.errors.StripeError, fallback: string): string {
  if (err.type === 'StripeCardError' || err.type === 'StripeInvalidRequestError') {
    return safeMessage(err, fallback)
  }
  return fallback
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    const { amount, currency = 'npr', metadata = {} } = await req.json()

    if (!amount || typeof amount !== 'number' || amount < 100) {
      return jsonError('Amount must be at least 100 (in the smallest currency unit).', 'VALIDATION_ERROR', 400)
    }

    let paymentIntent: Stripe.PaymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: String(currency).toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata,
      })
    } catch (err) {
      if (isStripeError(err)) {
        logError('create-payment-intent/stripe', err)
        const message = stripeErrorMessage(err, 'We could not start your payment. Please try again or choose another payment method.')
        return jsonError(message, 'PAYMENT_FAILED', 402)
      }
      throw err
    }

    return jsonOk({ clientSecret: paymentIntent.client_secret }, 200)
  } catch (err) {
    return handleError('create-payment-intent', err)
  }
})
