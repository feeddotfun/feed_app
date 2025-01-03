import { BaseService } from '../core/base-service';
import { BaseResponse, CommunitySettingData, VoteParams } from '@/types';

export class CommunitySettingService extends BaseService<CommunitySettingData> {
  constructor() {
    super('/api/community-setting');
  }

  async getAll(): Promise<BaseResponse<CommunitySettingData>> {
    const response = await fetch(this.baseURL);
    if (!response.ok) throw new Error(`Failed to fetch ${this.baseURL}`);
    return response.json();
  }

  async vote(params: VoteParams): Promise<void> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      } catch {
        throw new Error(`Failed to submit vote: ${response.statusText}`);
      }
    }

    return response.json();
  }
}