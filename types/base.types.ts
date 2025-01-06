export interface BaseEntity {
    id: string;
    createdAt: string;
  }
  
export interface BaseResponse<T> {
    items: T[];
    total: number;
    currentPage?: number;
    totalPages?: number;
    hasMore?: boolean;
}

export interface InfiniteQueryParams {
  page?: number;
  limit?: number;
}
  
export interface QueryConfig {
    staleTime?: number;
}

export interface BaseSSEEvent<T> {
  type: string;
  data: T;
}

export interface PaginatedResponse<T> extends BaseResponse<T> {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  items: T[];
}

export interface CacheContext<T> {
  previousData?: BaseResponse<T>;
}

export interface ServiceResponse<T> extends PaginatedResponse<T> {
  error?: string;
  message?: string;
}