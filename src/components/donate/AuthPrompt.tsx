import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { useLocalizePath } from '../../hooks/useLocalizePath'
import { useAuth } from '../../context/AuthContext'

export function AuthPrompt() {
  const { t } = useCmsStrings()
  const localize = useLocalizePath()
  const { user, isEmailVerified } = useAuth()
  const benefits = [
    t('auth_benefit_1'),
    t('auth_benefit_2'),
    t('auth_benefit_3'),
    t('auth_benefit_4'),
  ]

  // If user is logged in but not verified, show verification prompt
  if (user && !isEmailVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden"
      >
        <div className="p-5 sm:p-8">
          <h3 className="text-base sm:text-lg font-medium text-[#0f172a] mb-2">
            Verify Your Email
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            Please verify your email address to make donations and access all features.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={localize('/verify-email')}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#f59e0b] text-white text-sm font-medium hover:bg-[#d97706] transition-colors touch-target"
            >
              Verify Email
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  // Show normal auth prompt for unauthenticated users
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden"
    >
      <div className="p-5 sm:p-8">
        <h3 className="text-base sm:text-lg font-medium text-[#0f172a] mb-2">
          {t('auth_heading')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          {t('auth_description')}
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {benefits.map((text) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={localize('/login')}
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#f59e0b] text-white text-sm font-medium hover:bg-[#d97706] transition-colors touch-target"
          >
            {t('auth_sign_in')}
          </Link>
          <Link
            to={localize('/register')}
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 text-[#0f172a] text-sm font-medium hover:bg-gray-50 transition-colors touch-target"
          >
            {t('auth_create_account')}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
