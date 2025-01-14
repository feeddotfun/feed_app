import { BaseService } from '../core/base-service';
import { BaseResponse, InfiniteQueryParams, ServiceResponse, WinningMemeData } from '@/types';

export class WinningMemesService extends BaseService<WinningMemeData> {
  constructor() {
    super('/api/winning-memes');
  }

  async getAll(): Promise<BaseResponse<WinningMemeData>> {
    const response = await fetch(`${this.baseURL}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }

  async getInfinite(params: InfiniteQueryParams & { sortBy?: string }): Promise<ServiceResponse<WinningMemeData>> {
    const queryParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '6',
      ...(params.sortBy && { sortBy: params.sortBy })
    });

    const response = await fetch(`${this.baseURL}?${queryParams}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }
}