const PAGE_ID_BY_SEGMENT: Record<string, string> = {
  '': 'home',
  home: 'home',
  about: 'about',
  sponsor: 'sponsor',
  students: 'students',
  gallery: 'gallery',
  news: 'news',
  contact: 'contact',
  donate: 'donate',
  transparency: 'transparency',
  faq: 'faq',
  volunteer: 'volunteer',
  campaigns: 'campaigns',
  'success-stories': 'success-stories',
  activity: 'activity',
  privacy: 'privacy',
  terms: 'terms',
  login: 'auth',
  register: 'auth',
  'forgot-password': 'auth',
  'reset-password': 'auth',
  preview: 'preview',
}

export const GLOBAL_PAGE_ID = 'global'
export const CMS_PAGE_ID = 'cms'

export function getPageIdFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  return PAGE_ID_BY_SEGMENT[segment] ?? GLOBAL_PAGE_ID
}