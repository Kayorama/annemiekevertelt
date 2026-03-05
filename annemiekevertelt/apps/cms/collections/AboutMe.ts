import type { CollectionConfig } from 'payload';

export const AboutMe: CollectionConfig = {
  slug: 'about-me',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedDate'],
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
      name: 'category',
      type: 'select',
      label: 'Categorie',
      required: true,
      options: [
        { label: '🎓 School & Studie', value: 'school' },
        { label: '💍 Huwelijk & Relaties', value: 'huwelijk' },
        { label: '👶 Kinderen & Ouders', value: 'kinderen' },
        { label: '💼 Carrière & Werk', value: 'carriere' },
        { label: '🌍 Reizen & Avontuur', value: 'reizen' },
        { label: '🎨 Hobby\'s & Passie', value: 'hobbys' },
      ],
      admin: {
        description: 'Thema-icoon voor deze sectie',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Eigen icoon',
      admin: {
        description: 'Optioneel: vervangt het standaard thema-icoon',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Uitgelichte afbeelding',
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
      label: 'Inhoud',
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
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sorteervolgorde',
      admin: {
        position: 'sidebar',
        description: 'Lager nummer = eerder in de lijst',
      },
    },
  ],
};
