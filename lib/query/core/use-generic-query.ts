import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  BaseEntity, 
  QueryConfig, 
  ServiceResponse,
  CacheContext
} from '@/types';
import { BaseService } from './base-service';
import { QueryKeys } from './query-keys';
import { CacheUtils } from './cache-utils';

export function createGenericQuery<
  T extends BaseEntity, 
  S extends BaseService<T>,
  P = any
>(
  service: S,
  entityName: string,
  defaultConfig?: QueryConfig
) {
  const queryKeys = new QueryKeys(entityName);

  return () => {
    const queryClient = useQueryClient();
    const cacheUtils = new CacheUtils<T>(queryClient, queryKeys);

    const useGetAll = (config?: QueryConfig) => {
      return useQuery({
        queryKey: queryKeys.all(),
        queryFn: () => service.getAll(),
        staleTime: config?.staleTime ?? defaultConfig?.staleTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false
      });
    };

    const useInfiniteItems = (config?: QueryConfig  & { customParams?: any, queryKey?: any[] }) => {
      return useInfiniteQuery<ServiceResponse<T>, Error>({
        queryKey: config?.queryKey || [...queryKeys.all(), 'infinite'],
        queryFn: ({ pageParam = 1 }) => service.getInfinite({ page: pageParam as number, limit: 6,  ...config?.customParams }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
        staleTime: config?.staleTime ?? defaultConfig?.staleTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false
      });
    };

    const useCustomAction = <TParams, TResult = T>(
      actionFn: (params: TParams) => Promise<TResult>
    ) => {
      return useMutation<TResult, Error, TParams, CacheContext<T>>({
        mutationFn: actionFn,
        onMutate: async () => {
          await queryClient.cancelQueries({ queryKey: queryKeys.all() });
          return { 
            previousData: queryClient.getQueryData(queryKeys.all()) 
          };
        },
        onError: (_, __, context) => {
          if (context?.previousData) {
            queryClient.setQueryData(queryKeys.all(), context.previousData);
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all() });
        },
      });
    };

    return {
      useGetAll,
      useInfiniteItems,
      useCustomAction,
      cacheUtils,
    };
  };
}