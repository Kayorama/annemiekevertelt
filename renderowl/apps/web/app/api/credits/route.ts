import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mock credit data
  return NextResponse.json({
    balance: 150,
    pending: 0,
  });
}

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Mock purchase
  return NextResponse.json({
    message: 'Purchase successful',
    credits: body.amount || 100,
  });
}