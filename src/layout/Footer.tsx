import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCmsStrings } from '../context/CmsStringsContext'
import { Tr } from '../components/Translated'
import { useTheme } from '../context/ThemeContext'
import { getFooterContent } from '../services/cms-content'
import { getSiteSettings } from '../services/settings'
import { useLocalizePath } from '../hooks/useLocalizePath'
import type { FooterContent } from '../types/cms-content'
import fallbackLogo from '../assets/logo.jpg'

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
}

export function Footer() {
  const { t } = useCmsStrings()
  const { branding } = useTheme()
  const localize = useLocalizePath()
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null)
  const [siteSettings, setSiteSettings] = useState<{ contact_address?: string; contact_phone?: string; contact_email?: string }>({})
  useEffect(() => {
    Promise.all([
      getFooterContent(),
      getSiteSettings().catch(() => null),
    ]).then(([fc, ss]) => {
      if (fc) setFooterContent(fc)
      if (ss) setSiteSettings(ss as { contact_address?: string; contact_phone?: string; contact_email?: string })
    }).catch(() => {})
  }, [])

  const footerLogoSrc = branding.footer_logo_url || branding.logo_url || fallbackLogo
  const socialLinks = footerContent?.social_links || []
  const quickLinks = footerContent?.quick_links || []
  const contactInfo = footerContent?.contact_info
  const address = contactInfo?.address || siteSettings.contact_address
  const phone = contactInfo?.phone || siteSettings.contact_phone
  const email = contactInfo?.email || siteSettings.contact_email
  const copyrightText = footerContent?.copyright_text || `© ${new Date().getFullYear()} ${branding.footer_branding || ''}`.replace(/^\s*©\s*/, '').trim()
  const rights = t('footer.rights')
  const hasRights = copyrightText.toLowerCase().includes('all rights reserved')
  const finalCopyright = `${copyrightText.startsWith('©') ? '' : '© '}${copyrightText}${hasRights ? '' : ` ${rights}`}`

  return (
    <footer className="bg-[var(--color-footer-bg)] border-t border-[var(--color-border)]">
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-primary-light)] to-transparent opacity-30" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={footerLogoSrc} alt={branding.organization_name || ''} className="h-14 w-auto" loading="lazy" decoding="async" width="56" height="56" />
              <div>
                {branding.organization_name && (
                  <div className="font-semibold text-[var(--color-footer-heading)]">{branding.organization_name}</div>
                )}
                {branding.tagline && <div className="text-xs text-[var(--color-text-muted)]">{branding.tagline}</div>}
              </div>
            </div>
            {footerContent?.description && (
              <p className="text-sm mb-4 text-[var(--color-footer-text)]"><Tr text={footerContent.description} /></p>
            )}
             {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((link, idx) => (
                  <a key={idx} href={link.url} aria-label={link.label} target="_blank" rel="noopener noreferrer"
                    className="transition-colors hover:opacity-80 text-[var(--color-footer-text)]">
                    {SOCIAL_ICONS[link.platform] || null}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-footer-heading)]">{t('footer.getInvolved')}</h4>
            <ul className="space-y-2 text-sm text-[var(--color-footer-text)]">
              <li><Link to={localize('/sponsor')} className="transition-colors hover:opacity-80 text-inherit">{t('footer.sponsorChild')}</Link></li>
              <li><Link to={localize('/donate')} className="transition-colors hover:opacity-80 text-inherit">{t('footer.makeDonation')}</Link></li>
              <li><Link to={localize('/volunteer')} className="transition-colors hover:opacity-80 text-inherit">{t('footer.volunteer')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-footer-heading)]">{t('footer.information')}</h4>
            <ul className="space-y-2 text-sm text-[var(--color-footer-text)]">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={localize(link.url)} className="transition-colors hover:opacity-80 text-inherit"><Tr text={link.label} /></Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[var(--color-footer-heading)]">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-[var(--color-footer-text)]">
              {address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
                  <span>{phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
                  <span>{email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)] my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[var(--color-text-muted)]">
          <p>{finalCopyright}</p>
        </div>
      </div>
    </footer>
  )
}
