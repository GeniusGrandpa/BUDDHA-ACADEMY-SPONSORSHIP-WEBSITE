/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type LanguageCode = string

type TranslationKey =
  | 'language.label'
  | 'nav.home'
  | 'nav.about'
  | 'nav.students'
  | 'nav.gallery'
  | 'nav.news'
  | 'nav.contact'
  | 'nav.admin'
  | 'nav.dashboard'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.signOut'
  | 'auth.donorSignIn'
  | 'auth.signInSubtitle'
  | 'auth.email'
  | 'auth.password'
  | 'auth.signingIn'
  | 'auth.invalidCredentials'
  | 'auth.verifyBeforeSignIn'
  | 'auth.verificationSent'
  | 'auth.resendVerification'
  | 'auth.sendingVerification'
  | 'auth.noAccount'
  | 'auth.createAccount'
  | 'auth.forgotPassword'
  | 'auth.alreadyAccount'
  | 'auth.fullName'
  | 'auth.confirmPassword'
  | 'auth.country'
  | 'auth.registerTitle'
  | 'auth.registerSubtitle'
  | 'auth.creatingAccount'
  | 'auth.registrationSuccess'
  | 'auth.passwordMismatch'
  | 'auth.passwordTooShort'
  | 'auth.registrationFailed'
  | 'auth.emailVerified'
  | 'auth.callbackChecking'
  | 'auth.callbackVerified'
  | 'auth.callbackFailed'
  | 'auth.callbackMissingCode'
  | 'auth.backToSignIn'
  | 'footer.ctaTitle'
  | 'footer.ctaText'
  | 'footer.sponsorChild'
  | 'footer.makeDonation'
  | 'footer.description'
  | 'footer.getInvolved'
  | 'footer.volunteer'
  | 'footer.information'
  | 'footer.aboutUs'
  | 'footer.transparency'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.contact'
  | 'footer.rights'
  | 'footer.nonprofit'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: TranslationKey) => string
}

