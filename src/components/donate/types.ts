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

export const IMPACT_CARDS: ImpactBreakdown[] = [
  {
    amount: 1000,
    label: 'School Supplies for a Student',
    description: 'Provides notebooks, pens, stationery, and essential learning materials for one term.',
    icon: 'book',
  },
  {
    amount: 5000,
    label: 'Monthly Educational Support',
    description: 'Covers nutritious meals, educational materials, and daily learning resources for a student.',
    icon: 'book',
  },
  {
    amount: 10000,
    label: 'Full Sponsorship Assistance',
    description: 'Comprehensive monthly support including meals, materials, tuition, and uniform assistance.',
    icon: 'graduation',
  },
  {
    amount: 25000,
    label: 'Multi-Student Support',
    description: 'Extends sponsorship benefits to multiple students, amplifying educational impact across the community.',
    icon: 'users',
  },
]
