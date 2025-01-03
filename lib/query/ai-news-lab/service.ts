import { BaseService } from '../core/base-service';
import type { AINewsLabItem } from '@/types';

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

  vote(id: string): Promise<AINewsLabItem> {
    return this.customAction(`${this.baseURL}/${id}/vote`);
  }

  convertToArena(id: string): Promise<AINewsLabItem> {
    return this.customAction(`${this.baseURL}/${id}/add-to-arena`);
  }
}