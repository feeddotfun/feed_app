import { getAvailableNewsMemes } from "@/lib/actions/meme-news.action";
import { BaseResponse, AINewsLabItem } from "@/types";

export async function GET() {
    try {
      const newsItems = await getAvailableNewsMemes();
      const response: BaseResponse<AINewsLabItem> = {
        items: newsItems,
        total: newsItems.length
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch news memes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}
