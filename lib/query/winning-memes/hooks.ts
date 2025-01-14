import { createGenericQuery } from '../core/use-generic-query';
import { WinningMemesService } from './service';
import { WinningMemesSortType, WinningMemeData } from '@/types';
import { useMemo } from 'react';

const winningMemesService = new WinningMemesService();
const useWinningMemesQuery = createGenericQuery<
  WinningMemeData,
  WinningMemesService
>(
  winningMemesService,
  'winningMemes',
  { staleTime: 30000 }
);

export const useWinningMemes = (sortBy: WinningMemesSortType = 'votes') => {
  const { useInfiniteItems } = useWinningMemesQuery();
  const query = useInfiniteItems({
    customParams: { sortBy },
    queryKey: ['winningMemes', 'infinite', { sortBy }]
  });
  
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