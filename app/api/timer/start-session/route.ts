import { NextRequest, NextResponse } from 'next/server';
import { startNewArenaSession } from '@/lib/actions/meme-arena.action';
import jwt from 'jsonwebtoken';


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
    await startNewArenaSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
