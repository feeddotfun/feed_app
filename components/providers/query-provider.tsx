'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { handleAINewsLabEvents } from '@/lib/query/ai-news-lab/events';
import { handleCommunitySettingEvents } from '@/lib/query/community-setting/events';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
          },
        },
      }), 
  )

  // SSE Connection Setup
  useEffect(() => {
    let eventSource: EventSource;

    const connectSSE = () => {
      eventSource = new EventSource('/api/sse');

      eventSource.onopen = () => {
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const eventData = event.data;
          console.log('SSE message received:', event.data);
          //if (eventData.trim() === '') return;

          handleAINewsLabEvents(event, queryClient);
          handleCommunitySettingEvents(event, queryClient);
          
        } catch (error) {
          console.error('Error handling SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        // Try to reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}