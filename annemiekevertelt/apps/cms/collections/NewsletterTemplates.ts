import type { CollectionConfig } from 'payload';

export const NewsletterTemplates: CollectionConfig = {
  slug: 'newsletter-templates',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'createdAt'],
    group: 'Nieuwsbrief',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      label: 'Onderwerp',
      required: true,
    },
    {
      name: 'previewText',
      type: 'text',
      label: 'Preview tekst',
      maxLength: 150,
      admin: {
        description: 'Tekst die getoond wordt in de inbox preview',
      },
    },
    {
      name: 'greeting',
      type: 'text',
      label: 'Aanhef',
      defaultValue: 'Hallo',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhoud',
      required: true,
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: ['columns', 'childrens-stories', 'audio-content', 'about-me'],
      hasMany: true,
      maxDepth: 1,
      label: 'Uitgelichte posts',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      options: [
        { label: 'Concept', value: 'draft' },
        { label: 'Verzonden', value: 'sent' },
        { label: 'Gepland', value: 'scheduled' },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Verzonden op',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'sentCount',
      type: 'number',
      label: 'Aantal verzonden',
      admin: {
        readOnly: true,
      },
    },
  ],
};
