import { NextResponse } from 'next/server';
import { CreateContributeDto } from '@/types';
import { memeContribute } from '@/lib/actions/program.action';

export async function POST(req: Request) {
  try {
    const body: CreateContributeDto = await req.json();
    const { memeProgramId, contributor, amount } = body;
    
    // Input validation
    if (!memeProgramId || !contributor || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Get transaction from SDK
    const { serializedTransaction, lastValidBlockHeight } = 
      await memeContribute(memeProgramId, contributor, amount);

    if (!serializedTransaction) {
      throw new Error('Failed to create transaction');
    }

    return NextResponse.json({ 
      serializedTransaction, 
      lastValidBlockHeight 
    });

  } catch (error) {
    console.error('Contribute API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' }, 
      { status: 500 }
    );
  }
}