import type { CollectionConfig } from 'payload';

export const Audio: CollectionConfig = {
  slug: 'audio',
  labels: {
    singular: 'Audio-bestand',
    plural: 'Audio-bestanden',
  },
  admin: {
    useAsTitle: 'title',
    group: '🖼️ Media',
    description: 'Audio-bestanden voor de "Hardop Lezen" sectie',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: './audio',
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
      admin: {
        description: 'Een herkenbare naam voor dit audio-bestand',
      },
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Duur',
      admin: {
        description: 'Hoe lang duurt de audio? (bijv. "12:34" of "45 minuten")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschrijving',
      admin: {
        description: 'Korte beschrijving van wat er in de audio besproken wordt',
      },
    },
  ],
};
