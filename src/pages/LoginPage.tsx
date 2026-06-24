import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { validateEmail, validateName, validatePassword, validateConfirmPassword } from '../lib/auth/validation'
import { getAuthErrorMessage } from '../lib/auth/authErrors'
import { getRedirectPath } from '../lib/auth/redirectByRole'
import { getSavedEmail, saveEmail, clearSavedEmail, getRememberMe, setRememberMe } from '../lib/auth/session'
import { getSupabaseClient } from '../lib/supabase'
import type { Role } from '../types/permissions'
import logo from '../assets/logo.jpg'

const supabase = getSupabaseClient()

const countryOptions = [
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } },
})

const stats = [
  { value: '500+', label: 'Students Supported' },
  { value: '47', label: 'Years of Service' },
  { value: '100+', label: 'Active Sponsors' },
]

type AuthMode = 'signin' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, signUp, resendVerificationEmail, user, profile, loading: authLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')

  const [email, setEmail] = useState(getSavedEmail())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMeState] = useState(getRememberMe())
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(searchParams.get('verified') ? 'Email verified. You can now sign in.' : '')
  const [showResend, setShowResend] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; country?: string }>({})

  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [country, setCountry] = useState('')

  const redirectByRole = useCallback(
    async (role: Role) => {
      const path = getRedirectPath(role)
      navigate(path, { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    if (user && profile && !authLoading) {
      redirectByRole(profile.role as Role)
    }
  }, [user, profile, authLoading, redirectByRole])

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setSuccess('')
    setFieldErrors({})
    setShowResend(false)
    setCountry('')
  }

  const validateSignIn = (): boolean => {
    const errors: { email?: string; password?: string } = {}
    const emailResult = validateEmail(email)
    if (!emailResult.valid) errors.email = emailResult.error ?? undefined
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateSignUp = (): boolean => {
    const errors: typeof fieldErrors = {}

    const nameResult = validateName(fullName)
    if (!nameResult.valid) errors.fullName = nameResult.error ?? undefined

    const emailResult = validateEmail(email)
    if (!emailResult.valid) errors.email = emailResult.error ?? undefined

    const passResult = validatePassword(password)
    if (!passResult.valid) errors.password = passResult.error ?? undefined

    const confirmResult = validateConfirmPassword(password, confirmPassword)
    if (!confirmResult.valid) errors.confirmPassword = confirmResult.error ?? undefined

    if (!country) errors.country = 'Please select your country'

    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to proceed.')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setShowResend(false)

    if (!validateSignIn()) return

    setLoading(true)
    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) throw signInError

      if (rememberMe) {
        saveEmail(email)
      } else {
        clearSavedEmail()
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileData?.role) {
          redirectByRole(profileData.role as Role)
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (err) {
      const message = getAuthErrorMessage(err)
      if (message.toLowerCase().includes('verify')) {
        setShowResend(true)
      }
      if (message) {
        setError(message)
      }
      toast.error(message || 'Something went wrong. Please try again.', { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateSignUp()) return
    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to proceed.')
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await signUp(
        email,
        password,
        fullName,
        country || 'Nepal',
      )
      if (signUpError) throw signUpError
      setRegistered(true)
    } catch (err) {
      const msg = getAuthErrorMessage(err)
      if (msg) {
        setError(msg)
      }
      toast.error(msg || 'Something went wrong. Please try again.', { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)
    setError('')
    try {
      const { error: resendError } = await resendVerificationEmail(email)
      if (resendError) throw resendError
      setSuccess('Verification email resent. Please check your inbox.')
      setShowResend(false)
    } catch (err) {
      const msg = getAuthErrorMessage(err)
      if (msg) {
        setError(msg)
      }
      toast.error(msg || 'Something went wrong. Please try again.', { duration: 5000 })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#fffaf5] overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#fed7aa]/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-[#f59e0b]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#fed7aa]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative lg:w-[45%] bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] overflow-hidden min-h-[40vh] lg:min-h-screen flex flex-col">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />


        <motion.div
          className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#fde68a]/20 blur-3xl"
          animate={{ y: [0, -20, 0, 20, 0], scale: [1, 1.08, 1, 0.92, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full bg-[#fef3c7]/15 blur-3xl"
          animate={{ y: [0, 20, 0, -20, 0], scale: [1, 0.92, 1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 flex flex-col flex-1 p-8 sm:p-10 lg:p-14 xl:p-16">
          <motion.div {...fadeUp(0)} className="flex items-center gap-3">
            <img
              src={logo}
              alt="Buddha Academy"
              className="h-12 w-auto rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
            />
            <div>
              <span className="text-sm font-semibold text-white/90">Buddha Academy</span>
              <p className="text-xs text-white/70 tracking-wider uppercase">Boudha &middot; Kathmandu</p>
            </div>
          </motion.div>
          

          <div className="flex-1 flex items-center">
            <div className="space-y-8 max-w-xl">
              <motion.h1 {...fadeUp(0.15)} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                {mode === 'signin' ? (
                  <>
                    Continue Supporting
                    <br />
                    <span className="text-[#fed7aa]">Student Futures</span>
                  </>
                ) : (
                  <>
                    Join Us in
                    <br />
                    <span className="text-[#fed7aa]">Changing Lives</span>
                  </>
                )}
              </motion.h1>

              <motion.p {...fadeUp(0.25)} className="text-lg sm:text-xl text-white/90 max-w-lg leading-relaxed">
                {mode === 'signin'
                  ? 'Sign in to track your sponsorship impact, connect with your sponsored student, and be part of a community transforming lives through education in Nepal.'
                  : 'Create an account to sponsor a child, track your impact, and join a community dedicated to providing education and hope to children in Nepal.'
                }
              </motion.p>

              <motion.div {...fadeUp(0.35)} className="flex flex-wrap gap-6 sm:gap-8 pt-2">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/80 mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 sm:p-10 lg:p-14">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } }}
        >
          {registered ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-5"
                >
                  <Mail className="w-8 h-8 text-[#f59e0b]" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-2">
                  Check Your Email
                </h1>
                <p className="text-gray-600 text-sm">
                  We sent a verification link to<br />
                  <span className="font-medium text-[#0f172a]">{email}</span>
                </p>
              </div>

              <div className="bg-warm-50 rounded-xl p-6 shadow-lg shadow-[#fed7aa]/20 border border-amber-100/80 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-[#0f172a] mb-1">What happens next?</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      <li>Click the verification link in your email</li>
                      <li>Return here and sign in to your account</li>
                      <li>Start exploring sponsorship opportunities</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={() => { setRegistered(false); switchMode('signin') }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  Go to sign in
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => switchMode('signin')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-warm-50 text-[#0f172a] shadow-sm'
                      : 'text-gray-600 hover:text-[#0f172a]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-warm-50 text-[#0f172a] shadow-sm'
                      : 'text-gray-600 hover:text-[#0f172a]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {mode === 'signin'
                    ? 'Sign in to continue supporting education and community growth.'
                    : 'Join Buddha Academy Sponsorship Platform and support education.'
                  }
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 text-[#d97706] px-4 py-3 rounded-xl text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-6" noValidate>
                  <Input
                    id="signin-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    required
                    autoComplete="email"
                    autoFocus
                    error={fieldErrors.email}
                  />

                  <div className="relative">
                    <Input
                      id="signin-password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      required
                      autoComplete="current-password"
                      error={fieldErrors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-[#f59e0b] transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex justify-end -mt-1">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#f59e0b] hover:text-[#d97706] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer group">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMeState(e.target.checked)
                        setRememberMe(e.target.checked)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#f59e0b] focus:ring-[#f59e0b]/30 transition-all"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#0f172a] transition-colors">
                      Remember me
                    </span>
                  </label>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-200 bg-warm-50 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-300 transition-all disabled:opacity-50"
                    >
                      <Mail size={16} />
                      {resending ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-6" noValidate>
                  <Input
                    id="signup-name"
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, fullName: undefined }))
                    }}
                    required
                    autoComplete="name"
                    autoFocus
                    error={fieldErrors.fullName}
                  />

                  <Input
                    id="signup-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    required
                    autoComplete="email"
                    error={fieldErrors.email}
                  />

                  <div className="space-y-1.5">
                    <label htmlFor="signup-country" className="block text-sm font-medium text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="signup-country"
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setFieldErrors((prev) => ({ ...prev, country: undefined })) }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all duration-200 text-gray-900"
                      required
                    >
                      <option value="" disabled>Select your country</option>
                      {countryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {fieldErrors.country && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.country}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="signup-password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      required
                      autoComplete="new-password"
                      error={fieldErrors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-[#f59e0b] transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                      }}
                      required
                      autoComplete="new-password"
                      error={fieldErrors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-gray-400 hover:text-[#f59e0b] transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="pt-1">
                    <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => {
                          setAcceptTerms(e.target.checked)
                          if (error === 'Please accept the Terms & Conditions to proceed.') setError('')
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#f59e0b] focus:ring-[#f59e0b]/30 focus:ring-2 transition-all cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-[#0f172a] transition-colors leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors">
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}
            
              <p className="text-center text-sm text-gray-600 pt-1">
                {mode === 'signin' ? (
                  <>
                    New to Buddha Academy?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-[#f59e0b] hover:text-[#d97706] font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      Join our community
                      <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => switchMode('signin')}
                      className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

              <p className="text-xs text-gray-600 text-center leading-relaxed pt-1">
                By {mode === 'signin' ? 'signing in' : 'creating an account'}, you agree to our{' '}
                <Link to="/terms" className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
