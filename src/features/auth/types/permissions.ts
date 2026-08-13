export type Role =
  | 'super_admin'
  | 'admin'
  | 'finance_manager'
  | 'donor'
  | 'volunteer'
  | 'public_user'

export type PermissionCode =
  | 'users.read' | 'users.create' | 'users.update' | 'users.delete'
  | 'users.manage_roles' | 'users.invite' | 'users.suspend'
  | 'students.read' | 'students.create' | 'students.update' | 'students.delete'
  | 'donations.read' | 'donations.create' | 'donations.update' | 'donations.delete' | 'donations.export'
  | 'sponsorships.read' | 'sponsorships.create' | 'sponsorships.update' | 'sponsorships.delete' | 'sponsorships.renew'
  | 'news.read' | 'news.create' | 'news.update' | 'news.delete'
  | 'gallery.read' | 'gallery.create' | 'gallery.update' | 'gallery.delete'
  | 'contacts.read' | 'contacts.update'
  | 'finances.read' | 'finances.export' | 'finances.receipts'
  | 'volunteers.read' | 'volunteers.create' | 'volunteers.update' | 'volunteers.delete' | 'volunteers.assign'
  | 'events.read' | 'events.create' | 'events.update' | 'events.delete'
  | 'audit.read' | 'audit.export'
  | 'notifications.read' | 'notifications.send'
  | 'reports.generate' | 'reports.read'
  | 'profile.read' | 'profile.update' | 'profile.delete'
  | 'goals.read' | 'goals.update'
  | 'testimonials.read' | 'testimonials.update'
  | 'impact.read' | 'impact.update'
  | 'certificates.read' | 'certificates.create'
  | 'payments.read' | 'payments.verify' | 'payments.settings'
  | 'payment_settings.view' | 'payment_settings.manage' | 'payment_settings.audit'
  | 'content.pages' | 'content.homepage' | 'content.videos'
  | 'content.faqs' | 'content.stories' | 'content.media'
  | 'content.navigation' | 'content.settings' | 'content.announcements'
  | 'content.partners' | 'content.blocks' | 'content.seo'
  | 'content.media.folders' | 'content.scheduling'
  | 'content.legal'

export const ROLE_NAMES: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  finance_manager: 'Finance Manager',
  donor: 'Donor',
  volunteer: 'Volunteer',
  public_user: 'Public User',
}

