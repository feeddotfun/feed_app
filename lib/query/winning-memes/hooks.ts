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
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteItems();

  const memes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  return {
    memes,
    isLoading: status === 'pending',
    isError: status === 'error',
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};