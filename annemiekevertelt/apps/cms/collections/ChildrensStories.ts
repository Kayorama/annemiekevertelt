import type { CollectionConfig } from 'payload';

export const ChildrensStories: CollectionConfig = {
  slug: 'childrens-stories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedDate', 'ageGroup'],
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
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Uitgelichte afbeelding',
    },
    {
      name: 'ageGroup',
      type: 'select',
      label: 'Leeftijdsgroep',
      options: [
        { label: '4-6 jaar', value: '4-6' },
        { label: '6-8 jaar', value: '6-8' },
        { label: '8-10 jaar', value: '8-10' },
        { label: '10-12 jaar', value: '10-12' },
        { label: 'Alle leeftijden', value: 'all' },
      ],
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Leestijd (minuten)',
      admin: {
        description: 'Geschatte leestijd in minuten',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Samenvatting',
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Verhaal',
      required: true,
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
