import { getActiveSessionMemes } from '@/lib/actions/meme-arena.action';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const activeSession = await getActiveSessionMemes();
    return NextResponse.json(activeSession);
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch meme arena session' }, { status: 500 });
  }
}