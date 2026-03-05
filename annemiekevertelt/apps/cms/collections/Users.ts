import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Systeem',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      defaultValue: 'editor',
      options: [
        { label: 'Beheerder', value: 'admin' },
        { label: 'Redacteur', value: 'editor' },
      ],
    },
  ],
};
