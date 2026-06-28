import { motion } from 'framer-motion'
import { useCmsStrings } from '../../context/CmsStringsContext'

export function HeroSection() {
  const { t } = useCmsStrings()
  const trustIndicators = [
    { label: t('donate_trust_verified'), description: t('donate_trust_verified_desc') },
    { label: t('donate_trust_transparent'), description: t('donate_trust_transparent_desc') },
    { label: t('donate_trust_secure'), description: t('donate_trust_secure_desc') },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#b45309]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-900/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-sm font-light tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fde68a]" />
              {t('donate_hero_badge')}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight mb-6">
              {t('donate_hero_title')}
              <br />
              <span className="font-medium text-[#fde68a]">{t('donate_hero_highlight')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed max-w-2xl mb-10">
              {t('donate_hero_description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap gap-6 sm:gap-8"
          >
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fde68a]" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/80">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
