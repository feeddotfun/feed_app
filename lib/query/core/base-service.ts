import { 
  BaseEntity, 
  BaseResponse, 
  InfiniteQueryParams,
  ServiceResponse 
} from "@/types";

export class BaseService<T extends BaseEntity> {
    constructor(protected baseURL: string) {}
  
    async getAll(): Promise<BaseResponse<T>> {
      const response = await fetch(this.baseURL);
      if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
      return response.json();
    }

    async getInfinite(params: InfiniteQueryParams): Promise<ServiceResponse<T>> {
      const queryParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        limit: params.limit?.toString() || '6'
      });

      const response = await fetch(`${this.baseURL}?${queryParams}`);
      if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
      
      const data = await response.json();
      return {
        ...data,
        currentPage: params.page || 1
      };
    }
  
    protected async customAction<R>(
      endpoint: string, 
      method: string = 'POST',
      body?: any
    ): Promise<R> {
      const response = await fetch(endpoint, { 
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to perform ${method} on ${endpoint}`);
        } catch {
          throw new Error(`Failed to perform ${method} on ${endpoint}: ${response.statusText}`);
        }
      }
      return response.json();
    }
}