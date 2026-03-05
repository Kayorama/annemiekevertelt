import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://annemiekevertelt.nl',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  output: 'static',
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  image: {
    domains: ['localhost', 'annemiekevertelt.nl'],
  },
});
