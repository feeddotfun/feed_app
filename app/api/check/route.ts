import { NewsLabService } from '@/lib/services/ai-news-lab-fetch.service';
import { NextRequest } from 'next/server';;

export async function GET(request: NextRequest) {
  try {
    
    const newsService = NewsLabService.getInstance();
    const result = await newsService.checkAndProcessNewContent();
    
    return Response.json({
      ...result
    });
  } catch (error: any) {
    console.error('Manual check error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to check news'
    }, { status: 500 });
  }
}