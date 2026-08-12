import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../../../types/database'
import type { PermissionCode } from '../types/permissions'

export interface SignUpResult {
  error: { message: string; category: string } | null
  needsVerification?: boolean
  verificationSent?: boolean
  message?: string
}

export interface SignInResult {
  error: { message: string; category: string } | null
  needsVerification?: boolean
}

export interface ResendResult {
  error: { message: string; category: string } | null
  success?: boolean
}

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  permissions: PermissionCode[]
  loading: boolean
  isEmailVerified: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, fullName: string, country: string) => Promise<SignUpResult>
  resendVerificationEmail: (email: string) => Promise<ResendResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  refreshPermissions: (userId?: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}