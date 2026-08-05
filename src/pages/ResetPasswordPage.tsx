import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Tr } from '../components/Translated'
import { validatePassword, validateConfirmPassword } from '../lib/auth/validation'
import { getAuthErrorMessage } from '../lib/auth/authErrors'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(getAuthErrorMessage(sessionError))
        setCheckingSession(false)
        return
      }

      const hash = window.location.hash
      if (hash && hash.includes('type=recovery')) {
        setCheckingSession(false)
        return
      }

      if (data.session) {
        setCheckingSession(false)
      } else {
        setError('This reset link is invalid or has expired. Please request a new one.')
      }
      setCheckingSession(false)
    }

    checkSession()
  }, [])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    const passResult = validatePassword(password)
    if (!passResult.valid) errors.password = passResult.error!

    const confirmResult = validateConfirmPassword(password, confirmPassword)
    if (!confirmResult.valid) errors.confirmPassword = confirmResult.error!

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-1" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-2" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-3" />
          </div>
          <p className="text-gray-500 text-sm"><Tr text="Verifying your reset link..." /></p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <Tr text="Password Updated" />
            </h1>
            <p className="text-gray-600">
              <Tr text="Your password has been reset successfully." />
            </p>
          </div>

          <Card variant="bordered" padding="lg">
            <div className="space-y-5 text-center">
              <p className="text-sm text-gray-500">
                <Tr text="Redirecting you to sign in..." />
              </p>
              <div className="flex justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-1" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-2" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-delay-3" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            <Tr text="New Password" />
          </h1>
          <p className="text-gray-600">
            <Tr text="Choose a strong password to keep your account secure." />
          </p>
        </div>

        <Card variant="bordered" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="relative">
              <Input
                label={<Tr text="New password" />}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: '' })) }}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label={<Tr text="Confirm new password" />}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, confirmPassword: '' })) }}
                placeholder="Re-enter your new password"
                required
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Tr text="Updating password..." /> : <Tr text="Update password" />}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
