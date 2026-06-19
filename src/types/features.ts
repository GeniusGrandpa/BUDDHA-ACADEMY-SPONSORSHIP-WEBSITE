import type { Donation, Sponsorship, Student, DonationAllocation, DonationStatus } from './database'
import type { PaymentSession, PaymentReceipt } from './payments'

export interface SponsorshipWithStudent extends Sponsorship {
  student: Student
}

export interface DonationWithStudent extends Donation {
  student?: Student | null
}

export interface DashboardData {
  donations: DonationWithStudent[]
  sponsorships: SponsorshipWithStudent[]
  donorStats: DonorStats
  loading: boolean
  error: string | null
}

export interface DonorStats {
  totalDonated: number
  totalDonations: number
  activeSponsorships: number
  totalSponsorships: number
  monthlyRecurring: number
  firstDonationDate: string | null
  lastDonationDate: string | null
}

export interface DonorImpact {
  meals_funded: number
  books_donated: number
  students_supported: number
  uniforms_provided: number
  total_donated: number
}

export type NotificationType =
  | 'donation_confirmation'
  | 'sponsorship_update'
  | 'teacher_report'
  | 'progress_update'
  | 'achievement'
  | 'volunteer_request'
  | 'payment_alert'
  | 'reminder'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  data: Record<string, unknown> | null
  read: boolean
  read_at: string | null
  created_at: string
}

export interface AchievementMilestone {
  type: 'start' | 'renewal' | 'donation' | 'report' | 'achievement' | 'milestone'
  title: string
  description: string
  date: string
  icon?: string
}

export type AllocationCategory = 'Educational Materials' | 'Student Meals' | 'School Supplies' | 'Uniform Support' | 'Events & Activities' | 'Operations'

export interface TransactionWithDetails extends Donation {
  payment_session?: PaymentSession | null
  receipt?: PaymentReceipt | null
  allocations?: DonationAllocation[]
}

export interface TeacherReport {
  id: string
  student_id: string
  teacher_id: string
  title: string
  summary: string | null
  subject: string | null
  grade_achieved: string | null
  attendance_rate: number | null
  achievements: string[]
  areas_for_improvement: string[]
  teacher_notes: string | null
  report_card_url: string | null
  report_date: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ActivityItem {
  id: string
  user_id: string | null
  activity_type: ActivityType
  title: string
  description: string | null
  metadata: Record<string, unknown>
  entity_type: string | null
  entity_id: string | null
  is_public: boolean
  created_at: string
}

export type ActivityType =
  | 'donation_received'
  | 'donation_verified'
  | 'sponsorship_started'
  | 'report_uploaded'
  | 'student_progress'
  | 'achievement'
  | 'volunteer_signup'
  | 'new_student'
  | 'impact_update'
  | 'payment_verified'
  | 'receipt_generated'
  | 'milestone'

export interface DonorDashboardStats {
  total_donated: number
  active_sponsorships: number
  total_students: number
  last_donation_date: string | null
  unread_notifications: number
}

export interface SponsorshipTimelineEvent {
  id: string
  sponsorship_id: string
  event_type: 'started' | 'donation' | 'report' | 'achievement' | 'milestone' | 'update' | 'renewal'
  title: string
  description: string | null
  icon: string | null
  event_date: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface CommunityStats {
  totalDonations: number
  totalAmount: number
  activeSponsors: number
  supportedStudents: number
  activeVolunteers: number
  pendingVerifications: number
  monthlyDonations: number
  monthlyAmount: number
}

export const ALLOCATION_CATEGORIES: AllocationCategory[] = [
  'Educational Materials',
  'Student Meals',
  'School Supplies',
  'Uniform Support',
  'Events & Activities',
  'Operations',
]

export const ALLOCATION_CATEGORY_LABELS: Record<AllocationCategory, string> = {
  'Educational Materials': 'Educational Materials',
  'Student Meals': 'Student Meals',
  'School Supplies': 'School Supplies',
  'Uniform Support': 'Uniform Support',
  'Events & Activities': 'Events & Activities',
  'Operations': 'Operations',
}

export const ALLOCATION_CATEGORY_ICONS: Record<AllocationCategory, string> = {
  'Educational Materials': 'book',
  'Student Meals': 'utensils',
  'School Supplies': 'backpack',
  'Uniform Support': 'shirt',
  'Events & Activities': 'calendar',
  'Operations': 'settings',
}

export const ALLOCATION_CATEGORY_COLORS: Record<AllocationCategory, string> = {
  'Educational Materials': '#F59E0B',
  'Student Meals': '#6B7280',
  'School Supplies': '#9CA3AF',
  'Uniform Support': '#10B981',
  'Events & Activities': '#D1D5DB',
  'Operations': '#78716C',
}

export const ALLOCATION_COLORS_ARRAY = [
  '#F59E0B', '#6B7280', '#9CA3AF',
  '#10B981', '#D1D5DB', '#78716C',
]

export const DEFAULT_ALLOCATIONS: { category: AllocationCategory; percentage: number }[] = [
  { category: 'Educational Materials', percentage: 30 },
  { category: 'Student Meals', percentage: 25 },
  { category: 'School Supplies', percentage: 15 },
  { category: 'Uniform Support', percentage: 15 },
  { category: 'Events & Activities', percentage: 10 },
  { category: 'Operations', percentage: 5 },
]

export const DONATION_STATUS_FLOW: { status: DonationStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Pending', description: 'Awaiting payment confirmation' },
  { status: 'processing', label: 'Processing', description: 'Payment being verified' },
  { status: 'verified', label: 'Verified', description: 'Payment confirmed by finance team' },
  { status: 'completed', label: 'Completed', description: 'Donation fully processed and allocated' },
  { status: 'failed', label: 'Failed', description: 'Payment could not be processed' },
  { status: 'rejected', label: 'Rejected', description: 'Payment verification failed' },
]
