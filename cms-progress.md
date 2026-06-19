## Goal
- Upgrade CMS into a fully dynamic Website Management System where Admin/Super Admin can control almost every visible section without touching code. All 10 phases planned; Phases 1-9 are done.

## Constraints & Preferences
- Do NOT break existing functionality
- Do NOT redesign the whole app unnecessarily
- Keep the current visual identity and layout style
- Maintain clean TypeScript types and modular architecture
- Follow RBAC properly (super_admin gets all new permissions, admin gets content.* permissions)
- Keep the system realistic for a real NGO/sponsorship platform
- No fake/demo/sample data — everything seeded with real defaults
- Everything should be maintainable and extensible (modular folder structure, typed block registry)

## Progress
### Done
- **Phase 1: Database migrations** — `supabase/migrations/20260704000002_cms_upgrade_tables.sql` creates:
  - `site_settings` (singleton row for global config: site name, logo, contact info, social links, SEO defaults, donation settings, maintenance mode, announcement banner)
  - `navigation_items` (menus with parent_id, location, label, route/url, icon, target, CTA styling, role restrictions, ordering)
  - `announcements` (title, content, type, link, scheduling dates, dismissible flag)
  - `partners` (name, logo_url, website, type: sponsor/donor/partner/media/community/government, featured flag)
  - Extended `pages` table with `blocks JSONB` and `seo JSONB` columns
  - Extended `media_library` with `folder`, `width`, `height`, `file_hash`, `usage_count` columns
  - Added RLS policies for all new tables (public read, staff select all, admin CRUD, role_level >= 90)
  - Added audit triggers for all new tables
  - Seeded default site_settings row and navigation_items (header nav + footer links)
  - Added grants for anon + authenticated roles