export const ROLE_LEVELS: Record<Role, number> = {
  super_admin: 100,
  admin: 90,
  finance_manager: 80,
  donor: 40,
  volunteer: 30,
  public_user: 10,
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: 'Full platform access with system configuration',
  admin: 'Manage donors, students, content, and moderate system',
  finance_manager: 'Manage donations, financial reports, receipts, payments',
  donor: 'Personal dashboard, sponsorship access, donations, certificates',
  volunteer: 'Volunteer dashboard, assigned tasks, events, attendance',
  public_user: 'Browse public content only',
}

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: 'bg-orange-100 text-orange-700 border-orange-200',
  admin: 'bg-amber-100 text-amber-700 border-amber-200',
  finance_manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  donor: 'bg-green-100 text-green-700 border-green-200',
  volunteer: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  public_user: 'bg-gray-100 text-gray-700 border-gray-200',
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  phone_code: string | null
  country: string
  role: Role
  avatar_url: string | null
  bio: string | null
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'deleted'
  last_login_at: string | null
  login_attempts: number
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionCode[]> = {
  super_admin: [
    'users.read', 'users.create', 'users.update', 'users.delete', 'users.manage_roles', 'users.invite', 'users.suspend',
    'students.read', 'students.create', 'students.update', 'students.delete',
    'donations.read', 'donations.create', 'donations.update', 'donations.delete', 'donations.export',
    'sponsorships.read', 'sponsorships.create', 'sponsorships.update', 'sponsorships.delete', 'sponsorships.renew',
    'news.read', 'news.create', 'news.update', 'news.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete',
    'contacts.read', 'contacts.update',
    'finances.read', 'finances.export', 'finances.receipts',
    'volunteers.read', 'volunteers.create', 'volunteers.update', 'volunteers.delete', 'volunteers.assign',
    'events.read', 'events.create', 'events.update', 'events.delete',
    'audit.read', 'audit.export',
    'notifications.read', 'notifications.send',
    'reports.generate', 'reports.read',
    'profile.read', 'profile.update', 'profile.delete',
    'goals.read', 'goals.update',
    'testimonials.read', 'testimonials.update',
    'impact.read', 'impact.update',
    'certificates.read', 'certificates.create',
    'payments.read', 'payments.verify', 'payments.settings',
    'payment_settings.view', 'payment_settings.manage', 'payment_settings.audit',
    'content.pages', 'content.homepage', 'content.videos',
    'content.faqs', 'content.stories', 'content.media',
    'content.navigation', 'content.settings', 'content.announcements',
    'content.partners', 'content.blocks', 'content.seo',
    'content.media.folders', 'content.scheduling',
    'content.legal',
  ],
  admin: [
    'users.read',
    'students.read', 'students.create', 'students.update', 'students.delete',
    'donations.read', 'donations.create', 'donations.update', 'donations.export',
    'sponsorships.read', 'sponsorships.create', 'sponsorships.update', 'sponsorships.delete', 'sponsorships.renew',
    'news.read', 'news.create', 'news.update', 'news.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete',
    'contacts.read', 'contacts.update',
    'finances.read', 'finances.receipts',
    'volunteers.read', 'volunteers.create', 'volunteers.update',
    'volunteers.delete', 'volunteers.assign',
    'events.read', 'events.create', 'events.update', 'events.delete',
    'audit.read', 'audit.export',
    'notifications.read',
    'reports.read', 'reports.generate',
    'profile.read', 'profile.update',
    'goals.read', 'goals.update',
    'testimonials.read', 'testimonials.update',
    'impact.read', 'impact.update',
    'certificates.read', 'certificates.create',
    'payments.read', 'payments.verify',
    'payment_settings.view', 'payment_settings.manage',
    'content.pages', 'content.homepage', 'content.videos',
    'content.faqs', 'content.stories', 'content.media',
    'content.navigation', 'content.settings', 'content.announcements',
    'content.partners', 'content.blocks', 'content.seo',
    'content.media.folders', 'content.scheduling',
    'content.legal',
  ],
  finance_manager: [
    'users.read',
    'donations.read', 'donations.create', 'donations.update', 'donations.export',
    'finances.read', 'finances.export', 'finances.receipts',
    'students.read',
    'sponsorships.read',
    'audit.read',
    'reports.read', 'reports.generate',
    'notifications.read',
    'profile.read', 'profile.update',
    'contacts.read',
    'goals.read',
    'impact.read',
    'certificates.read', 'certificates.create',
    'payments.read', 'payments.verify',
  ],
  donor: [
    'students.read',
    'donations.read', 'donations.create',
    'sponsorships.read',
    'news.read',
    'gallery.read',
    'notifications.read',
    'profile.read', 'profile.update',
    'contacts.read',
    'goals.read',
    'testimonials.read',
    'impact.read',
    'certificates.read',
  ],
  volunteer: [
    'students.read',
    'news.read',
    'gallery.read',
    'events.read',
    'volunteers.read',
    'notifications.read',
    'profile.read', 'profile.update',
  ],
  public_user: [
    'students.read',
    'news.read',
    'gallery.read',
    'profile.read', 'profile.update',
    'goals.read',
    'testimonials.read',
    'impact.read',
  ],
}

export interface PermissionGroup {
  group: string
  permissions: { code: PermissionCode; name: string; description: string }[]
}

