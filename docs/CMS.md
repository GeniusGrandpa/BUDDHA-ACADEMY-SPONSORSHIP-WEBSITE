# CMS & Design System

Admin and Super Admin can manage all visible website content dynamically through the CMS, without touching code.

## Website Management Hub (`/admin/website`)

The entry point is `/admin/website` which renders `WebsiteDashboard` — a categorized dashboard organizing all content tools.

### Dashboard Groups

| Group | Items |
|-------|-------|
| **Home Page** | Homepage sections (Hero, About preview, Stats, Features, Impact, CTA, Partners, Gallery preview, Testimonials) |
| **About Page** | Mission, Vision, Stats, Core Values, Timeline, About Images |
| **Sponsorship Page** | Hero, Packages, How It Works, Benefits, CTA |
| **Donation Page** | Hero, Impact Cards, Process Steps, CTA |
| **Contact Page** | Header, Contact Details, Form Labels (21 strings) |
| **Student Sections** | Student Stories, Testimonials, Gallery, News & Updates, Videos |
| **Content Collections** | FAQs, Media Library, Navigation, Site Settings, Announcements, Partners, Section Visibility, Site Images, Version History |
| **Global Settings** | Branding, Colors, Typography, Layout, Components, Config, Presets, SEO |
| **Other Pages** | Volunteer Page, Privacy Policy, Terms of Service, Footer Content, Transparency Content, Campaigns |

### Dedicated Page Editors

| Editor | Route | Purpose |
|--------|-------|---------|
| AboutPageEditor | `/admin/website/about` | Mission, vision, stats, core values, timeline, images |
| ContactPageEditor | `/admin/website/contact` | Contact details and 21 form label/string fields |
| CampaignsEditor | `/admin/website/campaigns` | Donation goals CRUD (title, target, raised, dates, active) |
| PrivacyPageEditor | `/admin/website/privacy` | Privacy policy header, body content, last updated date |
| TermsPageEditor | `/admin/website/terms` | Terms of service header, body content, last updated date |
| HomePageEditor | `/admin/website/homepage` | Hero, welcome, stats, and section-based homepage content editor |
| BrandingEditor | `/admin/website/branding` | Unified branding/colors/typography/layout/components |
| SEOEditor | `/admin/website/seo` | Per-page SEO meta tags |

The 3-panel visual builder lives at `/admin/website/builder` (WebsiteBuilder).

### Legacy Redirects

All old `/admin/content/*` routes now redirect to `/admin/website/*` via `<Navigate>` in `routes.tsx`. Bookmarks are preserved.

## WebsiteBuilder (`/admin/website/builder`)

A 3-panel live preview visual builder that replaces the old block-based homepage editor:

```
┌─────────────────────────────────────────────────┐
│ [Desktop] [Tablet] [Mobile]   Save Draft Publish │
├──────────┬──────────────────────┬────────────────┤
│ Sidebar  │  Live Preview        │ Properties     │
│ Pages    │                      │ Panel          │
│ ├─ Home  │  ┌──────────────┐   │                │
│ ├─ About │  │  Hero        │   │ Section Title  │
│ ├─ Spons │  │  "..."       │   │ [___________]  │
│ ├─ Donat │  │              │   │ Description    │
│ ├─ Conta │  │  Stats       │   │ [___________]  │
│ ├─ Galle │  │  500 Students│   │                │
│ ├─ FAQ   │  │  47 Years    │   │                │
│ ├─ Volun │  │              │   │                │
│ ├- Priva │  │  Features    │   │                │
│ └─ Terms │  │  ...         │   │                │
│          │  └──────────────┘   │                │
│ Sections │                      │                │
│ [≡ Hero] │                      │                │
│ [≡ Stats]│                      │                │
│ [+ Add]  │                      │                │
└──────────┴──────────────────────┴────────────────┘
```

### Features

- **10 pages** in sidebar: Home, About Us, Sponsorship, Donations, Contact, Gallery, FAQ, Volunteer, Privacy, Terms
- **30+ section previews** rendering real database content with fallback placeholders
- **Inline editing**: Click any heading/text in preview → editable input → Enter/blur saves
- **Section selection**: Amber ring + glow + "Currently Editing" badge with scroll-to behavior
- **Drag-and-drop reorder**: framer-motion `Reorder.Group` with grip icon in sidebar
- **Section visibility**: Hover-to-reveal eye icon toggles; hidden sections show dimmed overlay + "Hidden" badge in preview
- **Add Section**: Button at bottom opens grid of available section types to insert
- **Right properties panel**: Dynamically shows editable fields per selected section
- **Theme & Branding panel**: Color pickers, font selectors, button radius slider, button style — instant preview via CSS vars
- **Device preview toggles**: Desktop/Tablet/Mobile with width transitions
- **Draft/publish workflow**: Unsaved changes indicator (amber pulse dot), Publish Changes button, Discard button, bulk-saves all modified content via `Promise.all(upsert*())`
- **Data loading**: Fetches ALL real data from ALL service functions on mount into local state

### About/Privacy/Terms Inline Editing

