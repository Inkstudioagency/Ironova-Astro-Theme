// @ts-check
import { defineConfig, envField } from 'astro/config';
import config from './src/config/config.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || config.site.base_url,
  trailingSlash: 'ignore',
  vite: {
    // the demo content is read from ../Strapi/data
    server: { fs: { allow: ['..'] } },
  },
  env: {
    schema: {
      // Leave empty to build with the bundled demo content (see src/lib/demo-content.ts).
      STRAPI_URL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
      STRAPI_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
