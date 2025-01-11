import { getUserInvestments } from '@/lib/actions/investment.action';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const publicKey = searchParams.get('publicKey');
    const filter = searchParams.get('filter') || 'waiting-claim';

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Wallet public key is required' },
        { status: 400 }
      );
    }

    const data = await getUserInvestments(publicKey, page, filter);
    
    return NextResponse.json({
      items: data.items,
      total: data.items.length,
      hasMore: data.hasMore,
      totalPages: data.totalPages
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}