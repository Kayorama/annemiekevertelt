import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { newsletterId, testEmail } = await req.json();

    if (!newsletterId || !testEmail) {
      return NextResponse.json(
        { error: 'Nieuwsbrief ID en test e-mailadres zijn verplicht' },
        { status: 400 }
      );
    }

    // Get newsletter
    const newsletter = await payload.findByID({
      collection: 'newsletter-templates',
      id: newsletterId,
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Nieuwsbrief niet gevonden' },
        { status: 404 }
      );
    }

    // Send test email
    const greeting = `${newsletter.greeting} (Test)`;

    await resend.emails.send({
      from: 'Annemieke Vertelt <newsletter@annemiekevertelt.nl>',
      to: testEmail,
      subject: `[TEST] ${newsletter.subject}`,
      html: generateTestEmailHTML(newsletter, greeting),
    });

    return NextResponse.json(
      { message: `Test e-mail verzonden naar ${testEmail}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send test error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het versturen van de test' },
      { status: 500 }
    );
  }
}

function generateTestEmailHTML(newsletter: any, greeting: string) {
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
        .test-banner { background: #C4A77D; color: white; text-align: center; padding: 10px; margin: -20px -20px 20px -20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="test-banner">🧪 DIT IS EEN TEST E-MAIL</div>
      <div class="header">
        <h1>Annemieke Vertelt</h1>
      </div>
      <div class="greeting">${greeting},</div>
      <div class="content">${newsletter.content}</div>
      <div class="footer">
        <p>Dit is een test e-mail. Je ontvangt deze omdat je een test hebt verzonden vanuit het admin panel.</p>
      </div>
    </body>
    </html>
  `;
}
