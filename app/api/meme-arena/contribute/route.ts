import { NextResponse } from 'next/server';
import { CreateContributeDto } from '@/types';

export async function POST(req: Request) {
  try {
      const body: CreateContributeDto = await req.json();
      const { memeProgramId, contributor, amount } = body;
      if (!memeProgramId || !contributor || !amount) {
        throw new Error('Invalid request');
      }
      

    }
    catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}