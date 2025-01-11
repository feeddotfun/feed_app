import { createGenericQuery } from '../core/use-generic-query';
import { WinningMemesService } from './service';
import { WinningMemeData } from '@/types';
import { useMemo } from 'react';
import { InfiniteData } from '@tanstack/react-query';

const winningMemesService = new WinningMemesService();
const useWinningMemesQuery = createGenericQuery<
  WinningMemeData,
  WinningMemesService
>(
  winningMemesService,
  'winningMemes',
  { staleTime: 30000 }
);

export const useWinningMemes = () => {
  const { useInfiniteItems } = useWinningMemesQuery();
  const query = useInfiniteItems();
  
  const memes = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap(page => page.items);
  }, [query.data]);

  return {
    memes,
    isLoading: !query.data || query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage
  };
};