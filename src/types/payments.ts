export type PaymentGateway = 'khalti' | 'esewa' | 'mobile_banking'
export type DonationStatus = 'pending' | 'processing' | 'verified' | 'completed' | 'failed' | 'rejected' | 'cancelled'
export type PaymentSessionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type VerificationAction = 'submitted' | 'processing' | 'verified' | 'rejected' | 'failed' | 'expired' | 'cancelled'

export interface PaymentSetting {
  id: string
  gateway_name: PaymentGateway
  gateway_display_name: string
  gateway_description: string | null
  qr_image_url: string | null
  account_name: string
  account_number: string
  instructions: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PaymentSession {
  id: string
  donation_id: string | null
  donor_id: string
  gateway: string
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
  student_id: string | null
  message: string | null
  transaction_id: string | null
  payment_reference: string | null
  idempotency_key: string | null
  screenshots: string[]
  status: PaymentSessionStatus
  verified_by: string | null
  verified_at: string | null
  verification_notes: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  donor?: {
    id: string
    full_name: string
    email: string
  }
}

export interface PaymentVerification {
  id: string
  payment_session_id: string
  verified_by: string | null
  action: VerificationAction
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface PaymentReceipt {
  id: string
  payment_session_id: string
  donation_id: string
  receipt_number: string
  receipt_data: {
    generated_at?: string
    amount?: number
    gateway?: string
    transaction_id?: string
    currency?: string
  }
  generated_at: string
}

export interface PaymentAuditLog {
  id: string
  payment_session_id: string | null
  action: string
  actor_id: string | null
  actor_role: string | null
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface DonationWithPayment {
  id: string
  donor_id: string
  student_id: string | null
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
  status: DonationStatus
  message: string | null
  transaction_id: string | null
  payment_method: string | null
  payment_session_id: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
  payment_session?: PaymentSession | null
  receipt?: PaymentReceipt | null
}

export interface PaymentCheckoutResponse {
  success?: boolean
  message?: string
  payment_id?: string
  session_id?: string
  transaction_id?: string | null
}

export interface CheckoutState {
  step: 'method' | 'payment' | 'processing' | 'success' | 'failed'
  donationId: string | null
  sessionId: string | null
  gateway: PaymentGateway | null
  amount: number
  transactionId: string | null
}

export const GATEWAY_LABELS: Record<PaymentGateway, string> = {
  khalti: 'Khalti',
  esewa: 'eSewa',
  mobile_banking: 'Mobile Banking / Fonepay',
}

export const GATEWAY_DESCRIPTIONS: Record<PaymentGateway, string> = {
  khalti: 'Pay via Khalti digital wallet',
  esewa: 'Pay via eSewa online wallet',
  mobile_banking: 'Bank transfer or Fonepay',
}
