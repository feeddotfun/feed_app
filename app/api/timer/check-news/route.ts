import { NextRequest, NextResponse } from 'next/server';
import { NewsLabService } from '@/lib/services/ai-news-lab-fetch.service';
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
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  if (!await verifyQStashSignature(req)) {
    return NextResponse.json(
      { error: 'Invalid signature' }, 
      { status: 401 }
    );
  }

  try {
    const newsLabService = NewsLabService.getInstance();
    const result = await newsLabService.checkAndProcessNewContent();
    
    return NextResponse.json({
      ...result
    });
  } catch (error) {
    console.error('Error in checkAndProcessNewContent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}