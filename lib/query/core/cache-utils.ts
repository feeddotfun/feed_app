import { QueryClient } from '@tanstack/react-query';
import { BaseEntity, BaseResponse } from '@/types';
import { QueryKeys } from './query-keys';

export class CacheUtils<T extends BaseEntity> {
  constructor(
    private queryClient: QueryClient,
    private queryKeys: QueryKeys<string>
  ) {}

  updateItem(updatedItem: Partial<T> & Pick<T, 'id'>) {
    this.queryClient.setQueryData<BaseResponse<T>>(
      this.queryKeys.all(),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          ),
        };
      }
    );
  }
}