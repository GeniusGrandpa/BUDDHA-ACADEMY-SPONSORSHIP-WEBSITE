import { getSupabaseClient } from '../lib/supabase'
import type { ActivityRow } from '../types/database'
const supabase = getSupabaseClient()

export async function getPublicActivities(limit = 20): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching public activities:', error)
    return []
  }

  return data || []
}

export async function getUserActivities(userId: string, limit = 20): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user activities:', error)
    return []
  }

  return data || []
}

export async function createActivity(params: {
  userId?: string
  activityType: string
  title: string
  description?: string
  metadata?: Record<string, unknown>
  entityType?: string
  entityId?: string
  isPublic?: boolean
}): Promise<void> {
  const { error } = await supabase.from('activities').insert({
    user_id: params.userId || null,
    activity_type: params.activityType,
    title: params.title,
    description: params.description || null,
    metadata: params.metadata || null,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    is_public: params.isPublic || false,
  })

  if (error) {
    console.error('Error creating activity:', error)
  }
}

export const ACTIVITY_TYPES = {
  DONATION_RECEIVED: 'donation_received',
  DONATION_VERIFIED: 'donation_completed',
  SPONSORSHIP_STARTED: 'sponsorship_started',
  TEACHER_REPORT: 'teacher_report',
  STUDENT_ACHIEVEMENT: 'student_achievement',
  SPONSORSHIP_RENEWED: 'sponsorship_renewed',
  VOLUNTEER_SIGNUP: 'volunteer_signup',
  EVENT_CREATED: 'event_created',
  MILESTONE: 'milestone',
} as const
