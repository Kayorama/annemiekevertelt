import type { CollectionConfig } from 'payload';

export const Audio: CollectionConfig = {
  slug: 'audio',
  admin: {
    useAsTitle: 'title',
    group: 'Media',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: './audio',
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Duur (minuten)',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschrijving',
    },
  ],
};