The PropertiesPanel also includes editors for:
- **About**: `about_mission` (mission/vision/description), `about_stats` (dynamic stat list), `about_values` (dynamic value list), `about_timeline` (dynamic milestone list)
- **Privacy**: header (title/subtitle) and content (body, lastUpdated)
- **Terms**: header (title/subtitle) and content (body, lastUpdated)

## Design System (`/admin/website/branding`)

Design tokens stored as JSONB in the `design_settings` Supabase table with draft/publish workflow.

### How It Works

1. **ThemeContext** fetches published settings from `getPublishedDesignSettings()`
2. Generates CSS custom properties: `:root { --color-primary: ...; --font-heading: ...; --radius-md: ... }`
3. Injects them into `<head>` via `<style id="dynamic-theme-vars">` element (URL-validated before injection)
4. Google Fonts loaded dynamically via `<link>` tags (URL-validated)
5. Favicon set dynamically from `branding.favicon_url` (URL-validated)

### Admin Pages

| Page | Route | Controls |
|------|-------|----------|
| Branding | `/admin/website/branding` | Org name, logo, favicon, tagline |
| Colors | `/admin/design/colors` | 60+ color variables (full palette) |
| Typography | `/admin/design/typography` | Font families, sizes, weights, spacing |
| Layout | `/admin/design/layout` | Container width, padding, radii, shadows |
| Components | `/admin/design/components` | Hero, card, CTA, testimonial styles |
| Config | `/admin/design/config` | Key-value website config |
| Presets | `/admin/design/presets` | Save/load/apply full theme presets |

### CSS Variables Generated

- **Colors**: `--color-{key}` for all DesignColors keys (underscores → hyphens), plus RGB variants and 10 auto-generated primary shades
- **Typography**: `--font-heading`, `--font-body`, `--font-size-{h1..h6,body,small}`, weight, letter-spacing, line-height, text-transform
- **Layout**: `--radius-{sm,md,lg,xl,2xl,full}`, `--shadow-{sm,md,lg,xl}`, `--layout-container-width`, animation toggles
- **Tokens**: `--spacing-unit`, `--transition-*`, `--z-*`, `--bp-*`

### Workflow

1. Admin edits settings in any design page (saves as draft per-category via `saveDraft()`)
2. Admin publishes via `publishDesignSettings()` which sets `is_published = true`
3. ThemeContext picks up published settings on next refresh or page load

## Legacy Content Managers

These dedicated editors remain at their `/admin/website/*` routes:

| Manager | Route | Purpose |
|---------|-------|---------|
| News | `/admin/website/news` | Create/edit/publish news articles |
| Gallery | `/admin/website/gallery` | Photos, videos, and testimonials with thumbnail previews |
| Videos | `/admin/website/videos` | YouTube/Vimeo embeds, or video file uploads (MP4/WebM/Ogg with MIME validation), descriptions |
| Testimonials | `/admin/website/testimonials` | Donor/teacher/student testimonials |
| Student Stories | `/admin/website/stories` | Success stories, achievements |
| FAQs | `/admin/website/faqs` | FAQ CRUD + reorder |
| Media Library | `/admin/website/media` | Upload/organize media assets |
| Navigation | `/admin/website/navigation` | Header/footer menus (drag-drop) |
| Site Settings | `/admin/website/settings` | Global site name, logo, SEO, social links |
| Announcements | `/admin/website/announcements` | Announcement banners |
| Partners | `/admin/website/partners` | Partner/sponsor logos |
| Section Visibility | `/admin/website/sections` | Show/hide sections across pages |
| Site Images | `/admin/website/images` | Manage site-wide images/backgrounds |
| Version History | `/admin/website/versions` | Content version history & restore |
| Donation Content | `/admin/website/donation` | Hero, impact cards, process steps |
| Sponsorship Content | `/admin/website/sponsorship` | Hero, packages, how-it-works |
| Volunteer Content | `/admin/website/volunteer` | Hero, opportunities, CTA |
| Footer Content | `/admin/website/footer` | Columns, links, copyright, social |
| Transparency Content | `/admin/website/transparency` | Donation allocation, impact stats |

## Tables

| Table | Purpose |
|-------|---------|
| `design_settings` | Design tokens (branding, colors, typography, layout, components, tokens) with draft/publish |
| `theme_presets` | Named theme presets |
| `website_config` | Key-value website config |
| `section_visibility` | Section visibility toggles with `section_key` and `is_visible` |
| `pages` | Content pages with content (JSONB) and SEO metadata |
| `page_headers` | Page-level header data (title, subtitle, background) |
| `homepage_sections` | Homepage section content |
| `site_settings` | Global site settings (singleton) |
| `navigation_items` | Menu items with hierarchy |
| `announcements` | Announcement banners |
| `partners` | Partner/sponsor entries |
| `content_versions` | Content version history |
| `donation_content` | Donation page content |
| `sponsorship_content` | Sponsorship page content |
| `volunteer_content` | Volunteer page content |
| `footer_content` | Footer content |
| `transparency_content` | Transparency content |
| `site_images` | Site-wide images and logos |
| `cms_strings` | CMS-driven UI string overrides (used by ContactPageEditor) |
| `donation_goals` | Campaign donation goals (used by CampaignsEditor) |
| `seo_content` | Per-page SEO metadata |
