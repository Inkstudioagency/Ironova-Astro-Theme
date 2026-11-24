# Ironova — Strapi CMS

Headless CMS for the **Ironova Astro theme**. It stores the four content collections the
site renders: **Services**, **Projects**, **Blog Posts** and **Equipment**.

Built with Strapi 5 (SQLite by default) and the official
[Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) enabled.

## Quick start

```bash
npm install
cp .env.example .env      # then replace every "tobemodified" secret
npm run seed              # imports demo content + images, prints a read-only API token
npm run develop           # admin panel: http://localhost:1337/admin
```

`npm run seed` is idempotent: collections that already contain entries are skipped. It prints a
**read-only API token** once. Put it in the Astro project's `.env` as `STRAPI_API_TOKEN`.

On first start, open `/admin` and create your administrator account.

## Content model

| Collection | API endpoint | Used by |
| --- | --- | --- |
| Service (`api::service.service`) | `/api/services` | Navigation, home pages, `/service`, `/service/[slug]` |
| Project (`api::project.project`) | `/api/projects` | Home pages, `/project-v1..3`, `/project/[slug]` |
| Blog Post (`api::blog-post.blog-post`) | `/api/blog-posts` | Home V1, `/blog`, `/blog/[slug]` |
| Equipment (`api::equipment.equipment`) | `/api/equipments` | `/equipment`, `/equipment/[slug]` |

**Relation:** each Project belongs to one Service (`project.service` ↔ `service.projects`).

**Reusable components** (`src/components`):

- `shared.title-text`: title + text. Used for features, steps, skills, challenges and focus areas.
- `shared.label-value`: label + value. Used for equipment specifications and project statistics.
- `shared.label`: a single label. Used for project scope items and service highlights.
- `shared.seo`: meta title + description.
- `blog.section`: article section (table-of-contents label + rich text).

Rich-text fields use Markdown, and HTML is allowed. The Astro site renders them with `marked`.

All collections use Draft & Publish, and the website only shows **published** entries.

### Sorting fields the site relies on

- `order` (Services, Projects, Equipment) controls list order.
- `number` (Services, Projects) is the "01//" label. Service lists on Home V1 and `/service` sort by it.
- `featured` (Projects): the first featured project is shown on Home V1.
- `category` (Projects): the Project pages filter their tabs by `Logistics`, `Manufacturing` and `Construction`.
- `publishDate` (Blog Posts): newest first.

## Strapi MCP server

The MCP server is enabled in `config/server.ts` (`mcp.enabled`, or the `MCP_ENABLED` env var).

1. In the admin panel, go to **Settings → Admin tokens** and create a token. Grant it the
   Content-Manager permissions (read/create/update/delete/publish) for the four collections,
   plus Media Library access. The MCP tools that appear depend on these permissions.
2. Connect a client. For Claude Code:

   ```bash
   claude mcp add strapi-mcp --transport http http://localhost:1337/mcp \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

The server exposes tools such as `list_service`, `get_project`, `update_blog-post`,
`publish_equipment` and `media_list_assets`. Note that MCP cannot create content types or upload
new files. Schema changes are made in code (`src/api`, `src/components`), and uploads are made
in the admin panel.

## Rebuilding the website after content changes

The Astro site is statically generated. In production, add a Strapi **webhook**
(Settings → Webhooks) on `entry.publish` / `entry.unpublish` / `entry.delete` that calls your
host's build hook (Netlify, Vercel, Cloudflare Pages…), so every publish triggers a rebuild.
