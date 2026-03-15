import type { CollectionConfig } from 'payload';

export const AboutMe: CollectionConfig = {
  slug: 'about-me',
  labels: {
    singular: 'Hoofdstuk Over Mij',
    plural: 'Over Mij - Hoofdstukken',
  },
  admin: {
    useAsTitle: 'chapterTitle',
    defaultColumns: ['chapterTitle', 'category', 'order', 'draft'],
    group: '📝 Content',
    description: 'Hoofdstukken voor de "Over Mij" pagina',
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
      name: 'chapterTitle',
      type: 'text',
      label: 'Hoofdstuktitel',
      required: true,
      admin: {
        description: 'De titel van dit hoofdstuk (bijv. "Mijn schooltijd", "Hoe ik mijn man ontmoette")',
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
        description: 'Het webadres van dit hoofdstuk',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Onderwerp',
      required: true,
      options: [
        { label: '🎓 School & Studie', value: 'school' },
        { label: '💍 Huwelijk & Relaties', value: 'huwelijk' },
        { label: '👶 Kinderen & Ouderschap', value: 'kinderen' },
        { label: '💼 Werk & Carrière', value: 'carriere' },
        { label: '🌍 Reizen & Avontuur', value: 'reizen' },
        { label: '🎨 Hobby\'s & Interesses', value: 'hobbys' },
        { label: '🏠 Mijn Huidige Leven', value: 'huidig' },
        { label: '💭 Persoonlijke Groei', value: 'groei' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Kies het onderwerp dat het beste past bij dit hoofdstuk',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icoon (icoon-afbeelding)',
      admin: {
        description: 'Een klein icoon bij dit hoofdstuk (optioneel - anders wordt een standaard icoon gebruikt)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhoud',
      required: true,
      admin: {
        description: 'Het verhaal van dit hoofdstuk - schrijf hier over dit deel van je leven',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Volgorde',
      admin: {
        position: 'sidebar',
        description: 'Nummer om de volgorde te bepalen (lager = eerst). Tip: gebruik 10, 20, 30 zodat je er later makkelijk tussen kunt voegen.',
      },
      defaultValue: 10,
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
