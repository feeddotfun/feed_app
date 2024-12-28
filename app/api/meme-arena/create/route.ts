import { NextResponse } from 'next/server';
import { createMeme } from '@/lib/actions/meme-arena.action';
import { CreateMemeDto } from '@/types';

export async function POST(req: Request) {
  try {
    const body: CreateMemeDto = await req.json();

    const newMeme = await createMeme(body);
    return NextResponse.json(newMeme, { status: 201 });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create meme' }, { status: 500 });
  }
}