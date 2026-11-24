# Ironova — Industrial Equipment & Engineering Astro Theme

A multi-page Astro theme for industrial equipment suppliers, engineering firms and
manufacturing service companies, with a headless [Strapi](https://strapi.io) CMS.

**Live demo:** https://ironova-astro-theme.vercel.app

| Folder | What it is |
| --- | --- |
| [`Astro/`](Astro) | The Astro theme (Astro 7, static output). See [Astro/README.md](Astro/README.md). |
| [`Strapi/`](Strapi) | Strapi 5 CMS with the content model, demo content and the MCP server enabled. See [Strapi/README.md](Strapi/README.md). |

## Features

- 3 home pages, 3 project-page layouts, 3 contact pages, About, Services, Equipment, Blog, Style Guide, 404
- CMS-driven Services, Projects, Blog Posts and Equipment with detail pages
- Scroll and entrance animations, mega menu, smooth scrolling, background videos, Lottie animations
- SEO meta, Open Graph, canonical URLs, `sitemap.xml` and `robots.txt`
- Fully responsive (desktop, tablet, mobile)

## Quick start

```bash
# 1. Preview the theme with the bundled demo content (no CMS needed)
cd Astro
npm install
npm run dev

# 2. Connect the CMS
cd ../Strapi
npm install
cp .env.example .env     # replace the "tobemodified" secrets
npm run seed             # imports the demo content, prints a read-only API token
npm run develop          # http://localhost:1337/admin

# 3. Point the theme at Strapi: in Astro/.env set
#    STRAPI_URL=http://localhost:1337
#    STRAPI_API_TOKEN=<token printed by the seed script>
```

While `STRAPI_URL` is empty, the theme builds from the same demo content that `npm run seed`
imports into Strapi. Once `STRAPI_URL` is set, all content comes from Strapi.

## Deploying

Deploy the `Astro/` folder to any static host (Vercel, Netlify, Cloudflare Pages…). On Vercel,
set the project's **Root Directory** to `Astro`. Add `SITE_URL`, and also `STRAPI_URL` and
`STRAPI_API_TOKEN` once your Strapi is hosted. Then point a Strapi webhook at the host's build hook
so that publishing content triggers a rebuild.
