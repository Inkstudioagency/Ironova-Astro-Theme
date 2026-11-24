/**
 * Strapi REST client used at build time (and in dev) to load CMS content.
 *
 * Configuration comes from environment variables (see `.env.example`):
 *   STRAPI_URL        – base URL of the Strapi server, e.g. http://localhost:1337
 *   STRAPI_API_TOKEN  – read-only API token (optional when the Public role can read)
 *
 * When STRAPI_URL is empty the site is built from the bundled demo content
 * (the same data `npm run seed` imports into Strapi), see `demo-content.ts`.
 */
import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { marked } from 'marked';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: Record<string, StrapiImageFormat> | null;
}

export interface TitleText {
  title: string;
  text: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
}

interface StrapiDocument {
  id: number;
  documentId: string;
  slug: string;
}

export interface BlogPost extends StrapiDocument {
  title: string;
  category: string;
  type: string;
  publishDate: string;
  readTime: string;
  shortDescription: string;
  mainImage: StrapiMedia | null;
  introText: string;
  introParagraph: string;
  contentImage: StrapiMedia | null;
  sections: { tocTitle: string; content: string }[];
  seo: Seo | null;
}

export interface Service extends StrapiDocument {
  name: string;
  number: string;
  stage: string;
  order: number;
  shortDescription: string;
  mainImage: StrapiMedia | null;
  focusAreas: TitleText[];
  introLabel: string;
  introText: string;
  points: { label: string }[];
  skillsHeading: string;
  skillsText: string;
  skills: TitleText[];
  skillsImage: StrapiMedia | null;
  approachHeading: string;
  approachText: string;
  steps: TitleText[];
  approachImage: StrapiMedia | null;
  seo: Seo | null;
}

export interface Project extends StrapiDocument {
  name: string;
  number: string;
  order: number;
  featured: boolean;
  category: string;
  shortDescription: string;
  mainImage: StrapiMedia | null;
  application: string;
  focus: string;
  scope: string;
  scopeItems: { label: string }[];
  heroTitle: string;
  heroText: string;
  projectType: string;
  service: Pick<Service, 'name' | 'slug'> | null;
  briefFocus: string;
  overviewText: string;
  overviewImage: StrapiMedia | null;
  challengeHeading: string;
  challengeText: string;
  challenges: TitleText[];
  challengeImage: StrapiMedia | null;
  approachHeading: string;
  approachText: string;
  steps: TitleText[];
  approachImage: StrapiMedia | null;
  outcomeHeading: string;
  stats: LabelValue[];
  seo: Seo | null;
}

