'use strict';

/**
 * Seeds the Ironova demo content (services, projects, blog posts, equipment and
 * their images) into Strapi and creates a read-only API token for the Astro site.
 *
 * Usage:  npm run seed
 * The script is idempotent: collections that already contain entries are skipped.
 */

const fs = require('node:fs');
const path = require('node:path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const DATA_DIR = path.join(__dirname, '..', 'data');
const seed = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'seed.json'), 'utf8'));
const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif' };

const uploaded = new Map();

async function uploadFile(strapi, fileName) {
  if (!fileName) return null;
  if (uploaded.has(fileName)) return uploaded.get(fileName);

  const existing = await strapi.query('plugin::upload.file').findOne({ where: { name: fileName } });
  if (existing) {
    uploaded.set(fileName, existing.id);
    return existing.id;
  }

  const filepath = path.join(DATA_DIR, 'uploads', fileName);
  const { size } = fs.statSync(filepath);
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: {
        fileInfo: {
          name: fileName,
          alternativeText: seed.media[fileName]?.alt ?? '',
          caption: '',
        },
      },
      files: {
        filepath,
        originalFilename: fileName,
        mimetype: MIME[path.extname(fileName).toLowerCase()] ?? 'application/octet-stream',
        size,
      },
    });
  uploaded.set(fileName, file.id);
  return file.id;
}

async function withMedia(strapi, entry, single, multiple = []) {
  const data = { ...entry };
  for (const field of single) data[field] = await uploadFile(strapi, entry[field]);
  for (const field of multiple) {
    data[field] = [];
    for (const name of entry[field] ?? []) data[field].push(await uploadFile(strapi, name));
  }
  if (!data.seo) delete data.seo;
  return data;
}

async function seedCollection(strapi, uid, entries, prepare) {
  const count = await strapi.documents(uid).count({ status: 'published' });
  if (count > 0) {
    strapi.log.info(`[seed] ${uid}: ${count} entries already exist, skipping`);
    return;
  }
  for (const entry of entries) {
    const data = await prepare(entry);
    await strapi.documents(uid).create({ data, status: 'published' });
  }
  strapi.log.info(`[seed] ${uid}: created ${entries.length} entries`);
}

async function createReadOnlyToken(strapi) {
  const tokenService = strapi.service('admin::api-token');
  const name = 'Astro frontend (read-only)';
  if (await tokenService.exists({ name })) {
    strapi.log.info(`[seed] API token "${name}" already exists (create a new one in Settings > API Tokens if you lost it)`);
    return null;
  }
  const token = await tokenService.create({
    name,
    description: 'Used by the Astro site to read published content at build time.',
    type: 'read-only',
    lifespan: null,
  });
  return token.accessKey;
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'info';
  try {
    await seedCollection(app, 'api::service.service', seed.services, (e) =>
      withMedia(app, e, ['mainImage', 'skillsImage', 'approachImage']),
    );

    const services = await app.documents('api::service.service').findMany({ status: 'published' });
    await seedCollection(app, 'api::project.project', seed.projects, async (e) => {
      const data = await withMedia(app, e, ['mainImage', 'overviewImage', 'challengeImage', 'approachImage']);
      const service = services.find((s) => s.name === e.service);
      data.service = service ? { connect: [{ documentId: service.documentId }] } : null;
      return data;
    });

    await seedCollection(app, 'api::blog-post.blog-post', seed.blogPosts, (e) =>
      withMedia(app, e, ['mainImage', 'contentImage']),
    );

    await seedCollection(app, 'api::equipment.equipment', seed.equipment, (e) =>
      withMedia(app, e, ['mainImage'], ['gallery']),
    );

    const accessKey = await createReadOnlyToken(app);
    if (accessKey) {
      console.log('\n[seed] Read-only API token for the Astro site (shown only once):');
      console.log(`STRAPI_API_TOKEN=${accessKey}\n`);
    }
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
