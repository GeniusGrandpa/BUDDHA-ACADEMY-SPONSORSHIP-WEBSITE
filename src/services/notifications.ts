import { getSupabaseClient } from '../lib/supabase'
import type { Notification, Role, ProfileStatus } from '../types/database'
const supabase = getSupabaseClient()

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, message, data, read, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return data || []
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) return 0
  return count || 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
  if (error) throw error
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message || null,
    p_data: data ?? null,
  })
  if (error) {
    return false
  }
  return true
}

export async function broadcastNotification(
  targetUserIds: string[],
  type: string,
  title: string,
  message?: string,
  data?: Record<string, unknown>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const userId of targetUserIds) {
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message || null,
        p_data: data ?? null,
      })
      if (error) {
        failed++
      } else {
        success++
      }
    } catch {
      failed++
    }
  }

  return { success, failed }
}

export async function getAllUserIds(options?: { roles?: string[]; status?: string }): Promise<string[]> {
  let query = supabase.from('profiles').select('id')

  if (options?.roles && options.roles.length > 0) {
    query = query.in('role', options.roles as Role[])
  }
  if (options?.status) {
    query = query.eq('status', options.status as ProfileStatus)
  }

  const { data, error } = await query
  if (error) {
    return []
  }
  return ((data || []) as { id: string }[]).map(p => p.id)
}

export const NOTIFICATION_TYPES = {
  DONATION_CONFIRMED: 'donation_confirmed',
  PAYMENT_VERIFIED: 'payment_verified',
  SPONSORSHIP_ACTIVE: 'sponsorship_active',
  SPONSORSHIP_RENEWAL: 'sponsorship_renewal',
  TEACHER_UPDATE: 'teacher_update',
  VOLUNTEER_APPROVED: 'volunteer_approved',
  VOLUNTEER_EVENT: 'volunteer_event',
  REPORT_AVAILABLE: 'report_available',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement',
} as const
