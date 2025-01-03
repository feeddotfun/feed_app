import { QueryClient } from '@tanstack/react-query';
import type { BaseResponse, AINewsLabItem } from '@/types';
import { QueryKeys } from '../core/query-keys';

const queryKeys = new QueryKeys('aiNewsLab');

export const handleAINewsLabEvents = (event: MessageEvent, queryClient: QueryClient) => {
  try {
    const data = JSON.parse(event.data);    
    
    switch (data.type) {
      case 'news-converted':
        queryClient.setQueryData<BaseResponse<AINewsLabItem>>(
          queryKeys.all(), 
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter(item => item.id !== data.data.newsId),
              total: old.total - 1
            };
          }
        );
        break;
        
      default:
        queryClient.invalidateQueries({ queryKey: queryKeys.all() });
    }
  } catch (error) {
    console.error('Error handling meme event:', error);
  }
};