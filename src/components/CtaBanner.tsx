import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function CtaBanner() {
  const { t } = useLanguage()

  return (
    <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-center text-white">
      <h3 className="text-3xl sm:text-4xl font-bold mb-8 leading-tight">&ldquo;{t('footer.ctaTitle')}&rdquo;</h3>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/sponsor"
          className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg"
        >
          {t('footer.sponsorChild')}
        </Link>
        <Link
          to="/donate"
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold transition-colors backdrop-blur-sm"
        >
          {t('footer.makeDonation')}
        </Link>
      </div>
    </div>
  )
}
