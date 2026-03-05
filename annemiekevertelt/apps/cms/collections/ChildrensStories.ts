import type { CollectionConfig } from 'payload';

export const ChildrensStories: CollectionConfig = {
  slug: 'childrens-stories',
  labels: {
    singular: 'Kinderverhaal',
    plural: 'Kinderverhalen',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'draft', 'publishDate', 'ageGroup'],
    group: '📝 Content',
    description: 'Verhalen voor kinderen',
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
        description: 'De titel van het verhaal',
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
        description: 'Het webadres waar dit verhaal te vinden is',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Afbeelding',
      admin: {
        description: 'Een illustratie of foto bij het verhaal (optioneel)',
      },
    },
    {
      name: 'ageGroup',
      type: 'select',
      label: 'Voor welke leeftijd?',
      options: [
        { label: '4-6 jaar', value: '4-6' },
        { label: '6-8 jaar', value: '6-8' },
        { label: '8-10 jaar', value: '8-10' },
        { label: '10-12 jaar', value: '10-12' },
        { label: 'Alle leeftijden', value: 'all' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Voor welke leeftijdsgroep is dit verhaal?',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Verhaal',
      required: true,
      admin: {
        description: 'Het volledige verhaal - laat je creativiteit los!',
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
