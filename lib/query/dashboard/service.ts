import { BaseService } from '../core/base-service';
import { BaseResponse, DashboardStats } from '@/types';

export class DashboardService extends BaseService<DashboardStats> {
  constructor() {
    super('/api/dashboard');
  }

  async getAll(): Promise<BaseResponse<DashboardStats>> {
    const response = await fetch(`${this.baseURL}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    const data = await response.json();
    return data;
  }
}