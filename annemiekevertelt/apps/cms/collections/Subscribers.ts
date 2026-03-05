import type { CollectionConfig } from 'payload';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'subscribedAt', 'status'],
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
      name: 'email',
      type: 'email',
      label: 'E-mailadres',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'active',
      options: [
        { label: 'Actief', value: 'active' },
        { label: 'Geopteerd', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      label: 'Ingeschreven op',
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMMM yyyy, HH:mm',
        },
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      label: 'Uitgeschreven op',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMMM yyyy, HH:mm',
        },
      },
    },
  ],
};
