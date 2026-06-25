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

Checked on every navigation. Fetches user role directly from Supabase `profiles` table. Handles suspended/banned users by signing them out.

Props: `requiredRoles`, `requiredPermission`, `requiredAnyPermission`, `adminOnly`.

If denied, redirects to the user's role-appropriate dashboard.

### 2. Component Level — `PermissionGuard`

Conditionally renders children based on permission checks. Props:
- `permission` (single PermissionCode)
- `anyPermission` (PermissionCode[])
- `allPermissions` (PermissionCode[])
- `roles` (Role[])
- `fallback` (custom fallback)
- `showAccessDenied` (defaults to true)

### 3. Function Level — `useProtectedAction`

Wraps callbacks and silently denies execution without the required permission.

## Permission Codes

~80 permission codes following the pattern `<entity>.<action>` (e.g., `users.read`, `students.create`, `content.pages`, `payments.verify`).

### Permission Groups

- **CMS & Content**: `content.pages`, `content.blocks`, `content.seo`, `content.navigation`, `content.settings`, `content.announcements`, `content.partners`, `content.media`, `content.media.folders`, `content.scheduling`, `content.news`, `content.gallery`, `content.testimonials`, `content.stories`, `content.faqs`, `content.videos`, `content.transparency`
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