- **Phase 2: TypeScript types + services** — Created type definitions in `src/types/cms.ts` and service files:
  - `src/services/settings.ts`: `getSiteSettings`, `updateSiteSettings`
  - `src/services/navigation.ts`: `getNavigationItems`, `getNavigationItemById`, `createNavigationItem`, `updateNavigationItem`, `deleteNavigationItem`, `reorderNavigationItems`, `buildNavigationTree`
  - `src/services/announcements.ts`: `getAnnouncements` (with active-only date filter), `getAnnouncementById`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`
  - `src/services/partners.ts`: `getPartners` (type + visible filters), `getPartnerById`, `createPartner`, `updatePartner`, `deletePartner`, `reorderPartners`
  - `src/services/pageBlocks.ts`: `getPageBlocks`, `updatePageBlocks`, `getPageSeo`, `updatePageSeo`, `getPageBySlugWithBlocks`
  - Updated `src/features/auth/types/permissions.ts` with 8 new permission codes: `content.navigation`, `content.settings`, `content.announcements`, `content.partners`, `content.blocks`, `content.seo`, `content.media.folders`, `content.scheduling`; added all to DEFAULT_ROLE_PERMISSIONS for super_admin/admin; added to ALL_PERMISSIONS groups
  - Updated `src/config/navigation.tsx` with new admin sidebar links: Site Settings, Navigation, Announcements, Partners
  - Updated `src/routes.tsx` with lazy imports + routes for all 4 new admin pages
- **Phase 3: Admin CMS pages** — Created 4 full CRUD admin pages:
  - `AdminSiteSettings.tsx`: Branding, Contact, Social, SEO Defaults, Footer, Donation Settings, Announcement Banner, Maintenance Mode — single-page form with Save All Settings
  - `AdminNavigationManager.tsx`: Tabbed by location (header, footer sections, quick links), reorderable list with drag-and-drop, modal create/edit (label, route, external URL, CTA style, visibility, role restriction, target)
  - `AdminAnnouncements.tsx`: List with type color indicators, scheduled dates, active/toggle switches, modal create/edit with date pickers
  - `AdminPartners.tsx`: Filterable by partner type, reorderable via drag-and-drop, logo preview, featured star indicator, modal create/edit
  - All pages follow existing pattern (useState/useEffect, react-hot-toast, framer-motion, consistent UI components)
- **Phase 4: Block Component Registry** — Built dynamic block rendering system:
  - `src/components/blocks/BlockRenderer.tsx`: Maps 18 block types to React components (hero, text, rich_content, image, gallery, cta, donation, student_cards, testimonials, faq, stats, timeline, video, sponsors, partners, announcements, custom_section, default) — each uses `content`, `settings`, `textAlignment`, `maxWidth` from the PageBlock schema
  - `src/components/blocks/DynamicPage.tsx`: Fetches page by slug, renders visible blocks via BlockRenderer, injects SEO metadata via react-helmet, handles loading/not-found/empty states
- **Phase 5: Header/Footer CMS loading** — Rewrote both layout components to fetch data from CMS:
  - `src/layout/Header.tsx`: Loads nav items from `getNavigationItems('header')`, loads site name/logo from `getSiteSettings()` — falls back to hardcoded nav and fallback logo if CMS unavailable
  - `src/layout/Footer.tsx`: Loads footer sections from `getNavigationItems('footer_*')`, loads all contact/social info from `getSiteSettings()` — falls back to language translations and default links
- **Phase 6: AdminPageEditor SEO + blocks** — Updated `AdminPageEditor.tsx` with tabbed interface (Content / SEO / Blocks):
  - **Content tab**: existing form for editing page content fields
  - **SEO tab**: meta title, description, keywords, OG tags, canonical URL, no-index toggle
  - **Blocks tab**: drag-to-reorder block list; add blocks via dropdown with all 18 types; inline editing for title, visibility, settings (bg color, padding, alignment, max-width), and content fields; delete blocks
  - Updated `src/types/database.ts` to include `seo` and `blocks` columns in the `pages` table type
- Build passes cleanly

## Key Decisions
- **Separate tables for new entities** rather than stuffing everything into a single JSON blob — cleaner RLS, indexing, querying, and type safety
- **Extended existing `pages` table** with `blocks JSONB` and `seo JSONB` rather than creating a separate page_blocks table — simpler, one query per page, no join overhead
- **Block Component Registry** as a switch statement over `PageBlockType` — explicit, type-safe, easy to extend by adding a case; each block gets `content`, `settings`, `textAlignment`, `maxWidth` from the schema
- **Navigation hierarchy via parent_id** — supports unlimited nesting for dropdown menus while keeping the schema simple
- **Permission codes follow existing pattern** (`content.navigation`, `content.settings`) — already wired into `DEFAULT_ROLE_PERMISSIONS` and `ALL_PERMISSIONS` groups
- **Fallback patterns in Header/Footer** — CMS calls are non-blocking; if they fail, the components render with hardcoded defaults, preserving existing behavior
- **Version tracking via existing audit_logs table** — all new tables have audit triggers pointing to the same audit infrastructure

## Relevant Files
- `supabase/migrations/20260704000002_cms_upgrade_tables.sql`: Creates 4 new tables + extends 2 existing tables + RLS + audit triggers + seed data
- `src/types/cms.ts`: All new TypeScript types (SiteSettings, NavigationItem, Announcement, Partner, PageBlock, SeoMetadata, etc.)
- `src/types/database.ts`: Updated `pages` table type with `seo` and `blocks` columns
- `src/services/settings.ts`, `navigation.ts`, `announcements.ts`, `partners.ts`, `pageBlocks.ts`, `content.ts`: Service functions
- `src/pages/admin/cms/AdminPageEditor.tsx`: Updated with tabs for Content, SEO metadata, and Blocks management
- `src/pages/admin/cms/AdminSiteSettings.tsx`, `AdminNavigationManager.tsx`, `AdminAnnouncements.tsx`, `AdminPartners.tsx`: Admin CRUD pages
- `src/components/blocks/BlockRenderer.tsx`: Registry of 18 block type renderers
- `src/components/blocks/DynamicPage.tsx`: Dynamic page renderer with SEO injection
- `src/layout/Header.tsx`, `Footer.tsx`: Rewritten to load nav + settings from CMS with fallbacks
- `src/routes.tsx`: Added lazy imports + routes for all 4 new admin pages
- `src/config/navigation.tsx`: Added sidebar links for Settings, Navigation, Announcements, Partners
- `src/features/auth/types/permissions.ts`: Added 8 new permission codes