interface LanguageOption {
  code: LanguageCode
  label: string
  nativeLabel: string
  shortLabel: string
  googleCode?: string
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: '🇺🇸', googleCode: 'en' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', shortLabel: '🇳🇵', googleCode: 'ne' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', shortLabel: '🇮🇳', googleCode: 'hi' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortLabel: '🇪🇸', googleCode: 'es' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortLabel: '🇫🇷', googleCode: 'fr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', shortLabel: '🇩🇪', googleCode: 'de' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', shortLabel: '🇨🇳', googleCode: 'zh-CN' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', shortLabel: '🇯🇵', googleCode: 'ja' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', shortLabel: '🇰🇷', googleCode: 'ko' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: '🇸🇦', googleCode: 'ar' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', shortLabel: '🇵🇹', googleCode: 'pt' },
  { code: 'pt-br', label: 'Brazilian Portuguese', nativeLabel: 'Português', shortLabel: '🇧🇷 PT-BR', googleCode: 'pt' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortLabel: '🇷🇺', googleCode: 'ru' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', shortLabel: '🇮🇹', googleCode: 'it' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', shortLabel: '🇳🇱', googleCode: 'nl' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska', shortLabel: '🇸🇪', googleCode: 'sv' },
  { code: 'no', label: 'Norwegian', nativeLabel: 'Norsk', shortLabel: '🇳🇴', googleCode: 'no' },
  { code: 'da', label: 'Danish', nativeLabel: 'Dansk', shortLabel: '🇩🇰', googleCode: 'da' },
  { code: 'fi', label: 'Finnish', nativeLabel: 'Suomi', shortLabel: '🇫🇮', googleCode: 'fi' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', shortLabel: '🇵🇱', googleCode: 'pl' },
  { code: 'cs', label: 'Czech', nativeLabel: 'Čeština', shortLabel: '🇨🇿', googleCode: 'cs' },
  { code: 'sk', label: 'Slovak', nativeLabel: 'Slovenčina', shortLabel: '🇸🇰', googleCode: 'sk' },
  { code: 'hu', label: 'Hungarian', nativeLabel: 'Magyar', shortLabel: '🇭🇺', googleCode: 'hu' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Română', shortLabel: '🇷🇴', googleCode: 'ro' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български', shortLabel: '🇧🇬', googleCode: 'bg' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', shortLabel: '🇬🇷', googleCode: 'el' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', shortLabel: '🇹🇷', googleCode: 'tr' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', shortLabel: '🇺🇦', googleCode: 'uk' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', shortLabel: '🇮🇩', googleCode: 'id' },
  { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', shortLabel: '🇲🇾', googleCode: 'ms' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย', shortLabel: '🇹🇭', googleCode: 'th' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', shortLabel: '🇻🇳', googleCode: 'vi' },
  { code: 'fil', label: 'Filipino', nativeLabel: 'Filipino', shortLabel: '🇵🇭', googleCode: 'tl' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', shortLabel: '🇧🇩', googleCode: 'bn' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', shortLabel: '🇵🇰', googleCode: 'ur' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', shortLabel: '🇮🇳', googleCode: 'pa' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', shortLabel: '🇮🇳', googleCode: 'ta' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', shortLabel: '🇮🇳', googleCode: 'te' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', shortLabel: '🇮🇳', googleCode: 'mr' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', shortLabel: '🇮🇳', googleCode: 'gu' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', shortLabel: '🇮🇳', googleCode: 'kn' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', shortLabel: '🇮🇳', googleCode: 'ml' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', shortLabel: '🇱🇰', googleCode: 'si' },
  { code: 'fa', label: 'Persian', nativeLabel: 'فارسی', shortLabel: '🇮🇷', googleCode: 'fa' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', shortLabel: '🇮🇱', googleCode: 'iw' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', shortLabel: '🇰🇪', googleCode: 'sw' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', shortLabel: '🇪🇹', googleCode: 'am' },
  { code: 'ha', label: 'Hausa', nativeLabel: 'Hausa', shortLabel: '🇳🇬', googleCode: 'ha' },
  { code: 'yo', label: 'Yoruba', nativeLabel: 'Yorùbá', shortLabel: '🇳🇬', googleCode: 'yo' },
  { code: 'zu', label: 'Zulu', nativeLabel: 'isiZulu', shortLabel: '🇿🇦', googleCode: 'zu' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans', shortLabel: '🇿🇦', googleCode: 'af' },
  { code: 'sq', label: 'Albanian', nativeLabel: 'Shqip', shortLabel: '🇦🇱', googleCode: 'sq' },
  { code: 'sr', label: 'Serbian', nativeLabel: 'Српски', shortLabel: '🇷🇸', googleCode: 'sr' },
  { code: 'hr', label: 'Croatian', nativeLabel: 'Hrvatski', shortLabel: '🇭🇷', googleCode: 'hr' },
  { code: 'sl', label: 'Slovenian', nativeLabel: 'Slovenščina', shortLabel: '🇸🇮', googleCode: 'sl' },
  { code: 'et', label: 'Estonian', nativeLabel: 'Eesti', shortLabel: '🇪🇪', googleCode: 'et' },
  { code: 'lv', label: 'Latvian', nativeLabel: 'Latviešu', shortLabel: '🇱🇻', googleCode: 'lv' },
  { code: 'lt', label: 'Lithuanian', nativeLabel: 'Lietuvių', shortLabel: '🇱🇹', googleCode: 'lt' },
  { code: 'ga', label: 'Irish', nativeLabel: 'Gaeilge', shortLabel: '🇮🇪', googleCode: 'ga' },
  { code: 'cy', label: 'Welsh', nativeLabel: 'Cymraeg', shortLabel: 'CY', googleCode: 'cy' },
  { code: 'is', label: 'Icelandic', nativeLabel: 'Íslenska', shortLabel: '🇮🇸 ', googleCode: 'is' },
  { code: 'mt', label: 'Maltese', nativeLabel: 'Malti', shortLabel: '🇲🇹', googleCode: 'mt' },
]

const languageFlagCountries: Record<LanguageCode, { code: string; name: string }> = {
  en: { code: 'us', name: 'United States' },
  ne: { code: 'np', name: 'Nepal' },
  hi: { code: 'in', name: 'India' },
  es: { code: 'es', name: 'Spain' },
  fr: { code: 'fr', name: 'France' },
  de: { code: 'de', name: 'Germany' },
  zh: { code: 'cn', name: 'China' },
  ja: { code: 'jp', name: 'Japan' },
  ko: { code: 'kr', name: 'South Korea' },
  ar: { code: 'sa', name: 'Saudi Arabia' },
  pt: { code: 'pt', name: 'Portugal' },
  'pt-br': { code: 'br', name: 'Brazil' },
  ru: { code: 'ru', name: 'Russia' },
  it: { code: 'it', name: 'Italy' },
  nl: { code: 'nl', name: 'Netherlands' },
  sv: { code: 'se', name: 'Sweden' },
  no: { code: 'no', name: 'Norway' },
  da: { code: 'dk', name: 'Denmark' },
  fi: { code: 'fi', name: 'Finland' },
  pl: { code: 'pl', name: 'Poland' },
  cs: { code: 'cz', name: 'Czechia' },
  sk: { code: 'sk', name: 'Slovakia' },
  hu: { code: 'hu', name: 'Hungary' },
  ro: { code: 'ro', name: 'Romania' },
  bg: { code: 'bg', name: 'Bulgaria' },
  el: { code: 'gr', name: 'Greece' },
  tr: { code: 'tr', name: 'Turkey' },
  uk: { code: 'ua', name: 'Ukraine' },
  id: { code: 'id', name: 'Indonesia' },
  ms: { code: 'my', name: 'Malaysia' },
  th: { code: 'th', name: 'Thailand' },
  vi: { code: 'vn', name: 'Vietnam' },
  fil: { code: 'ph', name: 'Philippines' },
  bn: { code: 'bd', name: 'Bangladesh' },
  ur: { code: 'pk', name: 'Pakistan' },
  pa: { code: 'in', name: 'India' },
  ta: { code: 'in', name: 'India' },
  te: { code: 'in', name: 'India' },
  mr: { code: 'in', name: 'India' },
  gu: { code: 'in', name: 'India' },
  kn: { code: 'in', name: 'India' },
  ml: { code: 'in', name: 'India' },
  si: { code: 'lk', name: 'Sri Lanka' },
  fa: { code: 'ir', name: 'Iran' },
  he: { code: 'il', name: 'Israel' },
  sw: { code: 'ke', name: 'Kenya' },
  am: { code: 'et', name: 'Ethiopia' },
  ha: { code: 'ng', name: 'Nigeria' },
  yo: { code: 'ng', name: 'Nigeria' },
  zu: { code: 'za', name: 'South Africa' },
  af: { code: 'za', name: 'South Africa' },
  sq: { code: 'al', name: 'Albania' },
  sr: { code: 'rs', name: 'Serbia' },
  hr: { code: 'hr', name: 'Croatia' },
  sl: { code: 'si', name: 'Slovenia' },
  et: { code: 'ee', name: 'Estonia' },
  lv: { code: 'lv', name: 'Latvia' },
  lt: { code: 'lt', name: 'Lithuania' },
  ga: { code: 'ie', name: 'Ireland' },
  cy: { code: 'gb-wls', name: 'Wales' },
  is: { code: 'is', name: 'Iceland' },
  mt: { code: 'mt', name: 'Malta' },
}

export function getLanguageFlagUrl(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `https://flagcdn.com/w40/${country.code}.png`
}

export function getLanguageFlagAlt(language: LanguageCode) {
  const country = languageFlagCountries[language] ?? languageFlagCountries.en
  return `${country.name} flag`
}

const translations: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
  en: {
    'language.label': 'Language',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.students': 'Students',
    'nav.gallery': 'Gallery',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.dashboard': 'Dashboard',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.donorSignIn': 'Donor Sign In',
    'auth.signInSubtitle': 'Access your dashboard and track your sponsored children',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.signingIn': 'Signing in...',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.verifyBeforeSignIn': 'Please verify your email before signing in. Check your Gmail inbox for the confirmation message.',
    'auth.verificationSent': 'Verification email sent. Please check your Gmail inbox and spam folder.',
    'auth.resendVerification': 'Resend Verification Email',
    'auth.sendingVerification': 'Sending verification...',
    'auth.noAccount': "Don't have an account? ",
    'auth.createAccount': 'Create account',
    'auth.forgotPassword': 'Forgot password?',
    'auth.alreadyAccount': 'Already have an account? ',
    'auth.fullName': 'Full Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.country': 'Country',
    'auth.registerTitle': 'Create Account',
    'auth.registerSubtitle': 'Join our community of donors and sponsors',
    'auth.creatingAccount': 'Creating account...',
    'auth.registrationSuccess': 'Verification email sent. Please check your Gmail inbox and confirm your account before signing in.',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 6 characters',
    'auth.registrationFailed': 'Registration failed',
    'auth.emailVerified': 'Email verified. You can now sign in.',
    'auth.callbackChecking': 'Checking verification',
    'auth.callbackVerified': 'Email verified',
    'auth.callbackFailed': 'Verification failed',
    'auth.callbackMissingCode': 'The verification link is missing a valid session code. Please request a new verification email.',
    'auth.backToSignIn': 'Back to Sign In',
    'footer.ctaTitle': 'Be the reason a child smiles today',
    'footer.ctaText': 'Your sponsorship provides education, meals, healthcare, and hope to underprivileged children in Nepal.',
    'footer.sponsorChild': 'Sponsor a Child',
    'footer.makeDonation': 'Make a Donation',
    'footer.description': 'Providing free education to underprivileged children in Nepal since 1977.',
    'footer.getInvolved': 'Get Involved',
    'footer.volunteer': 'Volunteer',
    'footer.information': 'Information',
    'footer.aboutUs': 'About Us',
    'footer.transparency': 'Transparency',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.nonprofit': 'A registered nonprofit organization in Nepal',
  },
  ne: {
    'language.label': 'भाषा',
    'nav.home': 'गृहपृष्ठ',
    'nav.about': 'हाम्रो बारेमा',
    'nav.students': 'विद्यार्थी',
    'nav.gallery': 'ग्यालरी',
    'nav.news': 'समाचार',
    'nav.contact': 'सम्पर्क',
    'nav.admin': 'प्रशासन',
    'nav.dashboard': 'ड्यासबोर्ड',
    'auth.signIn': 'साइन इन',
    'auth.signUp': 'साइन अप',
    'auth.signOut': 'साइन आउट',
    'auth.donorSignIn': 'दाता साइन इन',
    'auth.signInSubtitle': 'आफ्नो ड्यासबोर्ड हेर्नुहोस् र प्रायोजित बालबालिकाको प्रगति ट्र्याक गर्नुहोस्',
    'auth.email': 'इमेल ठेगाना',
    'auth.password': 'पासवर्ड',
    'auth.signingIn': 'साइन इन हुँदै...',
    'auth.invalidCredentials': 'इमेल वा पासवर्ड मिलेन',
    'auth.verifyBeforeSignIn': 'साइन इन गर्नु अघि इमेल पुष्टि गर्नुहोस्। पुष्टिकरण सन्देशका लागि आफ्नो Gmail इनबक्स जाँच गर्नुहोस्।',
    'auth.verificationSent': 'पुष्टिकरण इमेल पठाइयो। कृपया Gmail इनबक्स र स्पाम फोल्डर जाँच गर्नुहोस्।',
    'auth.resendVerification': 'पुष्टिकरण इमेल पुनः पठाउनुहोस्',
    'auth.sendingVerification': 'पुष्टिकरण पठाइँदै...',
    'auth.noAccount': 'खाता छैन? ',
    'auth.createAccount': 'खाता बनाउनुहोस्',
    'auth.forgotPassword': 'पासवर्ड बिर्सनुभयो?',
    'auth.alreadyAccount': 'पहिल्यै खाता छ? ',
    'auth.fullName': 'पूरा नाम',
    'auth.confirmPassword': 'पासवर्ड पुष्टि गर्नुहोस्',
    'auth.country': 'देश',
    'auth.registerTitle': 'खाता बनाउनुहोस्',
    'auth.registerSubtitle': 'दाता र प्रायोजकहरूको हाम्रो समुदायमा जोडिनुहोस्',
    'auth.creatingAccount': 'खाता बनाउँदै...',
    'auth.registrationSuccess': 'पुष्टिकरण इमेल पठाइयो। साइन इन गर्नु अघि Gmail खोलेर आफ्नो खाता पुष्टि गर्नुहोस्।',
    'auth.passwordMismatch': 'पासवर्डहरू मिलेनन्',
    'auth.passwordTooShort': 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ',
    'auth.registrationFailed': 'दर्ता असफल भयो',
    'auth.emailVerified': 'इमेल पुष्टि भयो। अब साइन इन गर्न सक्नुहुन्छ।',
    'auth.callbackChecking': 'पुष्टिकरण जाँच हुँदै',
    'auth.callbackVerified': 'इमेल पुष्टि भयो',
    'auth.callbackFailed': 'पुष्टिकरण असफल भयो',
    'auth.callbackMissingCode': 'पुष्टिकरण लिंकमा मान्य सेसन कोड छैन। कृपया नयाँ पुष्टिकरण इमेल अनुरोध गर्नुहोस्।',
    'auth.backToSignIn': 'साइन इनमा फर्कनुहोस्',
    'footer.ctaTitle': 'आज एउटा बालबालिकाको मुस्कानको कारण बन्नुहोस्',
    'footer.ctaText': 'तपाईंको प्रायोजनले नेपालका वञ्चित बालबालिकालाई शिक्षा, खाना, स्वास्थ्य सेवा र आशा दिन्छ।',
    'footer.sponsorChild': 'बालबालिका प्रायोजन गर्नुहोस्',
    'footer.makeDonation': 'दान गर्नुहोस्',
    'footer.description': 'सन् १९७७ देखि नेपालका वञ्चित बालबालिकालाई निःशुल्क शिक्षा प्रदान गर्दै।',
    'footer.getInvolved': 'सहभागी हुनुहोस्',
    'footer.volunteer': 'स्वयंसेवा',
    'footer.information': 'जानकारी',
    'footer.aboutUs': 'हाम्रो बारेमा',
    'footer.transparency': 'पारदर्शिता',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'नियम र सर्तहरू',
    'footer.contact': 'सम्पर्क',
    'footer.rights': 'सबै अधिकार सुरक्षित।',
    'footer.nonprofit': 'नेपालमा दर्ता भएको गैरनाफामूलक संस्था',
  },
  hi: {
    'language.label': 'भाषा',
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.students': 'विद्यार्थी',
    'nav.gallery': 'गैलरी',
    'nav.news': 'समाचार',
    'nav.contact': 'संपर्क',
    'nav.admin': 'एडमिन',
    'nav.dashboard': 'डैशबोर्ड',
    'auth.signIn': 'साइन इन',
    'auth.signUp': 'साइन अप',
    'auth.signOut': 'साइन आउट',
    'auth.donorSignIn': 'दाता साइन इन',
    'auth.signInSubtitle': 'अपना डैशबोर्ड खोलें और प्रायोजित बच्चों की प्रगति देखें',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.signingIn': 'साइन इन हो रहा है...',
    'auth.invalidCredentials': 'ईमेल या पासवर्ड गलत है',
    'auth.verifyBeforeSignIn': 'साइन इन करने से पहले अपना ईमेल सत्यापित करें। पुष्टि संदेश के लिए Gmail इनबॉक्स देखें।',
    'auth.verificationSent': 'सत्यापन ईमेल भेजा गया। कृपया Gmail इनबॉक्स और स्पैम फ़ोल्डर देखें।',
    'auth.resendVerification': 'सत्यापन ईमेल फिर भेजें',
    'auth.sendingVerification': 'सत्यापन भेजा जा रहा है...',
    'auth.noAccount': 'खाता नहीं है? ',
    'auth.createAccount': 'खाता बनाएं',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.alreadyAccount': 'पहले से खाता है? ',
    'auth.fullName': 'पूरा नाम',
    'auth.confirmPassword': 'पासवर्ड पुष्टि करें',
    'auth.country': 'देश',
    'auth.registerTitle': 'खाता बनाएं',
    'auth.registerSubtitle': 'दाताओं और प्रायोजकों के हमारे समुदाय से जुड़ें',
    'auth.creatingAccount': 'खाता बन रहा है...',
    'auth.registrationSuccess': 'सत्यापन ईमेल भेजा गया। साइन इन करने से पहले Gmail खोलकर अपना खाता पुष्टि करें।',
    'auth.passwordMismatch': 'पासवर्ड मेल नहीं खाते',
    'auth.passwordTooShort': 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    'auth.registrationFailed': 'पंजीकरण विफल रहा',
    'auth.emailVerified': 'ईमेल सत्यापित हो गया। अब आप साइन इन कर सकते हैं।',
    'auth.callbackChecking': 'सत्यापन जांचा जा रहा है',
    'auth.callbackVerified': 'ईमेल सत्यापित',
    'auth.callbackFailed': 'सत्यापन विफल',
    'auth.callbackMissingCode': 'सत्यापन लिंक में मान्य सेशन कोड नहीं है। कृपया नया सत्यापन ईमेल मांगें।',
    'auth.backToSignIn': 'साइन इन पर वापस जाएं',
    'footer.ctaTitle': 'आज किसी बच्चे की मुस्कान की वजह बनें',
    'footer.ctaText': 'आपका प्रायोजन नेपाल के वंचित बच्चों को शिक्षा, भोजन, स्वास्थ्य सेवा और आशा देता है।',
    'footer.sponsorChild': 'बच्चे को प्रायोजित करें',
    'footer.makeDonation': 'दान करें',
    'footer.description': '1977 से नेपाल के वंचित बच्चों को निःशुल्क शिक्षा प्रदान कर रहे हैं।',
    'footer.getInvolved': 'जुड़ें',
    'footer.volunteer': 'स्वयंसेवा',
    'footer.information': 'जानकारी',
    'footer.aboutUs': 'हमारे बारे में',
    'footer.transparency': 'पारदर्शिता',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'नियम और शर्तें',
    'footer.contact': 'संपर्क',
    'footer.rights': 'सभी अधिकार सुरक्षित।',
    'footer.nonprofit': 'नेपाल में पंजीकृत गैर-लाभकारी संस्था',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur'])
const googleTranslateElementId = 'google_translate_element'

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string
        ) => void
      }
    }
    googleTranslateElementInit?: () => void
  }
}

