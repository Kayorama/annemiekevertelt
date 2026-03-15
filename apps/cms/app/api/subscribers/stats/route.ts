import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    // Get all subscribers
    const allSubscribers = await payload.find({
      collection: 'subscribers',
      limit: 10000,
    });

    const stats = {
      total: allSubscribers.docs.length,
      active: allSubscribers.docs.filter((s) => s.status === 'active').length,
      unsubscribed: allSubscribers.docs.filter((s) => s.status === 'unsubscribed').length,
      bounced: allSubscribers.docs.filter((s) => s.status === 'bounced').length,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
