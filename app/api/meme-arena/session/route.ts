import { getActiveSessionMemes } from '@/lib/actions/meme-arena.action';
import { BaseResponse, MemeArenaData } from '@/types';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getActiveSessionMemes();
    const response: BaseResponse<MemeArenaData> = {
      items: [data],
      total: 1
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch meme arena session' }, { status: 500 });
  }
}