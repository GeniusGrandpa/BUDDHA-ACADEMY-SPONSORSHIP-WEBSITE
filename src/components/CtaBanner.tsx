import { Link } from 'react-router-dom'
import { useCmsStrings } from '../context/CmsStringsContext'

export function CtaBanner() {
  const { t } = useCmsStrings()
  return (
    <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-center text-white">
      <h3 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{t('cta_banner_title')}</h3>
      <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t('cta_banner_subtitle')}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={t('cta_banner_primary_link')}
          className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg"
        >
          {t('cta_banner_primary_text')}
        </Link>
        <Link
          to={t('cta_banner_secondary_link')}
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold transition-colors backdrop-blur-sm"
        >
          {t('cta_banner_secondary_text')}
        </Link>
      </div>
    </div>
  )
}
