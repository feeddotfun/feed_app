import { sendUpdate } from "@/app/api/sse/route";
import { getActiveSessionMemes } from "@/lib/actions/meme-arena.action";
import { createMemeFromNews } from "@/lib/actions/meme-news.action";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
   const { id } = await Promise.resolve(context.params);

    if (!id) {
      return new Response(JSON.stringify({ error: 'Config ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    //const meme = await convertTest(id);

    sendUpdate('news-converted',{
      data: {
        newsId: id,
        meme: meme,       
        timestamp: Date.now()
      }
    });
    return new Response(JSON.stringify(meme), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Transform error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to transform news to meme' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

  
  