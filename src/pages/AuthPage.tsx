import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { BrandPanel } from '../features/auth/components/BrandPanel'
import { LoginForm } from '../features/auth/components/LoginForm'
import { SignupForm } from '../features/auth/components/SignupForm'
import { FloatingInput } from '../features/auth/components/FloatingInput'
import {
  springTransition, fadeTransition, formVariants,
  staggerContainer, staggerItem, buttonTap,
} from '../features/auth/animations/variants'
import { getAuthErrorMessage } from '../lib/auth/authErrors'

type AuthMode = 'login' | 'signup' | 'reset' | 'verify-sent' | 'profile'

const countryOptions = [
  { value: '', label: 'Select your country' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'India', label: 'India' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Other', label: 'Other' },
]

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, resendVerificationEmail } = useAuth()
  const initialMode: AuthMode = location.pathname === '/register' ? 'signup' : 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [direction, setDirection] = useState(1)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', phone: '', country: '', password: '' })
  const [resetForm, setResetForm] = useState({ email: '' })
  const [profileForm, setProfileForm] = useState({ timezone: 'Asia/Kathmandu', organization: '', bio: '' })

  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [resetError, setResetError] = useState('')
  const [profileError, setProfileError] = useState('')

  const passwordStrength = useMemo(() => {
    const value = signupForm.password
    let score = 0
    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[a-z]/.test(value)) score++
    if (/\d/.test(value)) score++
    if (/[^A-Za-z0-9]/.test(value)) score++
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: '66%' }
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
  }, [signupForm.password])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const { error } = await signIn(loginForm.email, loginForm.password)
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setUnverifiedEmail(loginForm.email)
          setMode('verify-sent')
          return
        }
        throw error
      }
      navigate('/dashboard')
    } catch (err) {
      setLoginError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSignupError('')
    try {
      const { error } = await signUp(
        signupForm.email,
        signupForm.password,
        signupForm.fullName,
        signupForm.country
      )
      if (error) throw error
      setUnverifiedEmail(signupForm.email)
      setMode('verify-sent')
    } catch (err) {
      setSignupError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleResendVerification() {
    setResendLoading(true)
    try {
      const { error } = await resendVerificationEmail(unverifiedEmail)
      if (error) throw error
      setToast({ tone: 'success', message: 'Verification email sent. Please check your inbox.' })
    } catch {
      setToast({ tone: 'error', message: 'Failed to resend. Please try again shortly.' })
    } finally {
      setResendLoading(false)
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResetError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetForm.email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setToast({ tone: 'success', message: 'Password reset email sent. Please check your inbox.' })
      setMode('login')
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault()
    setToast({ tone: 'success', message: 'Profile setup saved successfully.' })
    navigate('/dashboard')
  }

  function switchMode(newMode: AuthMode) {
    setLoginError('')
    setSignupError('')
    setResetError('')
    setProfileError('')
    if ((mode === 'login' && newMode === 'signup') || (mode === 'signup' && newMode === 'login')) {
      setDirection(mode === 'login' ? 1 : -1)
    }
    setMode(newMode)
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const error = loginError || signupError || resetError || profileError
  const showTabs = mode === 'login' || mode === 'signup'

  const tabSwitcher = (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      <button
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          mode === 'login'
            ? 'bg-warm-50 text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => switchMode('login')}
      >
        Sign In
      </button>
      <button
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          mode === 'signup'
            ? 'bg-warm-50 text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => switchMode('signup')}
      >
        Register
      </button>
    </div>
  )

  const socialButtons = (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-warm-50 px-3 text-gray-400">or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setToast({ tone: 'error', message: 'Google sign in coming soon.' })}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => setToast({ tone: 'error', message: 'Apple sign in coming soon.' })}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/></svg>
          Apple
        </button>
      </div>
    </div>
  )

  const formContent = (
    <AnimatePresence custom={direction} initial={false}>
      {mode === 'login' && (
        <motion.div key="login" custom={direction} variants={formVariants} initial="enter" animate="center" exit="exit" transition={springTransition} className="absolute inset-0">
          <div className="p-6 space-y-5">
            <LoginForm
              email={loginForm.email}
              password={loginForm.password}
              showPassword={showPassword}
              loading={loading}
              onEmailChange={(v) => setLoginForm(prev => ({ ...prev, email: v }))}
              onPasswordChange={(v) => setLoginForm(prev => ({ ...prev, password: v }))}
              onTogglePassword={() => setShowPassword(p => !p)}
              onSubmit={handleLogin}
              onForgotPassword={() => switchMode('reset')}
            />
          </div>
        </motion.div>
      )}
      {mode === 'signup' && (
        <motion.div key="signup" custom={direction} variants={formVariants} initial="enter" animate="center" exit="exit" transition={springTransition} className="absolute inset-0">
          <div className="p-6 space-y-5">
            <SignupForm
              fullName={signupForm.fullName}
              email={signupForm.email}
              phone={signupForm.phone}
              country={signupForm.country}
              password={signupForm.password}
              showPassword={showPassword}
              loading={loading}
              passFocused={passFocused}
              passwordStrength={passwordStrength}
              countryOptions={countryOptions}
              onFullNameChange={(v) => setSignupForm(prev => ({ ...prev, fullName: v }))}
              onEmailChange={(v) => setSignupForm(prev => ({ ...prev, email: v }))}
              onPhoneChange={(v) => setSignupForm(prev => ({ ...prev, phone: v }))}
              onCountryChange={(v) => setSignupForm(prev => ({ ...prev, country: v }))}
              onPasswordChange={(v) => setSignupForm(prev => ({ ...prev, password: v }))}
              onTogglePassword={() => setShowPassword(p => !p)}
              onPassFocus={setPassFocused}
              onSubmit={handleSignup}
            />
          </div>
        </motion.div>
      )}
      {mode === 'reset' && (
        <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeTransition} className="absolute inset-0">
          <div className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <FloatingInput label="Email" type="email" value={resetForm.email} onChange={(v) => setResetForm(prev => ({ ...prev, email: v }))} required autoComplete="email" />
              <motion.button type="submit" disabled={loading} {...buttonTap}
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
              >
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending...</>
                ) : (
                  <>Send reset link</>
                )}
              </motion.button>
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
      {mode === 'verify-sent' && (
        <motion.div key="verify-sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeTransition} className="absolute inset-0">
          <div className="p-6 space-y-5">
            <div className="text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                <p className="text-gray-500 text-sm mt-1">
                  We sent a verification link to <strong className="text-gray-900">{unverifiedEmail}</strong>
                </p>
              </div>
              <Button type="button" variant="outline" className="w-full" size="lg" disabled={resendLoading} onClick={handleResendVerification}>
                {resendLoading ? 'Sending...' : 'Resend verification'}
              </Button>
              <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Back to sign in
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {mode === 'profile' && (
        <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeTransition} className="absolute inset-0">
          <div className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile setup</h1>
              <p className="text-gray-500 text-sm mt-1">Complete your account preferences.</p>
            </div>
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <Select label="Timezone" required options={[
                { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (UTC+5:45)' },
                { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
                { value: 'America/Chicago', label: 'America/Chicago (UTC-6)' },
                { value: 'America/Denver', label: 'America/Denver (UTC-7)' },
                { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
                { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+1)' },
                { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
                { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+11)' },
              ]} value={profileForm.timezone} onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))} />
              <Input label="Organization (optional)" type="text" value={profileForm.organization} onChange={(e) => setProfileForm(prev => ({ ...prev, organization: e.target.value }))} placeholder="Your organization name" />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Bio (optional)</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all resize-none" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us a little about yourself..." />
              </div>
              <Button type="submit" className="w-full" size="lg">Complete Setup</Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const desktopFormPanel = (
    <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
      <motion.div
        className="w-full max-w-sm"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {showTabs && (
          <motion.div variants={staggerItem} className="mb-6">
            {tabSwitcher}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 border border-red-100"
          >
            {error}
          </motion.div>
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-xl text-sm mb-4 border ${
              toast.tone === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-600 border-red-100'
            }`}
          >
            {toast.message}
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <div className="overflow-hidden rounded-2xl border border-amber-100/60 bg-warm-50 shadow-xl shadow-amber-200/30">
            <div className="relative" style={{ minHeight: 'min(480px, 80vh)' }}>
              {formContent}
            </div>
          </div>
        </motion.div>

        {showTabs && (
          <motion.div variants={staggerItem} className="mt-6">
            {socialButtons}
          </motion.div>
        )}

        <motion.p variants={staggerItem} className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms</Link> and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>.
        </motion.p>
      </motion.div>
    </div>
  )

  const mobileFormPanel = (
    <div className="flex lg:hidden flex-col w-full min-h-screen bg-warm-50">
      <div className="sticky top-0 z-20 bg-warm-50/80 backdrop-blur-md border-b border-amber-200 px-4 py-3">
        <div className="max-w-xs mx-auto">
          {tabSwitcher}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          {toast && (
            <div className={`px-4 py-3 rounded-xl text-sm mb-4 border ${
              toast.tone === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {toast.message}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-amber-100/60 bg-warm-50 shadow-xl shadow-amber-200/30">
            <div className="relative" style={{ minHeight: 'min(480px, 80vh)' }}>
              {formContent}
            </div>
          </div>

          {showTabs && (
            <div className="mt-6">
              {socialButtons}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms</Link> and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <BrandPanel mode={mode} onSwitchMode={switchMode} />
      {desktopFormPanel}
      {mobileFormPanel}
    </div>
  )
}
