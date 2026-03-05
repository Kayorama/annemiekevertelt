import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { localStorage } from '@payloadcms/storage-local';
import sharp from 'sharp';

import { Users } from './collections/Users.js';
import { Columns } from './collections/Columns.js';
import { ChildrensStories } from './collections/ChildrensStories.js';
import { AudioContent } from './collections/AudioContent.js';
import { AboutMe } from './collections/AboutMe.js';
import { Media } from './collections/Media.js';
import { Audio } from './collections/Audio.js';
import { Subscribers } from './collections/Subscribers.js';
import { NewsletterTemplates } from './collections/NewsletterTemplates.js';

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' - Annemieke Vertelt',
      favicon: '/favicon.ico',
    },
    components: {
      graphics: {
        Logo: './components/Logo.tsx#Logo',
        Icon: './components/Logo.tsx#Icon',
      },
    },
    localization: {
      defaultLocale: 'nl',
      locales: ['nl'],
    },
  },
  editor: lexicalEditor({}),
  collections: [
    Users,
    Media,
    Audio,
    Columns,
    ChildrensStories,
    AudioContent,
    AboutMe,
    Subscribers,
    NewsletterTemplates,
  ],
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    localStorage({
      collections: {
        media: {
          generateFileURL: ({ filename }) => `/media/${filename}`,
        },
        audio: {
          generateFileURL: ({ filename }) => `/audio/${filename}`,
        },
      },
      staticDir: './media',
    }),
  ],
  typescript: {
    outputFile: './payload-types.ts',
  },
});
