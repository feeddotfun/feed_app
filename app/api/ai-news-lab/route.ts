import { getAvailableNewsMemes } from "@/lib/actions/meme-news.action";
import { BaseResponse, AINewsLabItem } from "@/types";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');

    const data = await getAvailableNewsMemes(page);
    
    const response: BaseResponse<AINewsLabItem> & { hasMore: boolean; totalPages: number } = {
      items: data.items,
      total: data.items.length,
      hasMore: data.hasMore,
      totalPages: data.totalPages
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch news memes' },
      { status: 500 }
    );
  }
}