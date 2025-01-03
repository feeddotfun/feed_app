import { BaseEntity, BaseResponse } from "@/types";

export class BaseService<T extends BaseEntity> {
    constructor(protected baseURL: string) {}
  
    async getAll(): Promise<BaseResponse<T>> {
      const response = await fetch(this.baseURL);
      if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
      return response.json();
    }
  
    protected async customAction<R>(
      endpoint: string, 
      method: string = 'POST'
    ): Promise<R> {
      const response = await fetch(endpoint, { method });
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