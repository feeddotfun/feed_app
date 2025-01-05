import { NextRequest, NextResponse } from 'next/server';
import { getWithSessionContributions } from '@/lib/actions/meme-arena.action';

export async function GET(
  request: NextRequest,
  context: { params: { sessionId: string } }
) {
  const { sessionId } = await Promise.resolve(context.params);
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const contributions = await getWithSessionContributions(sessionId);
    return NextResponse.json(contributions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}