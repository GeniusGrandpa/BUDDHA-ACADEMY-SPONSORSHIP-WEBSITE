export interface ImpactBreakdown {
  amount: number
  label: string
  description: string
  icon: string
}

export interface DonationFormData {
  amount: number
  customAmount: string
  frequency: 'one-time' | 'monthly' | 'annual'
  studentId: string
  message: string
}

export interface StudentSummary {
  id: string
  name: string
  age: number
  grade: string
  photo_url: string | null
  dream_career: string | null
  sponsorship_status: string
}
