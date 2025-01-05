import { BaseService } from '../core/base-service';
import { DashboardData } from '@/types';

export class DashboardService extends BaseService<DashboardData> {
  constructor(endpoint: string) {
    super(endpoint);
  }

  async getMetrics(): Promise<DashboardData['metrics']> {
    const response = await fetch(`${this.baseURL}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }

  async getChartData(chartId: string): Promise<DashboardData['charts']> {
    const response = await fetch(`${this.baseURL}/charts/${chartId}`);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return response.json();
  }

  async getListData(listId: string): Promise<DashboardData['lists']> {
    const response = await fetch(`${this.baseURL}/lists/${listId}`);
    if (!response.ok) throw new Error('Failed to fetch list data');
    return response.json();
  }
}