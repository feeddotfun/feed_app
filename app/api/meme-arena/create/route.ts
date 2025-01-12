import { NextResponse } from 'next/server';
import { createMeme } from '@/lib/actions/meme-arena.action';
import { CreateMemeParams } from '@/types';
import { sendUpdate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body: CreateMemeParams = await req.json();

    const result = await createMeme(body);
    sendUpdate('new-meme',{
      meme: result,
      timestamp: Date.now()
    });
    return NextResponse.json({
      items: [result],
      total: 1
    });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create meme' }, { status: 500 });
  }
}