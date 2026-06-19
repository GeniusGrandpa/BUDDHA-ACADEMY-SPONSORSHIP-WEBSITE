export interface ValidationResult {
  valid: boolean
  error: string | null
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  return { valid: true, error: null }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  return { valid: true, error: null }
}

export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' }
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true, error: null }
}

export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { valid: false, error: 'Full name is required' }
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }
  return { valid: true, error: null }
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true, error: null }
}
