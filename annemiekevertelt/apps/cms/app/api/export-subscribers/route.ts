import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    // Get all subscribers (active and unsubscribed for complete export)
    const subscribers = await payload.find({
      collection: 'subscribers',
      limit: 10000,
    });

    // Generate CSV
    const headers = ['Email', 'Naam', 'Status', 'Ingeschreven op', 'Uitgeschreven op'];
    const rows = subscribers.docs.map((sub) => [
      sub.email,
      sub.name || '',
      sub.status,
      sub.subscribedAt ? new Date(sub.subscribedAt).toISOString() : '',
      sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abonnees-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
