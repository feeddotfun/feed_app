import { getAirdropStats } from '@/lib/actions/airdrop-stat.action';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const publicKey = searchParams.get('publicKey');

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Wallet public key is required' },
        { status: 400 }
      );
    }

    const stats = await getAirdropStats(publicKey);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching airdrop stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airdrop stats' },
      { status: 500 }
    );
  }
}