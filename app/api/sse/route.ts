import { NextRequest } from 'next/server';
import SSEManager from '@/lib/sse/sse-manager';

export async function GET(request: NextRequest) {
  const sseManager = SSEManager.getInstance();

  const stream = new ReadableStream({
    start(controller) {
      const clientId = sseManager.addClient(controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`));

      // Keep-alive interval
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (error) {
          console.error('Keep-alive error:', error);
          clearInterval(keepAlive);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        sseManager.removeClient(clientId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Export utility function for other routes to use
export function sendUpdate(data: unknown) {
  const sseManager = SSEManager.getInstance();
  sseManager.broadcast(data);
}