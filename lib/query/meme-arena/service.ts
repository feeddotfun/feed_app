import { BaseService } from '../core/base-service';
import { BaseResponse, MemeArenaData, CreateMemeParams, VoteMemeParams, ContributeMemeParams } from '@/types';

export class MemeArenaService extends BaseService<MemeArenaData> {
  constructor() {
    super('/api/meme-arena');
  }

  async getAll(): Promise<BaseResponse<MemeArenaData>> {
    const response = await fetch(`${this.baseURL}/session`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    const data = await response.json();
    return data;
  }

  async createMeme(params: CreateMemeParams): Promise<MemeArenaData> {
    const response = await fetch(`${this.baseURL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create meme');
    }

    return response.json();
  }

  async voteMeme(params: VoteMemeParams): Promise<MemeArenaData> {
    const response = await fetch(`${this.baseURL}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to vote');
    }

    return response.json();
  }

  async contributeMeme(params: ContributeMemeParams): Promise<MemeArenaData> {
    const response = await fetch(`${this.baseURL}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to contribute');
    }

    return response.json();
  }
}