import { NextResponse } from 'next/server';
import { memeClaim } from '@/lib/actions/program.action';

interface ClaimRequestBody {
  contributor: string;
  mintAddress: string;
  memeUuid: string;
}

export async function POST(
  req: Request
) {
  try {
    const body: ClaimRequestBody = await req.json();
    const { contributor, mintAddress, memeUuid } = body;
    
    // Input validation
    if (!memeUuid || !contributor || !mintAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Get transaction from SDK via action
    const { serializedTransaction, lastValidBlockHeight } = 
      await memeClaim(memeUuid, contributor, mintAddress);

    if (!serializedTransaction) {
      throw new Error('Failed to create transaction');
    }

    return NextResponse.json({ 
      serializedTransaction, 
      lastValidBlockHeight 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' }, 
      { status: 500 }
    );
  }
}