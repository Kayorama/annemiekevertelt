import type { CollectionConfig } from 'payload';

export const NewsletterTemplates: CollectionConfig = {
  slug: 'newsletter-templates',
  labels: {
    singular: 'Nieuwsbrief',
    plural: 'Nieuwsbrieven',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subject', 'status', 'createdAt'],
    group: '💌 Nieuwsbrief',
    description: 'Maak en verstuur nieuwsbrieven naar je abonnees',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam van nieuwsbrief',
      required: true,
      admin: {
        description: 'Een herkenbare naam voor jezelf (bijv. "Nieuwsbrief maart 2026") - alleen jij ziet dit',
      },
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Onderwerp (e-mail titel)',
      required: true,
      admin: {
        description: 'Dit is de titel die mensen in hun inbox zien (bijv. "Nieuwe columns deze week!")',
      },
    },
    {
      name: 'previewText',
      type: 'text',
      label: 'Voorbeeldtekst',
      maxLength: 150,
      admin: {
        description: 'Korte tekst die wordt getoond in de inbox, na het onderwerp (bijv. "Lees mijn nieuwste verhalen over...")',
      },
    },
    {
      name: 'greeting',
      type: 'text',
      label: 'Aanhef',
      defaultValue: 'Hallo',
      admin: {
        description: 'Hoe begroet je je lezers? (bijv. "Hallo", "Beste lezer", "Hi!")',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhoud',
      required: true,
      admin: {
        description: 'De hoofdtekst van je nieuwsbrief - schrijf hier je bericht',
      },
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: ['columns', 'childrens-stories', 'audio-content', 'about-me'],
      hasMany: true,
      maxDepth: 1,
      label: 'Uitgelichte verhalen',
      admin: {
        description: 'Kies columns, verhalen of audio-fragmenten die je wilt highlighten in deze nieuwsbrief',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      options: [
        { label: '📝 Concept - nog aan het werk', value: 'draft' },
        { label: '🚀 Verzonden - naar alle abonnees', value: 'sent' },
        { label: '⏰ Gepland - wordt automatisch verstuurd', value: 'scheduled' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Huidige status van deze nieuwsbrief',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Verzonden op',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Automatisch ingevuld',
      },
    },
    {
      name: 'sentCount',
      type: 'number',
      label: 'Aantal verzonden',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Hoeveel mensen deze nieuwsbrief ontvingen',
      },
    },
  ],
};
