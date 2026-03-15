import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { newsletterId } = await req.json();

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID is verplicht' }, { status: 400 });
    }

    // Get newsletter
    const newsletter = await payload.findByID({
      collection: 'newsletter-templates',
      id: newsletterId,
    });

    if (!newsletter) {
      return NextResponse.json({ error: 'Nieuwsbrief niet gevonden' }, { status: 404 });
    }

    // Get all active subscribers
    const subscribers = await payload.find({
      collection: 'subscribers',
      where: {
        status: { equals: 'active' },
      },
    });

    if (subscribers.docs.length === 0) {
      return NextResponse.json({ error: 'Geen actieve abonnees' }, { status: 400 });
    }

    // Send emails in batches
    const BATCH_SIZE = 50;
    let sentCount = 0;

    for (let i = 0; i < subscribers.docs.length; i += BATCH_SIZE) {
      const batch = subscribers.docs.slice(i, i + BATCH_SIZE);
      
      const emailPromises = batch.map(async (subscriber) => {
        const greeting = subscriber.name 
          ? `${newsletter.greeting} ${subscriber.name}` 
          : newsletter.greeting;

        await resend.emails.send({
          from: 'Annemieke Vertelt <newsletter@annemiekevertelt.nl>',
          to: subscriber.email,
          subject: newsletter.subject,
          html: generateEmailHTML(newsletter, greeting, subscriber.email),
        });
      });

      await Promise.all(emailPromises);
      sentCount += batch.length;
    }

    // Update newsletter status
    await payload.update({
      collection: 'newsletter-templates',
      id: newsletterId,
      data: {
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentCount,
      },
    });

    return NextResponse.json({ 
      message: `Nieuwsbrief verzonden naar ${sentCount} abonnees`,
      sentCount 
    }, { status: 200 });

  } catch (error) {
    console.error('Send newsletter error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}

function generateEmailHTML(newsletter: any, greeting: string, email: string) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .content { font-size: 16px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        a { color: #C4A77D; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Annemieke Vertelt</h1>
      </div>
      <div class="greeting">${greeting},</div>
      <div class="content">${newsletter.content}</div>
      <div class="footer">
        <p>Je ontvangt deze nieuwsbrief omdat je je hebt ingeschreven op annemiekevertelt.nl</p>
        <p><a href="${unsubscribeUrl}">Uitschrijven</a></p>
      </div>
    </body>
    </html>
  `;
}
