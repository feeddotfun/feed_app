import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseEntity, QueryConfig } from '@/types';
import { BaseService } from './base-service';
import { QueryKeys } from './query-keys';
import { CacheUtils } from './cache-utils';

export function createGenericQuery<
  T extends BaseEntity, 
  S extends BaseService<T>,
  P = any  // Generic parameter type for custom actions
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
      });
    };

    const useCustomAction = <R>(
      actionFn: (params: P) => Promise<R>
    ) => {
      return useMutation({
        mutationFn: actionFn,
        onMutate: async () => {
          await queryClient.cancelQueries({ queryKey: queryKeys.all() });
          return { previousData: queryClient.getQueryData(queryKeys.all()) };
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
      useCustomAction,
      cacheUtils,
    };
  };
}