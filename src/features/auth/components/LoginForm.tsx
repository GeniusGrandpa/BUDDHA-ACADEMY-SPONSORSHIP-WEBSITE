import { motion } from 'framer-motion'
import { FloatingInput } from './FloatingInput'
import { staggerItem, buttonTap } from '../animations/variants'

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onTogglePassword: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  onForgotPassword: () => void
}

export function LoginForm({
  email, password, showPassword, loading,
  onEmailChange, onPasswordChange, onTogglePassword,
  onSubmit, onForgotPassword,
}: LoginFormProps) {
  return (
    <motion.div variants={staggerItem} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">Continue making an impact.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={onEmailChange}
          required
          autoComplete="email"
        />
        <FloatingInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          required
          showToggle
          onToggle={onTogglePassword}
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 transition-shadow" />
            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </button>
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
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
