'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, useRef } from 'react';
import { handleAINewsLabEvents } from '@/lib/query/ai-news-lab/events';
import { handleCommunitySettingEvents } from '@/lib/query/community-setting/events';
import { handleMemeArenaEvents } from '@/lib/query/meme-arena/event';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
          },
        },
      }), 
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleEvent = (parsedData: any) => {
    console.log('Processing event:', parsedData.type);
    
    switch (parsedData.type) {
      case 'connected':
        retryCountRef.current = 0; // Reset retry count on successful connection
        break;
        
      case 'new-meme':
      case 'new-session':
      case 'meme-vote-update':
      case 'voting-threshold-reached':
      case 'contributing-started':
      case 'new-contribution':
      case 'token-creation-started':
      case 'contributing-ended':
        handleMemeArenaEvents(parsedData, queryClient);
        break;
        
      case 'news-converted':
        handleAINewsLabEvents(parsedData, queryClient);
        break;
        
      case 'vote-update':
      case 'config-update':
        handleCommunitySettingEvents(parsedData, queryClient);
        break;
        
      default:
        console.log('Unhandled event type:', parsedData.type);
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    if (retryCountRef.current >= MAX_RETRIES) {
      return;
    }

    console.log(`Connecting to SSE... (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`);
    
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/sse');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
    };

    eventSource.onmessage = (event) => {
      try {
        const eventData = event.data;
        if (eventData.trim() === '') return;
        
        const parsedData = JSON.parse(eventData);
        handleEvent(parsedData);
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current);
      retryCountRef.current += 1;
      
      console.log(`Reconnecting in ${retryDelay}ms... (Attempt ${retryCountRef.current}/${MAX_RETRIES})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        connectSSE();
      }, retryDelay);
    };
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, checking SSE connection');
        if (!eventSourceRef.current || eventSourceRef.current.readyState !== EventSource.OPEN) {
          retryCountRef.current = 0; // Reset retry count
          connectSSE();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initial connection
  useEffect(() => {
    connectSSE();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        console.log('Closing SSE connection');
        eventSourceRef.current.close();
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