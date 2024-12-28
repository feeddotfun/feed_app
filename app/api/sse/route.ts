import { NextRequest } from 'next/server';
import { addClient, removeClient, sendUpdate } from '@/lib/actions/sse';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = addClient(controller);

      const keepAlive = setInterval(() => {
        sendUpdate({ type: 'keep-alive' });
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        removeClient(clientId);
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