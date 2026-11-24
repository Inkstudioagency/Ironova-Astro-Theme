# Ironova — Industrial Equipment & Engineering Astro Theme

Ironova is a multi-page Astro theme for industrial equipment suppliers, engineering firms and
manufacturing service companies. Its content (services, projects, blog posts and equipment) comes
from a [Strapi](https://strapi.io) headless CMS.

- 3 home pages, 3 project-page layouts, 3 contact pages
- About, Services, Equipment, Blog, Style Guide and 404 pages
- CMS detail pages: `/service/[slug]`, `/project/[slug]`, `/blog/[slug]`, `/equipment/[slug]`
- Scroll and entrance animations, mega menu, smooth scrolling (Lenis), background videos,
  Lottie animations, tabs and counters
- Fully static output (SSG) with SEO meta, Open Graph, canonical URLs, `sitemap.xml` and `robots.txt`

## Requirements

- Node.js 22+
- A running Strapi instance with the Ironova content model. Use the `Strapi/` project that ships
  with this theme; see its README.

## Getting started

```bash
npm install
cp .env.example .env    # set STRAPI_URL and STRAPI_API_TOKEN
npm run dev             # http://localhost:4321
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server. Content is fetched from Strapi on every request. |
| `npm run build` | Build the static site into `dist/`. Strapi must be reachable. |
| `npm run preview` | Preview the production build. |
| `npm run check` | Type-check the project (`astro check`). |

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `STRAPI_URL` | yes | Base URL of Strapi, e.g. `http://localhost:1337` |
| `STRAPI_API_TOKEN` | recommended | Read-only API token (Strapi → Settings → API Tokens) |
| `SITE_URL` | for production | Public URL of the site (canonical URLs, sitemap, OG tags) |

The variables are validated with Astro's `astro:env` schema (see `astro.config.mjs`). The token
is a server-only secret and is never sent to the browser.

## Project structure

```text
├── public/
│   ├── css/          # Theme stylesheets (normalize, base, ironova)
│   ├── js/           # Interaction runtime (site.js) + vendor libraries (jQuery, GSAP)
│   ├── fonts/  images/  videos/  documents/  (Lottie JSON)
├── src/
│   ├── components/
│   │   ├── Navbar.astro      # Top bar + mega menu (Services column comes from Strapi)
│   │   ├── Footer.astro      # Footer (links from menu.json)
│   │   ├── CtaSection.astro  # "Have a Requirement?" video CTA with form
│   │   └── SeoMeta.astro     # <title>, description, canonical, Open Graph, Twitter
│   ├── config/
│   │   ├── config.json       # Site title, URL, default SEO, contact details
│   │   └── menu.json         # Mega menu, footer links, social links
│   ├── layouts/BaseLayout.astro
│   ├── lib/strapi.ts         # Strapi client, types, sorting, image & rich-text helpers
│   └── pages/                # One file per page + [slug] routes for each collection
└── astro.config.mjs
```

## Configuration

- **Site settings**: edit `src/config/config.json` (site title, base URL, default meta title,
  description and image, email, phone).
- **Navigation and footer**: edit `src/config/menu.json`. The *Services* column of the mega menu is
  built automatically from the published Strapi services.
- **SEO per page**: static pages pass `title`/`description` to `BaseLayout`. CMS pages use each
  entry's `seo` component, falling back to its name and short description.

## Content from Strapi

| Collection | Where it appears |
| --- | --- |
| Services | Mega menu, Home V1–V3, `/service`, `/service/[slug]` |
| Projects | Home V1–V3, `/project-v1..3` (tabs filter by `category`), `/project/[slug]` |
| Blog Posts | Home V1, `/blog`, `/blog/[slug]` (related articles) |
| Equipment | `/equipment`, `/equipment/[slug]` (related equipment) |

Every collection is fetched once per build (`src/lib/strapi.ts`). Images use Strapi's generated
formats for a responsive `srcset`, and alt text comes from the Media Library.

Because the site is static, **publishing content in Strapi requires a rebuild** in production.
Add a Strapi webhook that calls your host's build hook. In `npm run dev`, changes show up
immediately.

## Customisation notes

- The page markup and class names come from the original design system in
  `public/css/ironova.css`. Reuse the existing classes (see `/style-guide`)
  so new sections match the theme.
- Each page passes its `pageId` to `BaseLayout`. The interaction runtime (`public/js/site.js`)
  uses this id, together with the `data-wf-*` and animation attributes (`to-top-0`, `parallax`,
  `heading-rebuild`, …), to attach the page's animations. Keep those attributes when editing
  markup if you want the animations to keep working.
- Forms are front-end only. A form without an `action` shows its success message and sends no
  data. To receive submissions, set the form's `action`/`method` to your form backend
  (Formspree, Netlify Forms, a serverless function…).
- `src/styles/global.css` is processed by Astro and emitted as `/_astro/*.css`. Put your own global
  CSS overrides there.

## Deployment

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages…):

1. Set `SITE_URL`, `STRAPI_URL` and `STRAPI_API_TOKEN` in the host's environment settings.
2. Build command: `npm run build`. Output directory: `dist`.
3. Point a Strapi webhook at the host's build hook to rebuild on publish.
