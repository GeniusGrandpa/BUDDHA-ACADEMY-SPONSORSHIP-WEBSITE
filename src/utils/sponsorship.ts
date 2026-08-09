import type { BadgeVariant } from '../components/ui/Badge'

const BADGE_MAP: Record<string, BadgeVariant> = {
  available: 'success',
  partially_sponsored: 'warning',
  fully_sponsored: 'info',
}

export function sponsorshipVariant(status: string): BadgeVariant {
  return BADGE_MAP[status] ?? 'default'
}

export function sponsorshipLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const SPONSORSHIP_STATUS_KEYS: Record<string, string> = {
  available: 'students_badge_available',
  partially_sponsored: 'students_badge_partial',
  fully_sponsored: 'students_badge_fully',
}

export function localizedSponsorshipLabel(status: string, t: (key: string) => string): string {
  const key = SPONSORSHIP_STATUS_KEYS[status]
  return key ? t(key) : sponsorshipLabel(status)
}
