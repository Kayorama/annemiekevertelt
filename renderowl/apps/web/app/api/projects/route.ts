import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mock projects data
  const projects = [
    {
      id: 'proj-1',
      name: 'Welcome Video',
      thumbnail: '',
      status: 'complete',
      updatedAt: '2024-03-05T10:00:00Z',
      duration: 45,
    },
    {
      id: 'proj-2',
      name: 'Product Demo',
      thumbnail: '',
      status: 'draft',
      updatedAt: '2024-03-04T15:30:00Z',
      duration: 120,
    },
  ];

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  return NextResponse.json({
    id: 'proj-new',
    name: body.name,
    status: 'draft',
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}