export const ALL_PERMISSIONS: PermissionGroup[] = [
  {
    group: 'Students',
    permissions: [
      { code: 'students.read', name: 'Read Students', description: 'View student profiles' },
      { code: 'students.create', name: 'Create Students', description: 'Add new students' },
      { code: 'students.update', name: 'Update Students', description: 'Edit student information' },
    ],
  },
  {
    group: 'Donations',
    permissions: [
      { code: 'donations.read', name: 'Read Donations', description: 'View donation records' },
      { code: 'donations.create', name: 'Create Donations', description: 'Make new donations' },
      { code: 'donations.update', name: 'Update Donations', description: 'Modify donation records' },
    ],
  },
  {
    group: 'Sponsorships',
    permissions: [
      { code: 'sponsorships.read', name: 'Read Sponsorships', description: 'View sponsorship records' },
      { code: 'sponsorships.create', name: 'Create Sponsorships', description: 'Start new sponsorships' },
      { code: 'sponsorships.update', name: 'Update Sponsorships', description: 'Modify sponsorship records' },
    ],
  },
  {
    group: 'Content',
    permissions: [
      { code: 'news.read', name: 'Read News', description: 'View news articles' },
      { code: 'news.create', name: 'Create News', description: 'Create news articles' },
      { code: 'news.update', name: 'Update News', description: 'Edit news articles' },
      { code: 'gallery.read', name: 'Read Gallery', description: 'View gallery items' },
      { code: 'gallery.create', name: 'Create Gallery', description: 'Add gallery items' },
    ],
  },
  {
    group: 'Finance',
    permissions: [
      { code: 'finances.read', name: 'Read Finances', description: 'View financial data and reports' },
      { code: 'finances.receipts', name: 'Manage Receipts', description: 'Generate donation receipts' },
    ],
  },
  {
    group: 'Content Management',
    permissions: [
      { code: 'content.pages', name: 'Manage Pages', description: 'Edit homepage, about, and transparency page content' },
      { code: 'content.homepage', name: 'Manage Homepage', description: 'Edit homepage sections like hero, stats, features' },
      { code: 'content.videos', name: 'Manage Videos', description: 'Upload and manage video content' },
      { code: 'content.faqs', name: 'Manage FAQs', description: 'Create and manage frequently asked questions' },
      { code: 'content.stories', name: 'Manage Stories', description: 'Manage student success stories' },
      { code: 'content.media', name: 'Media Library', description: 'Upload and manage media assets' },
      { code: 'content.media.folders', name: 'Manage Media Folders', description: 'Create and manage media folder organization' },
      { code: 'content.navigation', name: 'Manage Navigation', description: 'Edit navigation menus, footer links, and quick links' },
      { code: 'content.settings', name: 'Manage Site Settings', description: 'Edit global site settings like name, logo, social links' },
      { code: 'content.announcements', name: 'Manage Announcements', description: 'Create and manage announcement banners' },
      { code: 'content.partners', name: 'Manage Partners', description: 'Manage partner and sponsor logos' },
      { code: 'content.blocks', name: 'Manage Page Blocks', description: 'Manage page builder blocks and layout' },
      { code: 'content.seo', name: 'Manage SEO', description: 'Edit SEO metadata for pages' },
      { code: 'content.scheduling', name: 'Content Scheduling', description: 'Schedule content publishing and unpublishing' },
      { code: 'content.legal', name: 'Manage Legal Pages', description: 'Edit Privacy Policy and Terms & Conditions pages' },
    ],
  },
  {
    group: 'Goals & Impact',
    permissions: [
      { code: 'goals.read', name: 'Read Goals', description: 'View donation goals' },
      { code: 'goals.update', name: 'Update Goals', description: 'Edit donation goals' },
      { code: 'impact.read', name: 'Read Impact', description: 'View impact metrics' },
      { code: 'impact.update', name: 'Update Impact', description: 'Edit impact metrics' },
    ],
  },
  {
    group: 'Payment Settings',
    permissions: [
      { code: 'payment_settings.view', name: 'View Payment Settings', description: 'View payment gateway configurations and account details' },
      { code: 'payment_settings.manage', name: 'Manage Payment Settings', description: 'Create, update, toggle payment gateways and account info' },
      { code: 'payment_settings.audit', name: 'Audit Payment Settings', description: 'View audit logs related to payment settings changes' },
    ],
  },
  {
    group: 'Profile',
    permissions: [
      { code: 'profile.read', name: 'Read Profile', description: 'View own profile' },
      { code: 'profile.update', name: 'Update Profile', description: 'Edit own profile' },
    ],
  },
]
