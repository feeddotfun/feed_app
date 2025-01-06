import { NextRequest, NextResponse } from 'next/server';
import { getWinningMemes } from '@/lib/actions/winning-memes.action';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');

    const { items, totalPages, hasMore } = await getWinningMemes(page);
    
    return NextResponse.json({
      items,
      totalPages,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching winning memes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winning memes' },
      { status: 500 }
    );
  }
}