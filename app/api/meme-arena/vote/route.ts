import { NextResponse } from 'next/server';
import { createMemeVote } from '@/lib/actions/meme-arena.action';
import { CreateMemeVoteDto } from '@/types';

export async function POST(req: Request) {
  try {
    const body: CreateMemeVoteDto = await req.json();

    const newMeme = await createMemeVote(body);
    return NextResponse.json(newMeme, { status: 201 });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create meme vote' }, { status: 500 });
  }
}