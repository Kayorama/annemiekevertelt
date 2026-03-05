import type { CollectionConfig } from 'payload';

export const AudioContent: CollectionConfig = {
  slug: 'audio-content',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedDate', 'audioFile'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        status: {
          equals: 'published',
        },
      };
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL-slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Omslagafbeelding',
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'audio',
      label: 'Audio bestand',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Duur',
      admin: {
        description: 'Bijvoorbeeld: "12:34" of "45 min"',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Beschrijving',
    },
    {
      name: 'transcript',
      type: 'richText',
      label: 'Transcriptie',
      admin: {
        description: 'Optionele tekstversie van de audio',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      options: [
        { label: 'Concept', value: 'draft' },
        { label: 'Gepubliceerd', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Publicatiedatum',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMMM yyyy',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
  ],
};
