import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers',
  },
  admin: {
    useAsTitle: 'email',
    group: '⚙️ Systeem',
    description: 'Mensen die kunnen inloggen op dit beheerpaneel',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      admin: {
        description: 'Volledige naam van de gebruiker',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      defaultValue: 'editor',
      options: [
        { label: '👑 Beheerder - kan alles', value: 'admin' },
        { label: '✏️ Redacteur - kan content beheren', value: 'editor' },
      ],
      admin: {
        description: 'Wat mag deze gebruiker doen?',
      },
    },
  ],
};
