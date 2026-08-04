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
