const PAYLOAD_URL = import.meta.env.PAYLOAD_URL || 'http://localhost:3001';

interface FetchOptions {
  collection: string;
  limit?: number;
  page?: number;
  where?: Record<string, any>;
  sort?: string;
  depth?: number;
}

export async function fetchPayload({
  collection,
  limit = 10,
  page = 1,
  where = {},
  sort = '-publishedDate',
  depth = 1,
}: FetchOptions) {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    depth: String(depth),
    sort,
    ...(Object.keys(where).length > 0 && { where: JSON.stringify(where) }),
  });

  const response = await fetch(
    `${PAYLOAD_URL}/api/${collection}?${params}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${collection}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchBySlug(collection: string, slug: string) {
  const response = await fetch(
    `${PAYLOAD_URL}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${collection}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.docs[0] || null;
}

export async function fetchSingle(collection: string, id: string) {
  const response = await fetch(
    `${PAYLOAD_URL}/api/${collection}/${id}?depth=2`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${collection}: ${response.statusText}`);
  }

  return response.json();
}

export async function subscribeToNewsletter(email: string, name?: string) {
  const response = await fetch(`${PAYLOAD_URL}/api/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to subscribe');
  }

  return response.json();
}
