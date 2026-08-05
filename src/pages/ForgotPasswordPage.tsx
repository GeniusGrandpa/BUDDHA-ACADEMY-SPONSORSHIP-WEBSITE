import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Tr } from '../components/Translated'
import { validateEmail } from '../lib/auth/validation'
import { getAuthErrorMessage } from '../lib/auth/authErrors'
import { getAuthRedirectUrl } from '../lib/auth/redirectUrl'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailResult = validateEmail(email)
    if (!emailResult.valid) {
      setFieldError(emailResult.error!)
      return
    }
    setFieldError('')

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl('/reset-password'),
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <Tr text="Check Your Inbox" />
            </h1>
            <p className="text-gray-600">
              <Tr text="If an account exists for" />{' '}
              <span className="font-medium text-gray-900">{email}</span>
              , <Tr text="you will receive a reset link shortly." />
            </p>
          </div>

          <Card variant="bordered" padding="lg">
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">
                  <Tr text="Didn't receive the email? Check your spam folder or try again." />
                </p>
              </div>

              <Link to="/login">
                <Button className="w-full" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <Tr text="Back to sign in" />
                </Button>
              </Link>
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
            <Tr text="Reset Password" />
          </h1>
          <p className="text-gray-600">
            <Tr text="Enter your email and we will send you a reset link." />
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

            <Input
              label={<Tr text="Email" />}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
              error={fieldError}
            />

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Tr text="Sending reset link..." /> : <Tr text="Send reset link" />}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={14} />
                <Tr text="Back to sign in" />
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
