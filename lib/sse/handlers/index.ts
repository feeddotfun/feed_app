import { MemeArenaData, NewsLabItem } from '@/types';
import { QueryClient } from '@tanstack/react-query';

// Base handler type
type EventHandler = (queryClient: QueryClient, data: any) => void;

// Community Settings Handlers
const communitySettingsHandlers: Record<string, EventHandler> = {
  'community-setting-vote-update': (queryClient, data) => {
    queryClient.setQueryData(['community-setting'], (oldData: any) => {
      if (!oldData) return oldData;
      const updatedVotes = oldData.votes.map((vote: any) => {
        const newVoteData = data.votes.find(
          (v: any) => v.settingKey === vote.settingKey && v.optionValue === vote.optionValue
        );
        return newVoteData || vote;
      });
      return { ...oldData, votes: updatedVotes };
    });
  },
  'config-update': (queryClient, data) => {
    queryClient.setQueryData(['community-setting'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        config: {
          ...oldData.config,
          [data.setting]: data.value
        }
      };
    });
  }
};

// News Lab Handlers
const newsLabHandlers: Record<string, EventHandler> = {
  'news-to-arena': (queryClient, data) => {
    console.log('Received news-to-arena event:', data);
    // First update the news lab query data
    queryClient.setQueryData(['ai-news-lab'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        items: oldData.items.map((item: NewsLabItem) => 
          item.id === data.newsId 
            ? { ...item, isConverted: true }
            : item
        )
      };
    });

    // Then update the meme arena data
    queryClient.setQueryData(['meme-arena'], (old: MemeArenaData | undefined) => {
      if (!old) return old;
      return {
        ...old,
        memes: data.meme 
          ? [...old.memes.filter(m => m.id !== data.meme.id), data.meme]
          : old.memes
      };
    });
  }
};

// Meme Handlers
const memeHandlers: Record<string, EventHandler> = {
  'new-meme': (queryClient, data) => {
      queryClient.setQueryData(['meme-arena'], (old: MemeArenaData | undefined) => {
        if (!old || !data.meme) return old;
        const existingMemeIndex = old.memes.findIndex(m => m.id === data.meme.id);
        const updatedMemes = existingMemeIndex >= 0
          ? [
              ...old.memes.slice(0, existingMemeIndex),
              data.meme,
              ...old.memes.slice(existingMemeIndex + 1)
            ]
          : [...old.memes, data.meme];
        
        return {
          ...old,
          memes: updatedMemes,
        };
      });
    },
    'meme-created': (queryClient, data) => {
      queryClient.setQueryData(['memes'], (oldData: any) => {
        if (!oldData) return [data.meme];
        return [data.meme, ...oldData];
      });
    },
    'meme-updated': (queryClient, data) => {
      queryClient.setQueryData(['memes'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((meme: any) => 
          meme.id === data.meme.id ? data.meme : meme
        );
      });
    }
};

// Combine all handlers
const handlers: Record<string, EventHandler> = {
    ...communitySettingsHandlers,
    ...memeHandlers,
    ...newsLabHandlers,
};

// Main event handler
export function handleSSEEvent(queryClient: QueryClient, event: MessageEvent) {
  try {
    const data = JSON.parse(event.data);
    if (!data || !data.type) return;

    const handler = handlers[data.type];
    if (handler) {
      handler(queryClient, data);
    } else {
      console.warn(`No handler registered for event type: ${data.type}`);
    }
  } catch (error) {
    console.error('Error handling SSE event:', error);
  }
}