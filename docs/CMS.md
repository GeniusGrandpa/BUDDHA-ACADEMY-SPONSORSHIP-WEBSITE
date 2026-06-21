# CMS & Design System

Admin and Super Admin can manage all visible website content dynamically through the CMS, without touching code.

## Design System (`/admin/design/*`)

Design tokens are stored as JSONB in the `design_settings` Supabase table with a draft/publish workflow.

### How It Works

1. **ThemeContext** fetches published settings from `getPublishedDesignSettings()`
2. Generates CSS custom properties: `:root { --color-primary: ...; --font-heading: ...; --radius-md: ... }`
3. Injects them into `<head>` via a `<style id="dynamic-theme-vars">` element
4. Google Fonts are loaded dynamically via `<link>` tags
5. Favicon is set dynamically from `branding.favicon_url`

### Admin Pages

| Page              | Route                    | Controls                               |
|-------------------|--------------------------|----------------------------------------|
| Branding          | `/admin/design/branding` | Org name, logo, favicon, tagline       |
| Colors            | `/admin/design/colors`   | 60+ color variables (full palette)     |
| Typography        | `/admin/design/typography`| Font families, sizes, weights, spacing |
| Layout            | `/admin/design/layout`   | Container width, padding, radii, shadows|
| Components        | `/admin/design/components`| Hero, card, CTA, testimonial styles    |
| Config            | `/admin/design/config`   | Key-value website config               |
| Presets           | `/admin/design/presets`  | Save/load/apply full theme presets     |

### CSS Variables Generated

- **Colors**: `--color-{key}` for all DesignColors keys (underscores → hyphens), plus RGB variants and 10 auto-generated primary shades
- **Typography**: `--font-heading`, `--font-body`, `--font-size-{h1..h6,body,small}`, weight, letter-spacing, line-height, text-transform
- **Layout**: `--radius-{sm,md,lg,xl,2xl,full}`, `--shadow-{sm,md,lg,xl}`, `--layout-container-width`, animation toggles
- **Tokens**: `--spacing-unit`, `--transition-*`, `--z-*`, `--bp-*`

### Workflow

1. Admin edits settings in any design page (saves as draft per-category via `saveDraft()`)
2. Admin publishes via `publishDesignSettings()` which sets `is_published = true`
3. ThemeContext picks up published settings on next refresh or page load

## Content Management (`/admin/content/*`)

### Page Builder

Two approaches for content management:

**Dynamic Page Builder** — `DynamicPage` component fetches a `pages` row by slug, renders each `PageBlock` through `BlockRenderer` (18 block types). Blocks are reorderable, have visibility toggles, and store content as JSONB. Supported block types:

| Block Type       | Purpose                           |
|------------------|-----------------------------------|
| hero             | Hero section with title, subtitle |
| text             | Rich text content                 |
| rich_content     | Extended rich text                |
| image            | Single image with caption         |
| gallery          | Image gallery                     |
| cta              | Call-to-action button             |
| donation         | Donation form embed               |
| student_cards    | Student profile cards             |
| testimonials     | Testimonial carousel/grid         |
| faq              | FAQ accordion                     |
| stats            | Impact statistics                 |
| timeline         | Timeline layout                   |
| video            | Video embed                       |
| sponsors         | Sponsor/partner logos             |
| partners         | Partner section                   |
| announcements    | Announcement banners              |
| custom_section   | Free-form HTML/content            |

**Structured Static Pages** — `AdminPageEditor` provides form-based editing for predefined pages (about, contact, volunteer, privacy, terms) using `PAGE_META` config.

**Homepage Editor** — Section-based editor for homepage sections (hero, stats, features, CTA) from `homepage_sections` table.

### Dedicated Content Managers

| Manager               | Route                            | Purpose                          |
|-----------------------|----------------------------------|----------------------------------|
| News                  | `/admin/content/news`            | Create/edit/publish news articles|
| Gallery               | `/admin/content/gallery`         | Upload images, create albums     |
| Videos                | `/admin/content/videos`          | YouTube embeds, descriptions     |
| Testimonials          | `/admin/content/testimonials`    | Donor/teacher/student testimonials|
| Student Stories       | `/admin/content/stories`         | Success stories, achievements    |
| FAQs                  | `/admin/content/faqs`            | FAQ CRUD + reorder               |
| Media Library         | `/admin/content/media`           | Upload/organize media assets     |
| Navigation            | `/admin/content/navigation`      | Header/footer menus (drag-drop)  |
| Site Settings         | `/admin/content/settings`        | Global site name, logo, SEO, social links, maintenance mode |
| Announcements         | `/admin/content/announcements`   | Announcement banners             |
| Partners              | `/admin/content/partners`        | Partner/sponsor logos            |
| Transparency          | `/admin/content/transparency`    | Donation allocation, impact stats|
| Version History       | `/admin/content/versions`        | Content version history & restore|
| Content Analytics     | `/admin/content/analytics`       | Content usage counts             |

### Header & Footer

Both `Header` and `Footer` components load their data from the CMS:

- **Header**: Loads navigation items from `getNavigationItems('header')`, site name/logo from `getSiteSettings()` — falls back to hardcoded defaults if CMS unavailable
- **Footer**: Loads footer sections from `getNavigationItems('footer_*')`, contact/social info from `getSiteSettings()` — falls back to language translations and default links

## Tables

| Table               | Purpose                        |
|---------------------|--------------------------------|
| `design_settings`   | Design tokens (branding, colors, typography, layout, components, tokens) with draft/publish |
| `theme_presets`     | Named theme presets            |
| `website_config`    | Key-value website config       |
| `section_visibility`| Section visibility toggles     |
| `pages`             | Content pages with blocks (JSONB) and SEO metadata |
| `homepage_sections` | Homepage section content       |
| `site_settings`     | Global site settings (singleton)|
| `navigation_items`  | Menu items with hierarchy      |
| `announcements`     | Announcement banners           |
| `partners`          | Partner/sponsor entries        |
| `content_versions`  | Content version history        |
