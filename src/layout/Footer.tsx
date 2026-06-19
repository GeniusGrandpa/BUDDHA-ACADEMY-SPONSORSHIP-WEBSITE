import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import fallbackLogo from '../assets/logo.jpg'

export function Footer() {
  const { t } = useLanguage()
  const { branding } = useTheme()

  return (
    <footer style={{ backgroundColor: 'var(--color-footer-bg)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ height: '1px', background: `linear-gradient(to right, transparent, var(--color-primary-light), transparent)`, opacity: 0.3 }} />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={branding.logo_url || fallbackLogo} alt={branding.organization_name} className="h-14 w-auto" />
              <div>
                <div className="font-semibold" style={{ color: 'var(--color-footer-heading)' }}>{branding.organization_name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{branding.tagline}</div>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-footer-text)' }}>
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors hover:opacity-80" style={{ color: 'var(--color-footer-text)' }}><Facebook className="w-5 h-5" /></a>
              <a href="#" className="transition-colors hover:opacity-80" style={{ color: 'var(--color-footer-text)' }}><Instagram className="w-5 h-5" /></a>
              <a href="#" className="transition-colors hover:opacity-80" style={{ color: 'var(--color-footer-text)' }}><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--color-footer-heading)' }}>{t('footer.getInvolved')}</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-footer-text)' }}>
              <li><Link to="/sponsor" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.sponsorChild')}</Link></li>
              <li><Link to="/donate" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.makeDonation')}</Link></li>
              <li><Link to="/volunteer" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.volunteer')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--color-footer-heading)' }}>{t('footer.information')}</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-footer-text)' }}>
              <li><Link to="/about" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.aboutUs')}</Link></li>
              <li><Link to="/transparency" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.transparency')}</Link></li>
              <li><Link to="/faq" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>FAQ</Link></li>
              <li><Link to="/privacy" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="transition-colors hover:opacity-80" style={{ color: 'inherit' }}>{t('footer.terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--color-footer-heading)' }}>{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-footer-text)' }}>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span>Buddha Academy, Boudha, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span>+977 1 1234567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span>info@buddhaacademy.edu.np</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p>&copy; {new Date().getFullYear()} {branding.footer_branding}. {t('footer.rights')}</p>
          <p className="mt-2 md:mt-0">{t('footer.nonprofit')}</p>
        </div>
      </div>
    </footer>
  )
}
