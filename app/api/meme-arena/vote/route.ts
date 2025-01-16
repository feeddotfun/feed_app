import { NextResponse } from 'next/server';
import { createMemeVote } from '@/lib/actions/meme-arena.action';
import { VoteMemeParams } from '@/types';
import { getIpAddress, sendUpdate } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const params: VoteMemeParams = await req.json();
    const ipAddress = uuidv4();//await getIpAddress(req);

    const voteParams: VoteMemeParams = {
      ...params,
      voterIpAddress: ipAddress
    };

    const result = await createMemeVote(voteParams);
    sendUpdate('meme-vote-update',{
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
    return NextResponse.json({ error: 'Failed to create meme vote' }, { status: 500 });
  }
}