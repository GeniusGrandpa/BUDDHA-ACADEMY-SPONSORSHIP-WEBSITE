export interface PasswordStrengthResult {
  score: number
  maxScore: number
  label: string
  color: string
  bgColor: string
  width: string
  checks: {
    minLength: boolean
    hasUpper: boolean
    hasLower: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }

  let score = 0
  if (checks.minLength) score++
  if (checks.hasUpper) score++
  if (checks.hasLower) score++
  if (checks.hasNumber) score++
  if (checks.hasSpecial) score++

  if (score <= 1) {
    return { score, maxScore: 5, label: 'Weak', color: 'bg-red-500', bgColor: 'bg-red-500/20', width: '20%', checks }
  }
  if (score <= 2) {
    return { score, maxScore: 5, label: 'Fair', color: 'bg-orange-500', bgColor: 'bg-orange-500/20', width: '40%', checks }
  }
  if (score <= 3) {
    return { score, maxScore: 5, label: 'Good', color: 'bg-amber-500', bgColor: 'bg-amber-500/20', width: '60%', checks }
  }
  if (score <= 4) {
    return { score, maxScore: 5, label: 'Strong', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/20', width: '80%', checks }
  }
  return { score, maxScore: 5, label: 'Very Strong', color: 'bg-emerald-600', bgColor: 'bg-emerald-600/20', width: '100%', checks }
}
