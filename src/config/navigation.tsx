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
    title: 'Website',
    items: [
      {
        label: 'Website Dashboard',
        href: '/admin/website',
        permission: 'content.homepage',
      },
      {
        label: 'Visual Builder',
        href: '/admin/website/builder',
        permission: 'content.homepage',
      },
      {
        label: 'Home Page',
        href: '/admin/website/homepage',
        permission: 'content.homepage',
      },
      {
        label: 'About Page',
        href: '/admin/website/about',
        permission: 'content.homepage',
      },
      {
        label: 'Sponsorship',
        href: '/admin/website/sponsorship',
        permission: 'content.homepage',
      },
      {
        label: 'Donations',
        href: '/admin/website/donation',
        permission: 'content.homepage',
      },
      {
        label: 'Contact Page',
        href: '/admin/website/contact',
        permission: 'content.homepage',
      },
      {
        label: 'Campaigns',
        href: '/admin/website/campaigns',
        permission: 'content.homepage',
      },
      {
        label: 'Navigation',
        href: '/admin/website/navigation',
        permission: 'content.navigation',
      },
      {
        label: 'Media Library',
        href: '/admin/website/media',
        permission: 'content.media',
      },
      {
        label: 'Branding',
        href: '/admin/website/branding',
        permission: 'content.settings',
      },
      {
        label: 'SEO',
        href: '/admin/website/seo',
        permission: 'content.settings',
      },
      {
        label: 'Footer',
        href: '/admin/website/footer',
        permission: 'content.settings',
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
      {
        label: 'User Management',
        href: '/admin/users',
        roles: ['super_admin', 'admin'],
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
