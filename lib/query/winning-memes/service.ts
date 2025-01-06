import { BaseService } from '../core/base-service';
import { BaseResponse, ServiceResponse, WinningMemeData } from '@/types';

export class WinningMemesService extends BaseService<WinningMemeData> {
  constructor() {
    super('/api/winning-memes');
  }

  async getAll(): Promise<BaseResponse<WinningMemeData>> {
    const response = await fetch(`${this.baseURL}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }

  async getInfinite(params: { page: number }): Promise<ServiceResponse<WinningMemeData>> {
    const response = await fetch(`${this.baseURL}?page=${params.page}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }
}