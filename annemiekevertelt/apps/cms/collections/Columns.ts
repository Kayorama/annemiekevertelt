import type { CollectionConfig } from 'payload';

export const Columns: CollectionConfig = {
  slug: 'columns',
  labels: {
    singular: 'Column',
    plural: 'Columns',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'draft', 'publishDate'],
    group: '📝 Content',
    description: 'Persoonlijke columns en verhalen',
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
        description: 'De titel van je column (dit wordt ook de hoofdtekst)',
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
        description: 'Het webadres waar deze column te vinden is (bijv. "mijn-eerste-column")',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
      admin: {
        description: 'Een mooie afbeelding bij je column (optioneel)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Tekst',
      required: true,
      admin: {
        description: 'De inhoud van je column - schrijf hier je verhaal',
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
