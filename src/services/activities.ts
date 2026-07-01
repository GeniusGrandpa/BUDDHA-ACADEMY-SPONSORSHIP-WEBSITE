import { getSupabaseClient } from '../lib/supabase'
import type { ActivityRow, Json } from '../types/database'
const supabase = getSupabaseClient()

export async function getPublicActivities(limit = 20): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('id, user_id, activity_type, title, description, metadata, entity_type, entity_id, is_public, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return data || []
}

export async function getUserActivities(userId: string, limit = 20): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('id, user_id, activity_type, title, description, metadata, entity_type, entity_id, is_public, created_at')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
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
    metadata: (params.metadata || null) as Json,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    is_public: params.isPublic || false,
  })

  if (error) {
    throw error
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