function getGoogleLanguageCode(language: LanguageCode) {
  return languages.find((item) => item.code === language)?.googleCode ?? language
}

function setGoogleTranslateCookie(language: LanguageCode) {
  const googleLanguage = getGoogleLanguageCode(language)
  const cookieValue = language === 'en' ? '/en/en' : `/en/${googleLanguage}`
  const expires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT'

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax${secure}; ${expires}`
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; SameSite=Lax${secure}; ${expires}`
}

function applyGoogleTranslate(language: LanguageCode) {
  const googleLanguage = getGoogleLanguageCode(language)
  setGoogleTranslateCookie(language)

  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (!combo) return false

  combo.value = language === 'en' ? '' : googleLanguage
  combo.dispatchEvent(new Event('change'))
  return true
}

function loadGoogleTranslate(language: LanguageCode) {
  if (!document.getElementById(googleTranslateElementId)) {
    const container = document.createElement('div')
    container.id = googleTranslateElementId
    container.style.display = 'none'
    container.style.visibility = 'hidden'
    document.body.appendChild(container)
  }

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        googleTranslateElementId
      )
      window.setTimeout(() => applyGoogleTranslate(language), 500)
    }
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script')
    script.id = 'google-translate-script'
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.integrity = 'sha384-0000000000000000000000000000000000000000000000000000000000000000'
    document.body.appendChild(script)
    return
  }

  window.setTimeout(() => applyGoogleTranslate(language), 300)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const previousLanguageRef = useRef(language)

  useEffect(() => {
    window.localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = rtlLanguages.has(language) ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    if (!languages.some((item) => item.code === language)) return
    if (language === 'en') {
      document.cookie = 'googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      return
    }
    try {
      loadGoogleTranslate(language)
    } catch {
      setLanguageState(previousLanguageRef.current)
    }
  }, [language])

  const setLanguage = useCallback((newLanguage: LanguageCode) => {
    if (!languages.some((item) => item.code === newLanguage)) return
    previousLanguageRef.current = language
    setLanguageState(newLanguage)
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language]?.[key] ?? translations.en[key] ?? key,
    }),
    [language, setLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
