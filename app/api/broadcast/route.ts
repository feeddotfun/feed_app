import SSEManager from "@/lib/sse/sse-manager";

export const runtime = 'edge';

export async function POST(request: Request) {
  const { type, data } = await request.json();
  const sseManager = SSEManager.getInstance();
  await sseManager.broadcast(type, data);
  
  return new Response(JSON.stringify({ success: true }));
}