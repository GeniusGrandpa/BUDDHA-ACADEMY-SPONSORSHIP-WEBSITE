import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AuthHeaderProps {
  title: string
  subtitle?: string
  showLogo?: boolean
}

export function AuthHeader({ title, subtitle, showLogo = true }: AuthHeaderProps) {
  return (
    <motion.div
      className="text-center mb-7"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {showLogo && (
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white font-bold text-base">B</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-800 text-sm">Buddha Academy</div>
            <div className="text-xs text-gray-400 tracking-wider uppercase">Boudha . Kathmandu</div>
          </div>
        </Link>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
