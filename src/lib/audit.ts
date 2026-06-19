import { supabase } from './supabase'

export interface AuditLogEntry {
  action: string
  entityType: string
  entityId?: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch {
    return null
  }
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<string | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase.rpc('log_audit_event', {
      p_user_id: userId,
      p_action: entry.action,
      p_entity_type: entry.entityType,
      p_entity_id: entry.entityId || null,
      p_changes: entry.changes ?? null,
      p_metadata: entry.metadata ?? null,
    })
    if (error) throw error
    return data as string
  } catch {
    return null
  }
}

export async function logSecurityEvent(
  eventType: string,
  severity: 'info' | 'warning' | 'critical' = 'info',
  metadata?: Record<string, unknown>,
): Promise<string | null> {
  try {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_user_id: userId,
      p_severity: severity,
      p_metadata: metadata ?? null,
    })
    if (error) throw error
    return data as string
  } catch {
    return null
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  data?: Record<string, unknown>,
): Promise<string | null> {
  try {
    const { data: result, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message || null,
      p_data: data ?? null,
    })
    if (error) throw error
    return result as string
  } catch {
    return null
  }
}
