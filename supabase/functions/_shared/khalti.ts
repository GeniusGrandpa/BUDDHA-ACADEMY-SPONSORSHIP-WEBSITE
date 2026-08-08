export interface KhaltiConfig {
  environment: 'test' | 'production'
  secretKey: string
  websiteUrl: string
  returnUrl: string
  apiBaseUrl: string
  payBaseUrl: string
}

export function getKhaltiConfig(): KhaltiConfig {
  const environment = (Deno.env.get('KHALTI_ENVIRONMENT') ?? 'test').toLowerCase() === 'production' ? 'production' : 'test'
  const secretKey = Deno.env.get('KHALTI_SECRET_KEY') ?? ''
  const websiteUrl = Deno.env.get('KHALTI_WEBSITE_URL') ?? ''
  const returnUrl = Deno.env.get('KHALTI_RETURN_URL') ?? ''

  const apiBaseUrl = environment === 'production'
    ? 'https://khalti.com/api/v2'
    : 'https://dev.khalti.com/api/v2'
  const payBaseUrl = environment === 'production'
    ? 'https://pay.khalti.com'
    : 'https://test-pay.khalti.com'

  return { environment, secretKey, websiteUrl, returnUrl, apiBaseUrl, payBaseUrl }
}

export function toPaisa(amount: number): number {
  return Math.round(Number(amount) * 100)
}

export function paisaToNpr(paisa: number): number {
  return Number(paisa) / 100
}