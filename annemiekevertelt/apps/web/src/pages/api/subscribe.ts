import type { APIRoute } from 'astro';

const PAYLOAD_URL = import.meta.env.PAYLOAD_URL || 'http://localhost:3001';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Ongeldig e-mailadres' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Payload CMS
    const response = await fetch(`${PAYLOAD_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'Inschrijven mislukt' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: data.message || 'Succesvol ingeschreven!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het later opnieuw.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
