import { BaseService } from '../core/base-service';
import type { AINewsLabItem, InfiniteQueryParams, ServiceResponse } from '@/types';

export class AINewsLabService extends BaseService<AINewsLabItem> {
  constructor() {
    super('/api/ai-news-lab');
  }

  async getAll() {
    const response = await fetch(this.baseURL);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    const data = await response.json();
    
    return data;
  }

  async getInfinite(params: InfiniteQueryParams): Promise<ServiceResponse<AINewsLabItem>> {
    const queryParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '6'
    });

    const response = await fetch(`${this.baseURL}?${queryParams}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }
  

  vote(id: string): Promise<AINewsLabItem> {
    return this.customAction(`${this.baseURL}/${id}/vote`);
  }

  convertToArena(id: string): Promise<AINewsLabItem> {
    return this.customAction(`${this.baseURL}/${id}/add-to-arena`);
  }
}