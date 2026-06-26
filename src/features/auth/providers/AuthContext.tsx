/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { type Session, type User } from '@supabase/supabase-js'
import { getSupabaseClient } from '../../../lib/supabase'
import type { Profile } from '../../../types/database'
import type { PermissionCode } from '../types/permissions'
import { fetchUserPermissions } from '../services/permissions'
import { classifyAuthError } from '../utils/authErrors'
import { getAuthRedirectUrl } from '../utils/redirectUrl'
import { checkRateLimit, resetRateLimit } from '../../../lib/auth/rateLimiter'
const supabase = getSupabaseClient()

interface SignUpResult {
  error: { message: string; category: string } | null
  needsVerification?: boolean
  verificationSent?: boolean
  message?: string
}

interface SignInResult {
  error: { message: string; category: string } | null
  needsVerification?: boolean
}

interface ResendResult {
  error: { message: string; category: string } | null
  success?: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  permissions: PermissionCode[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, fullName: string, country: string) => Promise<SignUpResult>
  resendVerificationEmail: (email: string) => Promise<ResendResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  refreshPermissions: (userId?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchOrCreateProfile(user: User): Promise<Profile | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      return data
    }

    const meta = user.user_metadata

    const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      full_name: (meta?.full_name as string) || 'Donor',
      country: (meta?.country as string) || '',
      role: 'donor',
      status: 'active',
    }).select().maybeSingle()

    if (insertError) {
      console.error('[Auth] Fallback profile insert failed:', insertError.message)
      return null
    }

    return newProfile
  } catch (error) {
    console.error('[Auth] fetchOrCreateProfile error:', error)
    return null
  }
}

async function safeFetchOrCreateProfile(user: User): Promise<Profile | null> {
  try {
    return await fetchOrCreateProfile(user)
  } catch (error) {
    console.error('[Auth] safeFetchOrCreateProfile failed:', error)
    return null
  }
}

async function safeFetchPermissions(userId: string): Promise<PermissionCode[]> {
  try {
    return await fetchUserPermissions(userId)
  } catch (error) {
    console.error('[Auth] safeFetchPermissions failed:', error)
    return []
  }
}

async function logLoginHistory(
  userId: string,
  status: 'success' | 'failed',
  failureReason?: string
): Promise<void> {
  try {
    await supabase.from('login_history').insert({
      user_id: userId,
      status,
      failure_reason: failureReason || null,
    })
  } catch {
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<PermissionCode[]>([])
  const [loading, setLoading] = useState(true)

  const applySession = useCallback(async (session: Session | null): Promise<Profile | null> => {
    if (!session?.user) {
      setUser(null)
      setProfile(null)
      setPermissions([])
      return null
    }

    setUser(session.user)
    const currentProfile = await safeFetchOrCreateProfile(session.user)
    setProfile(currentProfile)

    if (currentProfile) {
      setPermissions(await safeFetchPermissions(session.user.id))
    }
    return currentProfile
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      const currentProfile = await safeFetchOrCreateProfile(data.session.user)
      setProfile(currentProfile)
      return currentProfile
    }
    return null
  }, [])

  const refreshPermissions = useCallback(async (userId?: string) => {
    const uid = userId || user?.id
    if (!uid) {
      setPermissions([])
      return
    }
    setPermissions(await safeFetchPermissions(uid))
  }, [user?.id])

  useEffect(() => {
    let cancelled = false

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('[Auth] getSession error:', error.message)
        }
        if (!cancelled && data.session?.user) {
          await applySession(data.session)
        }
      } catch (error) {
        console.error('[Auth] initAuth failed:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      setLoading(true)
      try {
        const currentProfile = await applySession(session)
        if (currentProfile && (currentProfile.status === 'suspended' || currentProfile.status === 'banned')) {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setPermissions([])
        }
      } catch (error) {
        console.error('[Auth] onAuthStateChange failed:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [applySession])

  const signIn = async (email: string, password: string) => {
    const rateKey = `login:${email.toLowerCase().trim()}`
    const rateCheck = checkRateLimit(rateKey)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.retryAfterMs / 60000)
      return {
        error: { message: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}`, category: 'rate_limit' as const },
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const classified = classifyAuthError(error)
        const lower = (error.message || '').toLowerCase()
        if (data?.user) {
          await logLoginHistory((data.user as { id: string }).id, 'failed', classified.userMessage)
        }

        const isUnverified = lower.includes('email not confirmed') || lower.includes('email_not_confirmed')
        return {
          error: { message: classified.userMessage, category: classified.category },
          needsVerification: isUnverified,
        }
      }

      if (data.user) {
        await logLoginHistory(data.user.id, 'success')
        resetRateLimit(rateKey)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profileData?.status === 'suspended' || profileData?.status === 'banned') {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setPermissions([])
          return {
            error: {
              message: 'Your account has been suspended. Please contact support',
              category: 'account_status',
            },
          }
        }
      }

      return { error: null }
    } catch (error) {
      const classified = classifyAuthError(error)
      return { error: { message: classified.userMessage, category: classified.category } }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, country: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
          data: { full_name: fullName, country },
        },
      })

      if (error) {
        const classified = classifyAuthError(error)
        const lower = (error.message || '').toLowerCase()

        if (lower.includes('user already registered') || lower.includes('email already registered')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
            },
          })

          if (!resendError) {
            return {
              error: null,
              verificationSent: true,
              needsVerification: true,
              message: 'An account with this email already exists but has not been verified. We have sent a new verification email.',
            }
          }
        }

        return { error: { message: classified.userMessage, category: classified.category } }
      }

      if (data?.user?.identities?.length === 0) {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
          },
        })
        if (!resendError) {
          return {
            error: null,
            verificationSent: true,
            needsVerification: true,
            message: 'An account with this email already exists but has not been verified. We have sent a new verification email.',
          }
        }
      }

      return { error: null, needsVerification: true }
    } catch (error) {
      const classified = classifyAuthError(error)
      return { error: { message: classified.userMessage, category: classified.category } }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
        },
      })

      if (error) {
        const classified = classifyAuthError(error)
        return { error: { message: classified.userMessage, category: classified.category } }
      }

      return { error: null, success: true }
    } catch (error) {
      const classified = classifyAuthError(error)
      return { error: { message: classified.userMessage, category: classified.category } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setPermissions([])
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      permissions,
      loading,
      signIn,
      signUp,
      resendVerificationEmail,
      signOut,
      refreshProfile,
      refreshPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