export interface Equipment extends StrapiDocument {
  name: string;
  order: number;
  category: string;
  shortDescription: string;
  mainImage: StrapiMedia | null;
  gallery: StrapiMedia[];
  application: string;
  industry: string;
  overviewText: string;
  overviewParagraph: string;
  keyBenefits: string;
  features: TitleText[];
  everydayTasks: string;
  specsIntro: string;
  specs: LabelValue[];
  faqTitle: string;
  seo: Seo | null;
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const baseUrl = (STRAPI_URL ?? '').replace(/\/+$/, '');

/** True when content is loaded from a Strapi server, false in demo-content mode. */
export const usingStrapi = baseUrl !== '';
if (!usingStrapi) {
  console.warn('[strapi] STRAPI_URL is not set: building with the bundled demo content.');
}

const demo = () => import('./demo-content');

async function request<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (STRAPI_API_TOKEN) headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api${path}`, { headers });
  } catch (error) {
    throw new Error(
      `[strapi] Could not reach Strapi at ${baseUrl}. Is the server running and STRAPI_URL correct?`,
      { cause: error },
    );
  }
  if (!res.ok) {
    throw new Error(`[strapi] ${res.status} ${res.statusText} for /api${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Fetches every published entry of a collection type, following pagination. */
async function fetchAll<T>(collection: string, populate: string[]): Promise<T[]> {
  const items: T[] = [];
  const populateQuery = populate.map((field) => `populate[${field}]=true`).join('&');
  let page = 1;
  let pageCount = 1;
  do {
    const json = await request<{ data: T[]; meta: { pagination: { pageCount: number } } }>(
      `/${collection}?${populateQuery}&pagination[page]=${page}&pagination[pageSize]=100`,
    );
    items.push(...json.data);
    pageCount = json.meta.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);
  return items;
}

// One request per collection per build/dev-request cycle.
const cache = new Map<string, Promise<unknown[]>>();
function cached<T>(key: string, loader: () => Promise<T[]>): Promise<T[]> {
  if (import.meta.env.DEV) return loader(); // always fresh content while editing
  if (!cache.has(key)) cache.set(key, loader());
  return cache.get(key) as Promise<T[]>;
}

export const getBlogPosts = () =>
  cached<BlogPost>('blog-posts', async () =>
    usingStrapi
      ? fetchAll('blog-posts', ['mainImage', 'contentImage', 'sections', 'seo'])
      : (await demo()).demoBlogPosts,
  );

export const getServices = () =>
  cached<Service>('services', async () =>
    usingStrapi
      ? fetchAll('services', [
          'mainImage', 'focusAreas', 'points', 'skills', 'skillsImage', 'steps', 'approachImage', 'seo',
        ])
      : (await demo()).demoServices,
  );

export const getProjects = () =>
  cached<Project>('projects', async () =>
    usingStrapi
      ? fetchAll('projects', [
          'mainImage', 'scopeItems', 'service', 'overviewImage', 'challenges', 'challengeImage',
          'steps', 'approachImage', 'stats', 'seo',
        ])
      : (await demo()).demoProjects,
  );

export const getEquipment = () =>
  cached<Equipment>('equipments', async () =>
    usingStrapi
      ? fetchAll('equipments', ['mainImage', 'gallery', 'features', 'specs', 'seo'])
      : (await demo()).demoEquipment,
  );

// ---------------------------------------------------------------------------
// Sorting helpers (mirror the original collection list settings)
// ---------------------------------------------------------------------------

type Dir = 'asc' | 'desc';

export function sortBy<T>(items: T[], key: (item: T) => string | number, dir: Dir = 'asc'): T[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    return (x < y ? -1 : x > y ? 1 : 0) * sign;
  });
}

export const byOrder = <T extends { order: number }>(items: T[], dir: Dir = 'asc') =>
  sortBy(items, (i) => i.order, dir);
export const byNumber = <T extends { number: string }>(items: T[], dir: Dir = 'asc') =>
  sortBy(items, (i) => i.number, dir);
export const byPublishDate = (items: BlogPost[], dir: Dir = 'desc') =>
  sortBy(items, (i) => i.publishDate, dir);

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Absolute URL for a Strapi media file (local uploads are served from the Strapi host). */
export function mediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  return /^https?:\/\//.test(url) ? url : `${baseUrl}${url}`;
}

/**
 * `src`, `srcset` and `alt` attributes for a Strapi image, using its generated formats.
 * The alt text comes from the Media Library unless `altOverride` is given
 * (e.g. an entry's name, or "" for purely decorative thumbnails).
 */
export function img(media: StrapiMedia | null | undefined, fallbackAlt = '', altOverride?: string) {
  if (!media) return { src: '', alt: altOverride ?? fallbackAlt };
  const formats = Object.entries(media.formats ?? {})
    .filter(([name, f]) => name !== 'thumbnail' && f?.url && f.width)
    .map(([, f]) => f)
    .sort((a, b) => a.width - b.width);
  const candidates = [...formats.map((f) => `${mediaUrl(f.url)} ${f.width}w`)];
  if (media.width) candidates.push(`${mediaUrl(media.url)} ${media.width}w`);
  return {
    src: mediaUrl(media.url),
    srcset: candidates.length > 1 ? candidates.join(', ') : undefined,
    alt: altOverride ?? (media.alternativeText || fallbackAlt),
  };
}

/** Converts a Strapi rich-text (Markdown, which may contain HTML) field to HTML. */
export function richText(value: string | null | undefined): string {
  if (!value) return '';
  return marked.parse(value, { async: false }) as string;
}

/** Formats an ISO date the same way the original template does ("October 24, 2026"). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export const blogUrl = (item: { slug: string }) => `/blog/${item.slug}`;
export const serviceUrl = (item: { slug: string }) => `/service/${item.slug}`;
export const projectUrl = (item: { slug: string }) => `/project/${item.slug}`;
export const equipmentUrl = (item: { slug: string }) => `/equipment/${item.slug}`;
