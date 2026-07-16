import { getSupabaseClient } from '../lib/supabase'

const supabase = getSupabaseClient()

export async function createPaymentIntent(
  amount: number,
  currency = 'npr',
  metadata: Record<string, string> = {},
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, currency, metadata },
  })

  if (error) throw new Error(error.message || 'Failed to create payment intent')
  if (!data?.clientSecret) throw new Error('No client secret returned')

  return data.clientSecret as string
}