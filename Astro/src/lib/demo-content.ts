/**
 * Demo content used when no Strapi server is configured (`STRAPI_URL` is empty).
 *
 * It reads the same seed data that `npm run seed` imports into Strapi
 * (`Strapi/data/seed.json` + `Strapi/data/uploads`), so the theme builds and
 * previews out of the box — e.g. for the live demo — and shows exactly the
 * content a freshly seeded Strapi would serve. As soon as `STRAPI_URL` is set,
 * all content comes from Strapi instead.
 */
import seed from '../../../Strapi/data/seed.json';
import type { BlogPost, Equipment, Project, Service, StrapiMedia } from './strapi';

const files = import.meta.glob<string>('../../../Strapi/data/uploads/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const urlByName = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop() as string, url]),
);
const mediaInfo = seed.media as Record<string, { alt: string }>;

let mediaId = 0;
function media(name: string | null | undefined): StrapiMedia | null {
  if (!name) return null;
  const url = urlByName.get(name);
  if (!url) return null;
  return { id: ++mediaId, url, alternativeText: mediaInfo[name]?.alt ?? '', width: null, height: null };
}

const doc = <T extends object>(item: T, index: number) => ({
  ...item,
  id: index + 1,
  documentId: `demo-${index + 1}`,
});

export const demoServices: Service[] = seed.services.map((s, i) => ({
  ...doc(s, i),
  mainImage: media(s.mainImage),
  skillsImage: media(s.skillsImage),
  approachImage: media(s.approachImage),
}));

export const demoProjects: Project[] = seed.projects.map((p, i) => {
  const service = demoServices.find((s) => s.name === p.service);
  return {
    ...doc(p, i),
    mainImage: media(p.mainImage),
    overviewImage: media(p.overviewImage),
    challengeImage: media(p.challengeImage),
    approachImage: media(p.approachImage),
    service: service ? { name: service.name, slug: service.slug } : null,
  };
});

export const demoBlogPosts: BlogPost[] = seed.blogPosts.map((b, i) => ({
  ...doc(b, i),
  mainImage: media(b.mainImage),
  contentImage: media(b.contentImage),
}));

export const demoEquipment: Equipment[] = seed.equipment.map((e, i) => ({
  ...doc(e, i),
  mainImage: media(e.mainImage),
  gallery: e.gallery.map((g) => media(g)).filter((m): m is StrapiMedia => m !== null),
}));
