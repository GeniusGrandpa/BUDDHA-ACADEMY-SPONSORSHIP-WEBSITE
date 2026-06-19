export function formatCurrency(amount: number, currency: 'NPR' | 'USD' = 'NPR'): string {
  const formatter = new Intl.NumberFormat(currency === 'NPR' ? 'ne-NP' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `RCP-${year}-${random}`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'text-green-600 bg-green-50 border-green-200',
    paused: 'text-amber-600 bg-amber-50 border-amber-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    expired: 'text-gray-600 bg-gray-50 border-gray-200',
    open: 'text-blue-600 bg-blue-50 border-blue-200',
    in_progress: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    resolved: 'text-green-600 bg-green-50 border-green-200',
    closed: 'text-gray-600 bg-gray-50 border-gray-200',
    pledged: 'text-purple-600 bg-purple-50 border-purple-200',
    received: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    read: 'text-gray-500 bg-gray-50 border-gray-200',
    unread: 'text-blue-600 bg-blue-50 border-blue-200',
    urgent: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-slate-600 bg-slate-50 border-slate-200',
  }
  return map[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getStatusDotColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-500',
    paused: 'bg-amber-500',
    cancelled: 'bg-red-500',
    expired: 'bg-gray-400',
    open: 'bg-blue-500',
    in_progress: 'bg-indigo-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-400',
    pledged: 'bg-purple-500',
    received: 'bg-emerald-500',
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-slate-400',
  }
  return map[status] || 'bg-gray-400'
}

export function getStatusIcon(status: string): string {
  const map: Record<string, string> = {
    active: 'CheckCircle',
    paused: 'PauseCircle',
    cancelled: 'XCircle',
    expired: 'Clock',
    open: 'MessageCircle',
    in_progress: 'Loader',
    resolved: 'CheckCircle',
    closed: 'Archive',
    pledged: 'Clock',
    received: 'CheckCircle',
    urgent: 'AlertTriangle',
    high: 'ArrowUpCircle',
    medium: 'MinusCircle',
    low: 'ArrowDownCircle',
  }
  return map[status] || 'HelpCircle'
}

export function getNotificationIcon(type: string): string {
  const map: Record<string, string> = {
    student_update: 'GraduationCap',
    donation_confirmation: 'DollarSign',
    sponsorship_reminder: 'Bell',
    admin_announcement: 'Megaphone',
    achievement: 'Award',
    renewal: 'RefreshCw',
    system: 'Settings',
  }
  return map[type] || 'Bell'
}

export function formatFrequency(frequency: string): string {
  const map: Record<string, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annual: 'Annual',
    'one-time': 'One Time',
  }
  return map[frequency] || frequency
}

export function maskCardNumber(card: string): string {
  if (!card) return ''
  const parts = card.split('_****_')
  if (parts.length === 2) {
    return `•••• ${parts[1]}`
  }
  return card
}

export function getImpactProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}
