import type { CollectionConfig } from 'payload';

export const AudioContent: CollectionConfig = {
  slug: 'audio-content',
  labels: {
    singular: 'Audio-fragment',
    plural: 'Hardop Lezen (Audio)',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'draft', 'publishDate', 'audioFile'],
    group: '📝 Content',
    description: 'Audio-fragmenten voor de "Hardop Lezen" sectie',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        draft: {
          equals: false,
        },
      };
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
      admin: {
        description: 'De titel van dit audio-fragment',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Webadres (URL)',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Het webadres waar dit fragment te vinden is',
      },
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'audio',
      label: 'Audio-bestand',
      required: true,
      admin: {
        description: 'Upload hier je audio-opname (MP3, WAV, etc.)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Beschrijving',
      admin: {
        description: 'Korte beschrijving van wat er in de audio besproken wordt',
      },
    },
    {
      name: 'transcript',
      type: 'richText',
      label: 'Transcriptie (tekstversie)',
      admin: {
        description: 'De volledige tekst van de audio (handig voor zoekmachines en doven)',
      },
    },
    {
      name: 'draft',
      type: 'checkbox',
      label: 'Concept (niet publiceren)',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Vinkje = nog niet zichtbaar op de website',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      label: 'Publicatiedatum',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMMM yyyy',
        },
        description: 'Wanneer moet dit online komen?',
      },
      defaultValue: () => new Date().toISOString(),
    },
  ],
};
