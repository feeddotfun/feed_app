import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { startContributing } from '@/lib/actions/meme-arena.action';

const verifyQStashSignature = async (req: NextRequest): Promise<boolean> => {
  const signature = req.headers.get('upstash-signature');
  if (!signature) {
    return false;
  }

  const signingKey = process.env.QSTASH_CURRENT_SIGNING_KEY!;
  
  try {
    jwt.verify(signature, signingKey);
    return true;
  } catch  {
    return false;
  }
};

export async function POST(req: NextRequest) {
  if (!await verifyQStashSignature(req)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const { sessionId } = JSON.parse(await req.text());
    await startContributing(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error }, { status: 500 });
  }
}
