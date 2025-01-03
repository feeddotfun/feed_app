export interface BaseEntity {
    id: string;
    createdAt: string;
  }
  
export interface BaseResponse<T> {
    items: T[];
    total: number;
  }
  
export interface QueryConfig {
    staleTime?: number;
}

export interface BaseSSEEvent<T> {
  type: string;
  data: T;
}