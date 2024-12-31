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

// Meme Handlers
const memeHandlers: Record<string, EventHandler> = {
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