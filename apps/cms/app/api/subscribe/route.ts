import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await payload.find({
      collection: 'subscribers',
      where: {
        email: { equals: email },
      },
    });

    if (existing.docs.length > 0) {
      const subscriber = existing.docs[0];
      if (subscriber.status === 'active') {
        return NextResponse.json({ message: 'Al geabonneerd!' }, { status: 200 });
      }
      // Re-subscribe
      await payload.update({
        collection: 'subscribers',
        id: subscriber.id,
        data: {
          status: 'active',
          name: name || subscriber.name,
        },
      });
      return NextResponse.json({ message: 'Weer ingeschreven!' }, { status: 200 });
    }

    // Create new subscriber
    await payload.create({
      collection: 'subscribers',
      data: {
        email,
        name: name || '',
        status: 'active',
        subscribedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ message: 'Succesvol ingeschreven!' }, { status: 201 });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
