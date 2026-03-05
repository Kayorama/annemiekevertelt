import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 });
  }

  // Here we would unsubscribe the user
  // For now, just return success
  return NextResponse.json({ 
    message: 'Je bent uitgeschreven. Jammer dat je gaat!' 
  }, { status: 200 });
}
