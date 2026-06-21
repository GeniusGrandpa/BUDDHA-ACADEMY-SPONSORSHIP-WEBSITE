import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  heroContent?: React.ReactNode
}

export function AuthLayout({ children, heroContent }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50/40 via-white to-emerald-50/30">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* style="backgroundImage" with radial-gradient cannot be expressed as arbitrary value */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16 xl:p-20">
          {heroContent}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
