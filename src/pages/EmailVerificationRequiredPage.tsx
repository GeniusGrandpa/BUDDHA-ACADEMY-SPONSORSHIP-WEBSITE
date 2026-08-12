import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Tr } from '../components/Translated'
import { useLocalizePath } from '../hooks/useLocalizePath'
import toast from 'react-hot-toast'

export function EmailVerificationRequiredPage() {
  const { user, resendVerificationEmail, signOut } = useAuth()
  const navigate = useNavigate()
  const localize = useLocalizePath()
  const [resending, setResending] = useState(false)
  const [resendEmail, setResendEmail] = useState(user?.email || '')
  const [showResendForm, setShowResendForm] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleResendVerification = async () => {
    if (!resendEmail) return
    setResending(true)
    setSuccess(false)
    try {
      const result = await resendVerificationEmail(resendEmail)
      if (result.error) throw result.error
      setSuccess(true)
      toast.success('Verification email sent successfully')
    } catch (err) {
      toast.error('Failed to send verification email')
    } finally {
      setResending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(localize('/'))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-10 h-10 text-orange-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              <Tr text="Verify Your Email" />
            </h1>
            <p className="text-gray-600 text-sm">
              <Tr text="Please verify your email address to access your account." />
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2"><Tr text="What happens next:" /></p>
                <ol className="space-y-1.5 list-decimal list-inside text-gray-600">
                  <li><Tr text="Check your email inbox" /></li>
                  <li><Tr text="Click the verification link" /></li>
                  <li><Tr text="Return to this page to continue" /></li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              <Tr text="Didn't receive the email?" />
            </p>
            
            {!showResendForm ? (
              <Button
                onClick={() => setShowResendForm(true)}
                variant="outline"
                className="w-full"
                disabled={resending}
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <Tr text="Sending..." />
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    <Tr text="Resend Verification Email" />
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleResendVerification}
                    className="flex-1"
                    disabled={resending || !resendEmail}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <Tr text="Sending..." />
                      </>
                    ) : (
                      <Tr text="Send" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowResendForm(false)}
                    variant="outline"
                  >
                    <Tr text="Cancel" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 text-center"
            >
              <Tr text="Verification email sent successfully!" />
            </motion.div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-gray-600 hover:text-gray-900"
            >
              <Tr text="Sign Out" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Tr text="Buddha Academy Sponsorship Platform" />
        </p>
      </motion.div>
    </div>
  )
}
