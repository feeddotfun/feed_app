import { sendUpdate } from "@/lib/utils";
import { getActiveSessionMemes } from "@/lib/actions/meme-arena.action";
import { createMemeFromNews } from "@/lib/actions/meme-news.action";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
   const { id } = await Promise.resolve(context.params);

    if (!id) {
      return new Response(JSON.stringify({ error: 'News ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sessionData = await getActiveSessionMemes();
          if (sessionData.memes.length >= sessionData.session.maxMemes) {
        return new Response(JSON.stringify({ 
          error: 'Meme Arena is full for current session' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    
    const meme = await createMemeFromNews(sessionData.session.id, id);

    sendUpdate('news-converted',{
      data: {
        newsId: id,     
        timestamp: Date.now()
      }
    });

    sendUpdate('new-meme', {
      meme
    });
    
    return new Response(JSON.stringify(meme), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to transform news to meme' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
