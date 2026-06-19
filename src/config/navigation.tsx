import type { Role, PermissionCode } from '../types/permissions'
import { DEFAULT_ROLE_PERMISSIONS } from '../types/permissions'

export interface NavItem {
  label: string
  href: string
  roles?: Role[]
  permission?: PermissionCode
  children?: NavItem[]
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
  roles?: Role[]
  permission?: PermissionCode
}

export const navigationConfig: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        roles: ['super_admin', 'admin', 'donor', 'volunteer', 'finance_manager', 'teacher'],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Students',
        href: '/admin/students',
        permission: 'students.read',
      },
      {
        label: 'Sponsorships',
        href: '/admin/sponsorships',
        permission: 'sponsorships.read',
      },
      {
        label: 'Donations',
        href: '/admin/donations',
        permission: 'donations.read',
      },
      {
        label: 'Donors',
        href: '/admin/donors',
        permission: 'users.read',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        label: 'Homepage',
        href: '/admin/content/homepage',
        permission: 'content.homepage',
      },
      {
        label: 'News',
        href: '/admin/content/news',
        permission: 'news.create',
      },
      {
        label: 'Gallery',
        href: '/admin/content/gallery',
        permission: 'gallery.create',
      },
      {
        label: 'Videos',
        href: '/admin/content/videos',
        permission: 'content.videos',
      },
      {
        label: 'Testimonials',
        href: '/admin/content/testimonials',
        permission: 'testimonials.update',
      },
      {
        label: 'Student Stories',
        href: '/admin/content/stories',
        permission: 'content.stories',
      },
      {
        label: 'Transparency',
        href: '/admin/content/transparency',
        permission: 'content.pages',
      },
      {
        label: 'FAQs',
        href: '/admin/content/faqs',
        permission: 'content.faqs',
      },
      {
        label: 'Media Library',
        href: '/admin/content/media',
        permission: 'content.media',
      },
      {
        label: 'Site Settings',
        href: '/admin/content/settings',
        permission: 'content.settings',
      },
      {
        label: 'Navigation',
        href: '/admin/content/navigation',
        permission: 'content.navigation',
      },
      {
        label: 'Announcements',
        href: '/admin/content/announcements',
        permission: 'content.announcements',
      },
      {
        label: 'Partners',
        href: '/admin/content/partners',
        permission: 'content.partners',
      },
      {
        label: 'About Page',
        href: '/admin/content/pages/about',
        permission: 'content.pages',
      },
      {
        label: 'Contact Page',
        href: '/admin/content/pages/contact',
        permission: 'content.pages',
      },
      {
        label: 'Volunteer Page',
        href: '/admin/content/pages/volunteer',
        permission: 'content.pages',
      },
      {
        label: 'Privacy Policy',
        href: '/admin/content/pages/privacy',
        permission: 'content.pages',
      },
      {
        label: 'Terms of Service',
        href: '/admin/content/pages/terms',
        permission: 'content.pages',
      },
      {
        label: 'News',
        href: '/admin/news',
        permission: 'news.read',
      },
      {
        label: 'Gallery',
        href: '/admin/gallery',
        permission: 'gallery.read',
      },
      {
        label: 'Contacts',
        href: '/admin/contacts',
        permission: 'contacts.read',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Finance',
        href: '/admin/finance',
        permission: 'finances.read',
      },
      {
        label: 'Payment Verification',
        href: '/admin/payments/verify',
        permission: 'donations.update',
      },
      {
        label: 'Payment Settings',
        href: '/admin/payments/settings',
        permission: 'payment_settings.manage',
        roles: ['super_admin', 'admin'],
      },
      {
        label: 'Volunteers',
        href: '/admin/volunteers',
        permission: 'volunteers.read',
      },
      {
        label: 'Events',
        href: '/admin/events',
        permission: 'events.read',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Notifications',
        href: '/admin/notifications',
        permission: 'notifications.read',
      },
    ],
  },
  {
    title: 'Design',
    items: [
      {
        label: 'Theme Dashboard',
        href: '/admin/design',
        permission: 'content.settings',
      },
      {
        label: 'Branding',
        href: '/admin/design/branding',
        permission: 'content.settings',
      },
      {
        label: 'Colors',
        href: '/admin/design/colors',
        permission: 'content.settings',
      },
      {
        label: 'Typography',
        href: '/admin/design/typography',
        permission: 'content.settings',
      },
      {
        label: 'Layout',
        href: '/admin/design/layout',
        permission: 'content.settings',
      },
      {
        label: 'Components',
        href: '/admin/design/components',
        permission: 'content.settings',
      },
      {
        label: 'Config',
        href: '/admin/design/config',
        permission: 'content.settings',
      },
      {
        label: 'Theme Presets',
        href: '/admin/design/presets',
        permission: 'content.settings',
      },
    ],
  },
  {
    title: 'Reporting',
    items: [
      {
        label: 'Reports',
        href: '/admin/reports',
        permission: 'reports.read',
      },
    ],
  },
  {
    title: 'Security',
    roles: ['super_admin'],
    items: [
      {
        label: 'User Management',
        href: '/super-admin/users',
        roles: ['super_admin'],
      },
      {
        label: 'Roles & Permissions',
        href: '/super-admin/roles',
        roles: ['super_admin'],
      },
      {
        label: 'Audit Logs',
        href: '/super-admin/audit',
        roles: ['super_admin'],
      },
      {
        label: 'Send Notification',
        href: '/super-admin/notifications',
        roles: ['super_admin'],
        permission: 'notifications.send',
      },
    ],
  },
]

export function getNavigationForRole(role: Role | undefined | null, userPermissions?: PermissionCode[] | null): NavSection[] {
  if (!role) return []

  const hasPerms = userPermissions && userPermissions.length > 0

  return navigationConfig
    .filter(section => {
      if (section.roles && !section.roles.includes(role)) return false
      if (section.permission) {
        if (role === 'super_admin') return true
        if (hasPerms) return userPermissions!.includes(section.permission)
        return DEFAULT_ROLE_PERMISSIONS[role]?.includes(section.permission) ?? false
      }
      return true
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.roles && !item.roles.includes(role)) return false
        if (item.permission) {
          if (role === 'super_admin') return true
          if (hasPerms) return userPermissions!.includes(item.permission)
          return DEFAULT_ROLE_PERMISSIONS[role]?.includes(item.permission) ?? false
        }
        return true
      }),
    }))
    .filter(section => section.items.length > 0)
}

export function getDashboardForRole(role: Role): string {
  const dashboards: Record<Role, string> = {
    super_admin: '/admin',
    admin: '/admin',
    finance_manager: '/admin/finance',
    teacher: '/teacher',
    donor: '/dashboard',
    volunteer: '/dashboard',
    public_user: '/',
  }
  return dashboards[role] || '/'
}
