import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 });
    }

    // Find the subscriber
    const existing = await payload.find({
      collection: 'subscribers',
      where: {
        email: { equals: email },
      },
    });

    if (existing.docs.length === 0) {
      return NextResponse.json({ 
        message: 'Je bent uitgeschreven. Jammer dat je gaat!' 
      }, { status: 200 });
    }

    const subscriber = existing.docs[0];

    // Update status to unsubscribed
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      message: 'Je bent uitgeschreven. Jammer dat je gaat!' 
    }, { status: 200 });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
