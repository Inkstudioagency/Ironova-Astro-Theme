import type { APIRoute } from 'astro';
import {
  blogUrl,
  equipmentUrl,
  getBlogPosts,
  getEquipment,
  getProjects,
  getServices,
  projectUrl,
  serviceUrl,
} from '../lib/strapi';

const STATIC_PAGES = [
  '/', '/home-v2', '/home-v3', '/about', '/service', '/project-v1', '/project-v2', '/project-v3',
  '/equipment', '/blog', '/contact-v1', '/contact-v2', '/contact-v3', '/style-guide',
];

/** XML sitemap of all static pages and every CMS entry published in Strapi. */
export const GET: APIRoute = async ({ site }) => {
  const [posts, services, projects, equipment] = await Promise.all([
    getBlogPosts(), getServices(), getProjects(), getEquipment(),
  ]);
  const paths = [
    ...STATIC_PAGES,
    ...services.map(serviceUrl),
    ...projects.map(projectUrl),
    ...equipment.map(equipmentUrl),
    ...posts.map(blogUrl),
  ];
  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
