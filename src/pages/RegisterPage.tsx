import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthHeader } from '../components/auth/AuthHeader'
import { AuthInput } from '../components/auth/AuthInput'
import { PasswordInput } from '../components/auth/PasswordInput'
import { AuthButton } from '../components/auth/AuthButton'
import { staggerContainer, staggerItem } from '../features/auth/animations/variants'
import { validateEmail, validateName, validateConfirmPassword } from '../lib/auth/validation'
import { getAuthErrorMessage } from '../lib/auth/authErrors'

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

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, user, profile, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && profile && !authLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, profile, authLoading, navigate])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    const nameResult = validateName(formData.fullName)
    if (!nameResult.valid) errors.fullName = nameResult.error!

    const emailResult = validateEmail(formData.email)
    if (!emailResult.valid) errors.email = emailResult.error!

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    const confirmResult = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (!confirmResult.valid) errors.confirmPassword = confirmResult.error!

    if (!formData.country) errors.country = 'Please select your country'
    if (!acceptedTerms) errors.terms = 'Please accept the terms and conditions'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)
    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.country,
      )
      if (signUpError) throw signUpError
      setRegistered(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const heroContent = (
    <motion.div
      className="flex flex-col justify-between h-full"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem}>
        <div className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-base">B</span>
          </div>
          <span className="text-sm font-semibold text-white/90">Buddha Academy</span>
        </div>
      </motion.div>

      <div className="space-y-8">
        <motion.div variants={staggerItem} className="space-y-6">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
            Become a sponsor.
            <br />
            <span className="text-amber-200">Change a life.</span>
          </h1>
          <p className="text-lg text-white/90 max-w-md leading-relaxed">
            Join our global community of sponsors providing education, nutrition, and hope to children in Nepal.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-4">
          {[
            'Sponsor a child\'s education',
            'Watch them grow and succeed',
            'Join a community of changemakers',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div variants={staggerItem} className="flex items-center gap-4 text-white/60 text-xs">
        <span>500+ children supported</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>47 years of service</span>
      </motion.div>
    </motion.div>
  )

  const RegisterForm = () => (
    <>
      <AuthHeader
        title="Join the Mission"
        subtitle="Create your account and start supporting a child's education."
      />

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <AuthInput
            id="fullName"
            name="fullName"
            label="Full name"
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="Your full name"
            required
            autoComplete="name"
            autoFocus
            error={fieldErrors.fullName}
          />

          <AuthInput
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />

          <div className="space-y-1.5">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl text-sm
                bg-gray-50 border transition-all duration-200 outline-none appearance-none
                ${formData.country ? 'text-gray-900' : 'text-gray-400'}
                ${fieldErrors.country
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-200 hover:border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                }
              `}
              required
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.country && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.country}</p>
            )}
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            autoComplete="new-password"
            error={fieldErrors.password}
          />

          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            showPasswordToggle
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          <div className="space-y-1">
            <label htmlFor="terms" className="flex items-start gap-2.5 cursor-pointer group">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => { setAcceptedTerms(e.target.checked); setFieldErrors((prev) => ({ ...prev, terms: '' })) }}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/30 transition-all"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">Privacy Policy</Link>
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-xs text-red-500 ml-6">{fieldErrors.terms}</p>
            )}
          </div>

          <AuthButton type="submit" loading={loading} loadingText="Creating account...">
            Create account
          </AuthButton>
        </form>
      </AuthCard>

      <motion.p
        className="text-center text-sm text-gray-500 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Already a sponsor?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
          Sign in
          <ArrowRight size={14} />
        </Link>
      </motion.p>
    </>
  )

  const SuccessScreen = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AuthHeader
          title="Check Your Email"
          subtitle="You're almost there."
          showLogo
        />
        <AuthCard>
          <div className="text-center space-y-6 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto"
            >
              <Mail className="w-8 h-8 text-emerald-600" />
            </motion.div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">Verify your email</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                We sent a verification link to{' '}
                <span className="text-emerald-700 font-medium">{formData.email}</span>
              </p>
            </div>

            <motion.div
              className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-700 mb-2">What happens next?</p>
                  <ol className="space-y-2 text-gray-500 list-decimal list-inside">
                    <li>Click the verification link in your email</li>
                    <li>Return here and sign in to your new account</li>
                    <li>Choose a student to sponsor and start making a difference</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            <Link to="/login">
              <AuthButton type="button">
                Go to sign in
                <ArrowRight size={16} />
              </AuthButton>
            </Link>
          </div>
        </AuthCard>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <AuthLayout heroContent={heroContent}>
      {registered ? <SuccessScreen /> : <RegisterForm />}
    </AuthLayout>
  )
}
