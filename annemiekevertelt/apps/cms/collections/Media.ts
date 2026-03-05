import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Media',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: './media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        crop: 'center',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        crop: 'center',
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
        crop: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-tekst',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Bijschrift',
    },
  ],
};
