import { NextRequest, NextResponse } from 'next/server';
import { getWinningMemes } from '@/lib/actions/winning-memes.action';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const data = await getWinningMemes(page);
    
    return NextResponse.json({
      items: data.items,
      total: data.items.length,
      hasMore: data.hasMore,
      totalPages: data.totalPages
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch winning memes' },
      { status: 500 }
    );
  }
}