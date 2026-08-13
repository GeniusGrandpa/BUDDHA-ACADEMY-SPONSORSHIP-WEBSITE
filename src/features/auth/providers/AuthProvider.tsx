import { useEffect, useState, useCallback } from 'react'
import { type Session, type User } from '@supabase/supabase-js'
import { getSupabaseClient } from '../../../lib/supabase'
import type { Profile } from '../../../types/database'
import type { PermissionCode } from '../types/permissions'
import { fetchUserPermissions } from '../services/permissions'
import { classifyAuthError } from '../utils/authErrors'
import { getAuthRedirectUrl } from '../utils/redirectUrl'
import { checkRateLimit, resetRateLimit } from '../../../lib/auth/rateLimiter'
import { AuthContext, type AuthContextType } from './AuthContext'
const supabase = getSupabaseClient()

async function fetchOrCreateProfile(user: User, retries = 1): Promise<Profile | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (data) return data

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300))
        continue
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
        return null
      }
      return newProfile
    } catch {
      if (attempt >= retries) {
        return null
      }
      await new Promise(r => setTimeout(r, 300))
    }
  }
  return null
}

async function safeFetchOrCreateProfile(user: User): Promise<Profile | null> {
  try {
    return await fetchOrCreateProfile(user)
  } catch {
    return null
  }
}

async function safeFetchPermissions(userId: string): Promise<PermissionCode[]> {
  try {
    return await fetchUserPermissions(userId)
  } catch {
    return []
  }
}

async function logLoginHistory(
  userId: string,
  status: 'success' | 'failed',
  failureReason?: string
): Promise<void> {
  try {
    await supabase.rpc('record_login_attempt', {
      p_user_id: userId,
      p_status: status,
      p_failure_reason: failureReason || null
    } as never)
  } catch {
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<PermissionCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  const applySession = useCallback(async (session: Session | null): Promise<Profile | null> => {
    if (!session?.user) {
      setUser(null)
      setProfile(null)
      setPermissions([])
      setIsEmailVerified(false)
      return null
    }

    setUser(session.user)
    setIsEmailVerified(!!session.user.email_confirmed_at)

    // Only fetch profile and permissions if email is verified
    if (session.user.email_confirmed_at) {
      const [currentProfile, currentPermissions] = await Promise.all([
        safeFetchOrCreateProfile(session.user),
        safeFetchPermissions(session.user.id),
      ])

      // Check if user is deleted
      if (currentProfile && currentProfile.status === 'deleted') {
        // Sign out deleted users
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setPermissions([])
        setIsEmailVerified(false)
        return null
      }

      setProfile(currentProfile)
      if (currentProfile) {
        setPermissions(currentPermissions)
      }
      return currentProfile
    } else {
      // For unverified users, don't create profile or fetch permissions
      setProfile(null)
      setPermissions([])
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      const currentProfile = await safeFetchOrCreateProfile(data.session.user)
      
      // Check if user is deleted
      if (currentProfile && currentProfile.status === 'deleted') {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setPermissions([])
        setIsEmailVerified(false)
        return null
      }
      
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
          await supabase.auth.signOut()
          return
        }
        if (data.session) {
          const expiresAt = data.session.expires_at
          if (expiresAt && Date.now() / 1000 > expiresAt) {
            await supabase.auth.signOut()
            return
          }
          if (!cancelled) {
            await applySession(data.session)
          }
        }
      } catch {
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
          setIsEmailVerified(false)
        }
      } catch {
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
        if (!data.user.email_confirmed_at) {
          // Keep the user authenticated but mark as unverified
          setUser(data.user)
          setIsEmailVerified(false)
          setProfile(null)
          setPermissions([])
          setLoading(false)
          return {
            error: { message: 'Please verify your email address before signing in', category: 'verification' },
            needsVerification: true,
          }
        }

        await logLoginHistory(data.user.id, 'success')
        resetRateLimit(rateKey)

        const currentProfile = await safeFetchOrCreateProfile(data.user)
        const currentPermissions = currentProfile ? await safeFetchPermissions(data.user.id) : []

        setUser(data.user)
        setIsEmailVerified(true)
        setProfile(currentProfile)
        setPermissions(currentPermissions)
        setLoading(false)

        if (currentProfile?.status === 'suspended' || currentProfile?.status === 'banned') {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setPermissions([])
          setIsEmailVerified(false)
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
    setIsEmailVerified(false)
  }

  const value: AuthContextType = {
    user,
    profile,
    permissions,
    loading,
    isEmailVerified,
    signIn,
    signUp,
    resendVerificationEmail,
    signOut,
    refreshProfile,
    refreshPermissions,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}