const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/
const NEPALI_PHONE_REGEX = /^(?:\+977[- ]?)?(?:98|97|96)\d{8}$/

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email address is required'
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address'
  return null
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null
  if (!PHONE_REGEX.test(phone) && !NEPALI_PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number (e.g., +977-98XXXXXXXX or +1XXXXXXXXXX)'
  }
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} is required`
  return null
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { valid: errors.length === 0, errors }
}

export function validateAmount(amount: number): string | null {
  if (isNaN(amount) || !isFinite(amount)) return 'Please enter a valid amount'
  if (amount <= 0) return 'Amount must be greater than zero'
  if (amount > 10000000) return 'Amount cannot exceed NPR 10,000,000'
  if (!Number.isInteger(amount) && amount.toString().split('.')[1]?.length > 2) {
    return 'Amount can have at most 2 decimal places'
  }
  return null
}

export function validateMinAmount(amount: number, min: number): string | null {
  if (amount < min) return `Minimum donation amount is ${min}`
  return null
}

export function validateUrl(url: string): string | null {
  if (!url.trim()) return null
  try {
    new URL(url)
    return null
  } catch {
    return 'Please enter a valid URL'
  }
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return 'Both start and end dates are required'
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date format'
  if (end <= start) return 'End date must be after start date'
  return null
}
