import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { getAuthErrorMessage } from '../lib/auth/authErrors'

type CallbackStatus = 'loading' | 'success' | 'error'

const SANITIZED_MESSAGES: Record<string, string> = {
  'access_denied': 'Access was denied. Please try again.',
  'invalid_grant': 'This verification link is invalid or has expired.',
  'server_error': 'A server error occurred. Please try again later.',
  'unauthorized': 'You are not authorized to perform this action.',
}

const SENSITIVE_KEYWORDS = [
  'schema', 'postgres', 'rls', 'policy', 'relation', 'database error',
  'pg_', 'sql', 'syntax error', 'permission denied',
]

function sanitizeError(input: string): string {
  const lower = input.toLowerCase()

  if (SENSITIVE_KEYWORDS.some(kw => lower.includes(kw))) {
    console.error('[AuthCallback] Suppressed sensitive error:', input)
    return 'Verification failed. The link may be invalid or expired.'
  }

  for (const [key, value] of Object.entries(SANITIZED_MESSAGES)) {
    if (lower.includes(key)) return value
  }

  return input || 'Verification failed. The link may be invalid or expired.'
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [message, setMessage] = useState('Verifying your request...')
  const processed = useRef(false)

  useEffect(() => {
    let cancelled = false
    if (processed.current) return
    processed.current = true

    const handleCallback = async () => {

      const errorDescription = searchParams.get('error_description') || searchParams.get('error')
      if (errorDescription) {
        setStatus('error')
        setMessage(sanitizeError(errorDescription))
        return
      }

      const hash = window.location.hash

      if (hash && hash.includes('type=recovery')) {
        setStatus('success')
        setMessage('You can now reset your password.')
        return
      }

      if (hash && hash.includes('access_token')) {
        const { error } = await supabase.auth.setSession({
          access_token: new URLSearchParams(hash.slice(1)).get('access_token') || '',
          refresh_token: new URLSearchParams(hash.slice(1)).get('refresh_token') || '',
        })
        if (!cancelled) {
          if (error) {
            setStatus('error')
            setMessage(sanitizeError(getAuthErrorMessage(error)))
          } else {
            setStatus('success')
            setMessage('Email verified. Redirecting...')
            await new Promise(r => setTimeout(r, 1500))
            if (!cancelled) navigate('/', { replace: true })
          }
        }
        return
      }

      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled) {
          if (error) {
            setStatus('error')
            setMessage(sanitizeError(getAuthErrorMessage(error)))
          } else {
            setStatus('success')
            setMessage('Verified. Redirecting...')
            await new Promise(r => setTimeout(r, 1500))
            if (!cancelled) navigate('/', { replace: true })
          }
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        if (data.session) {
          setStatus('success')
          setMessage('You are already signed in.')
          await new Promise(r => setTimeout(r, 1500))
          if (!cancelled) navigate('/', { replace: true })
        } else {
          setStatus('error')
          setMessage('No verification code found. The link may be invalid or expired.')
        }
      }
    }

    handleCallback()
    return () => { cancelled = true }
  }, [navigate, searchParams])

  return (
    <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              {status === 'loading' && (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Verifying</h1>
                    <p className="text-gray-500 text-sm mt-2">{message}</p>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Success</h1>
                    <p className="text-gray-500 text-sm mt-2">{message}</p>
                  </div>
                  {!message.includes('Redirecting') && (
                    <Link to="/login">
                      <Button className="w-full" size="lg">
                        Continue to sign in
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto"
                  >
                    <XCircle className="w-8 h-8 text-red-500" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Verification failed</h1>
                    <p className="text-gray-500 text-sm mt-2">{message}</p>
                  </div>
                  <Link to="/login">
                    <Button className="w-full" size="lg" variant="outline">
                      Back to sign in
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <p className="text-center text-xs text-gray-400 mt-6">
            Buddha Academy Sponsorship Platform
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
