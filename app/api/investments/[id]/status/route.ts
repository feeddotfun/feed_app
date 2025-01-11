import { updateClaimStatus } from '@/lib/actions/investment.action';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { signature, contributor, memeId } = await req.json();

    if (!signature || !contributor || !memeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await updateClaimStatus({
      contributor,
      signature,
      memeId
    });

    return NextResponse.json({
      success: true,
      isTokensClaimed: result.isTokensClaimed
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    );
  }
}