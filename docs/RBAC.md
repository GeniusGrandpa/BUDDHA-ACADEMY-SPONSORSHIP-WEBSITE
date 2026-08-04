# Role-Based Access Control

## Roles

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | 100 | Full system access |
| `admin` | 90 | Manage donors, students, content |
| `finance_manager` | 80 | Donations, financial reports, receipts |
| `teacher` | 60 | Assigned students, grades, progress |
| `donor` | 40 | Personal dashboard, sponsorships |
| `volunteer` | 30 | Tasks, events, attendance |
| `public_user` | 10 | Public content only |

## Enforcement Layers

Access is enforced at three independent layers:

### 1. Route Level — `ProtectedRoute`

`ProtectedRoute` (`src/features/auth/guards/ProtectedRoute.tsx`, re-exported from `src/components/ProtectedRoute.tsx`) wraps every gated route in `src/routes.tsx`. It reads the user role from `AuthContext`, handles suspended/banned users by signing them out, and redirects denied users to their role-appropriate dashboard.

Props: `requiredRoles`, `requiredPermission`, `requiredAnyPermission`, `adminOnly`.

### 2. Client Permission Helpers

`src/features/auth/services/permissions.ts` (re-exported from `src/lib/permissions.ts`) provides pure helpers used across pages and components:

- `hasRole(role, ...roles)` — checks the user's role
- `hasPermission(role, code)` / `hasAnyPermission` / `hasAllPermissions` — permission code checks
- `isAdminOrAbove(role)`, `isStaffOrAbove(role)`, `getRoleLevel(role)`
- `canEdit`, `canDelete`, `canManageUsers`, `canViewFinancials`, `canManageContent`, `canManageRole`, `canAccessSection`
- `fetchUserPermissions(role)` — fetches custom permissions

These guard individual buttons, sections, and page-level features (e.g. `HomePageEditor` checks `hasRole(profile?.role, 'super_admin', 'admin')`).

### 3. Server Side — RLS + RPC

Row Level Security policies on every table plus guarded RPC functions enforce authorization independently of the client. Sensitive RPCs are `SECURITY DEFINER` and restricted to `service_role`/authorized roles (e.g. `stripe_confirm_payment`, `verify_payment`, `admin_update_user_role`), so the client cannot bypass checks even if it calls them directly.

## Permission Codes

77 permission codes following the pattern `<entity>.<action>` (e.g., `users.read`, `students.create`, `content.pages`, `payments.verify`), defined in `src/features/auth/types/permissions.ts`.

### Permission Groups

- **CMS & Content**: `content.pages`, `content.seo`, `content.navigation`, `content.settings`, `content.announcements`, `content.partners`, `content.media`, `content.news`, `content.gallery`, `content.testimonials`, `content.stories`, `content.faqs`, `content.videos`, `content.transparency` (vestigial: `content.blocks`, `content.media.folders`, `content.scheduling` — exist in codebase but have no active UI)
- **Design**: `design.colors`, `design.typography`, `design.layout`, `design.components`, `design.presets`, `design.publish`
- **Students**: `students.read`, `students.create`, `students.update`, `students.delete`
- **Donations**: `donations.read`, `donations.create`, `donations.update`, `donations.delete`
- **Payments**: `payments.verify`, `payments.settings`, `payments.refund`
- **Finance**: `finances.read`, `finances.reports`, `finances.budget`
- **Users**: `users.read`, `users.create`, `users.update`, `users.delete`, `users.manage_roles`, `users.suspend`, `users.invite`
- **Audit**: `audit.read`
- **Sponsorships**: `sponsorships.read`, `sponsorships.create`, `sponsorships.update`, `sponsorships.delete`
- **Events**: `events.read`, `events.create`, `events.update`, `events.delete`
- **Volunteers**: `volunteers.read`, `volunteers.manage`
- **Reports**: `reports.read`, `reports.export`
- **Settings**: `settings.general`, `settings.security`

## Default Permission Mappings

- **super_admin** — all permissions
- **admin** — all CMS/content/design/student/donation/finance permissions except user management and audit
- **finance_manager** — financial, donation, payment verification permissions
- **teacher** — student read/update, limited content read
- **donor** — personal dashboard, own sponsorships/donations
- **volunteer** — events, tasks, own profile
- **public_user** — public content only

## Navigation Filtering

The sidebar is filtered per role via `getNavigationForRole()`. Each nav item can specify `roles` or `permission` requirements. Items the user cannot access are hidden.

## Role Management Security

- `admin_update_user_role()` RPC enforces: admin can only manage roles below their own level
- Self-role-change is prevented at database level
- Last super_admin removal is prevented by server-side constraint
- All role changes are audit-logged
