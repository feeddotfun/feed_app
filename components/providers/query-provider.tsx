'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { handleSSEEvent } from '@/lib/sse/handlers';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isSSEActive, setIsSSEActive] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: isSSEActive ? Infinity : 5000,
            refetchInterval: isSSEActive ? false : 5000,
            retry: 1,
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            gcTime: 5 * 60 * 1000,
          },
        },
      })
  );

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onopen = () => {
      setIsSSEActive(true);
    };

    eventSource.onmessage = (event) => {
      handleSSEEvent(queryClient, event);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsSSEActive(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsSSEActive(false);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}