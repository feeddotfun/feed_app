import { UseQueryResult } from '@tanstack/react-query';
import { createGenericQuery } from '../core/use-generic-query';
import { AINewsLabService } from './service';
import { BaseResponse, AINewsLabItem } from '@/types';
import { useMemo } from 'react';

const aiNewsLabService = new AINewsLabService();
const useMemeQuery = createGenericQuery<AINewsLabItem, AINewsLabService>(
  aiNewsLabService, 
  'aiNewsLab', 
  { staleTime: 10000 }
);

export const useAINewsLab = () => {
  const { useInfiniteItems, useCustomAction } = useMemeQuery();
  
  const query = useInfiniteItems({
    queryKey: ['aiNewsLab', 'infinite']
  });

  const memes = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap(page => page.items);
  }, [query.data]);

  const convertMutation = useCustomAction(
    (id: string) => aiNewsLabService.convertToArena(id)
  );

  return {
    memes,
    isLoading: !query.data || query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    convertMutation
  };
};