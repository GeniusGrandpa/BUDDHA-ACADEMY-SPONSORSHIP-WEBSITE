export interface EsewaConfig {
  environment: 'uat' | 'production'
  merchantCode: string
  secretKey: string
  payUrl: string
  statusUrl: string
  returnBaseUrl: string
}

export function getEsewaConfig(): EsewaConfig {
  const environment = (Deno.env.get('ESEWA_ENVIRONMENT') ?? 'uat').toLowerCase() === 'production' ? 'production' : 'uat'
  const merchantCode = Deno.env.get('ESEWA_MERCHANT_CODE') ?? 'EPAYTEST'
  const secretKey = Deno.env.get('ESEWA_SECRET_KEY') ?? ''
  const payUrl = environment === 'production'
    ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
    : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
  const statusUrl = environment === 'production'
    ? 'https://esewa.com.np/api/epay/transaction/status'
    : 'https://rc-epay.esewa.com.np/api/epay/transaction/status'
  const returnBaseUrl = Deno.env.get('ESEWA_RETURN_URL') ?? ''
  return { environment, merchantCode, secretKey, payUrl, statusUrl, returnBaseUrl }
}

export function formatAmount(amount: number): string {
  return Number(amount).toFixed(2)
}

export function buildSignedMessage(totalAmount: string, transactionUuid: string, productCode: string): string {
  return `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
}

export async function hmacSha256(secretKey: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  const bytes = new Uint8Array(mac)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(binary)
}