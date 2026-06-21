import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../animations/variants'

interface BrandPanelProps {
  mode?: string
  onSwitchMode?: (mode: 'login' | 'signup') => void
}

export function BrandPanel({ mode, onSwitchMode }: BrandPanelProps) {
  return (
    <motion.div
      className="relative hidden lg:flex lg:w-1/2 min-h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-neutral-900 to-amber-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl"
        animate={{
          y: [0, -30, 0, 30, 0],
          scale: [1, 1.15, 1, 0.85, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-3xl"
        animate={{
          y: [0, 30, 0, -30, 0],
          scale: [1, 0.85, 1, 1.15, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-yellow-500/8 blur-3xl"
        animate={{
          y: [0, -20, 0, 20, 0],
          x: [0, 15, 0, -15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-amber-600/8 blur-3xl"
        animate={{
          y: [0, 15, 0, -15, 0],
          x: [0, -10, 0, 10, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* radial-gradient background pattern cannot be expressed as a Tailwind arbitrary value */}

      {}
      <motion.div
        className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <span className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-white/90">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-amber-300">B</span>
            Buddha Academy
          </span>
        </motion.div>

        <div className="space-y-8">
          <motion.h1
            variants={staggerItem}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight"
          >
            Every child
            <br />
            <span className="text-amber-300">deserves</span> an
            <br />
            education.
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-base lg:text-lg text-white/60 max-w-md leading-relaxed"
          >
            Join our community of sponsors providing free education to
            underprivileged children in Nepal since 1977.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-8 pt-2"
          >
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">500+</p>
              <p className="text-xs lg:text-sm text-white/70 mt-1">Children Supported</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">47</p>
              <p className="text-xs lg:text-sm text-white/70 mt-1">Years of Service</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">100+</p>
              <p className="text-xs lg:text-sm text-white/70 mt-1">Active Sponsors</p>
            </div>
          </motion.div>

          {}
          {mode && onSwitchMode && (
            <motion.div variants={staggerItem} className="pt-4">
              {mode === 'login' ? (
                <button
                  onClick={() => onSwitchMode('signup')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  Create an account
                </button>
              ) : (
                <button
                  onClick={() => onSwitchMode('login')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Sign in instead
                </button>
              )}
            </motion.div>
          )}
        </div>

        <motion.p variants={staggerItem} className="text-xs text-white/50">
          © 2026 Buddha Academy. All rights reserved.
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
