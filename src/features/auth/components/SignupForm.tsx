import { motion } from 'framer-motion'
import { FloatingInput } from './FloatingInput'
import { Select } from '../../../components/ui/Select'
import { staggerItem, buttonTap } from '../animations/variants'

interface SignupFormProps {
  fullName: string
  email: string
  phone: string
  country: string
  password: string
  showPassword: boolean
  loading: boolean
  passFocused: boolean
  passwordStrength: { label: string; color: string; width: string }
  countryOptions: { value: string; label: string }[]
  onFullNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCountryChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onTogglePassword: () => void
  onPassFocus: (focused: boolean) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function SignupForm({
  fullName, email, phone, country, password, showPassword, loading,
  passFocused, passwordStrength, countryOptions,
  onFullNameChange, onEmailChange, onPhoneChange, onCountryChange,
  onPasswordChange, onTogglePassword, onPassFocus, onSubmit,
}: SignupFormProps) {
  return (
    <motion.div variants={staggerItem} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Start supporting students today</h1>
        <p className="text-gray-500 text-sm mt-1">Help shape a child's future.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FloatingInput label="Full name" type="text" value={fullName} onChange={onFullNameChange} required autoComplete="name" />
        <FloatingInput label="Email" type="email" value={email} onChange={onEmailChange} required autoComplete="email" />
        <FloatingInput label="Phone (optional)" type="tel" value={phone} onChange={onPhoneChange} autoComplete="tel" />
        <Select label="Country" required options={countryOptions} value={country} onChange={(e) => onCountryChange(e.target.value)} />

        <div className="space-y-1" onFocus={() => onPassFocus(true)} onBlur={() => onPassFocus(false)}>
          <FloatingInput label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={onPasswordChange} required showToggle onToggle={onTogglePassword} autoComplete="new-password" />
          {passFocused && password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 pt-1 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                  {}
                </div>
                <span className="text-xs font-medium text-gray-500">{passwordStrength.label}</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-0.5 pl-1">
                <li className="flex items-center gap-1.5">
                  <span className={password.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}>
                    {password.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-1.5">
                  <span className={/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-gray-300'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'}
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-1.5">
                  <span className={/\d/.test(password) ? 'text-emerald-500' : 'text-gray-300'}>
                    {/\d/.test(password) ? '✓' : '○'}
                  </span>
                  One number
                </li>
              </ul>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          {...buttonTap}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
            ${loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300'
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            <>
              Create account
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </>
          )}
        </motion.button>

        <p className="text-xs text-gray-400 text-center">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms</a> and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>.
        </p>
      </form>
    </motion.div>
  )
}
