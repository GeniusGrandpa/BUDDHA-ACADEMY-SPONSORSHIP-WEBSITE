export function getRememberMe(): boolean {
  try {
    return localStorage.getItem('auth_remember_me') === 'true'
  } catch {
    return false
  }
}

export function setRememberMe(value: boolean): void {
  try {
    localStorage.setItem('auth_remember_me', String(value))
  } catch {
  }
}

export function getSavedEmail(): string {
  try {
    return localStorage.getItem('auth_saved_email') || ''
  } catch {
    return ''
  }
}

export function saveEmail(email: string): void {
  try {
    localStorage.setItem('auth_saved_email', email)
  } catch {
  }
}

export function clearSavedEmail(): void {
  try {
    localStorage.removeItem('auth_saved_email')
  } catch {
  }
}

export function isOnline(): boolean {
  return navigator.onLine
}
