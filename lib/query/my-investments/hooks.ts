import { InvestmentService } from './service';
import { InvestmentData, ServiceResponse } from '@/types';
import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type FilterType = 'waiting-claim' | 'claimed' | 'all';
const investmentService = new InvestmentService();

export const useMyInvestments = (publicKey: string, filter: FilterType = 'waiting-claim') => {
  const queryClient = useQueryClient();
    const query = useInfiniteQuery<ServiceResponse<InvestmentData>, Error>({
      queryKey: ['investments', publicKey, filter],
      queryFn: ({ pageParam = 1 }: any) => investmentService.getInvestments(publicKey, pageParam, filter),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => 
        lastPage.hasMore ? allPages.length + 1 : undefined,
      staleTime: 30000,
      enabled: !!publicKey, 
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });

    const claimMutation = useMutation({
      mutationFn: (params: { 
        investmentId: string; 
        mintAddress: string;
        memeUuid: string;
        memeId: string;
      }) => investmentService.claim(params),
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ['investments', publicKey] });
        
        const previousData = queryClient.getQueryData(['investments', publicKey]);
        
        try {
          queryClient.setQueryData(['investments', publicKey], (old: any) => {
            if (!old?.pages) return old;
            
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                items: page.items.map((item: InvestmentData) =>
                  item.id === variables.investmentId
                    ? { ...item, isTokensClaimed: true }
                    : item
                )
              }))
            };
          });
        } catch (error) {
          console.error('Optimistic update error:', error);
        }
  
        return { previousData };
      },
      onError: (err, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(['investments', publicKey], context.previousData);
        }
        toast.error(err instanceof Error ? err.message : 'Failed to claim tokens');
      },
      onSuccess: (data, variables) => {
        toast.success('Successfully claimed tokens');
        queryClient.setQueryData(['investments', publicKey], (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: InvestmentData) =>
                item.id === variables.investmentId
                  ? { ...item, isTokensClaimed: true, isClaimLoading: false }
                  : item
              )
            }))
          };
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['investments', publicKey] });
      }
    });
  
    const investments = useMemo(() => {
      if (!query.data?.pages) return [];
      return query.data.pages.flatMap(page => page.items);
    }, [query.data]);
  
    return {
      investments,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      fetchNextPage: query.fetchNextPage,
      hasNextPage: query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
      total: query.data?.pages[0]?.total || 0,
      totalPages: query.data?.pages[0]?.totalPages || 0,
      claimTokens: {
        mutateAsync: claimMutation.mutateAsync,
        isLoading: claimMutation.isPending,
        currentInvestmentId: claimMutation.variables?.investmentId,
        error: claimMutation.error
      }
    };
};