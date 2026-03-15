import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Afbeelding',
    plural: 'Afbeeldingen',
  },
  admin: {
    useAsTitle: 'filename',
    group: '🖼️ Media',
    description: 'Afbeeldingen voor columns, verhalen en pagina\'s',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: './media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        crop: 'center',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        crop: 'center',
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
        crop: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Beschrijving (alt-tekst)',
      required: true,
      admin: {
        description: 'Beschrijf wat er op de afbeelding staat (belangrijk voor blinden en zoekmachines)',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Bijschrift',
      admin: {
        description: 'Optioneel onderschrift dat onder de afbeelding kan worden getoond',
      },
    },
  ],
};
