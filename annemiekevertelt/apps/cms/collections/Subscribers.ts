import type { CollectionConfig } from 'payload';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: 'Abonnee',
    plural: 'Nieuwsbrief-abonnees',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'subscribedAt', 'status'],
    group: '💌 Nieuwsbrief',
    description: 'Mensen die zich hebben aangemeld voor de nieuwsbrief',
    hideAPIURL: true,
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
      admin: {
        description: 'Het e-mailadres van de abonnee',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      admin: {
        description: 'Naam van de abonnee (als deze is opgegeven)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'active',
      options: [
        { label: '✅ Actief - ontvangt nieuwsbrieven', value: 'active' },
        { label: '❌ Uitgeschreven - geen mails meer', value: 'unsubscribed' },
        { label: '⚠️ Bounced - e-mail werkt niet', value: 'bounced' },
      ],
      admin: {
        description: 'De huidige status van dit e-mailadres',
      },
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
        description: 'Automatisch ingevuld - wanneer iemand zich aanmelde',
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
        description: 'Automatisch ingevuld - wanneer iemand zich uitschreef',
      },
    },
  ],
};
