import { BaseService } from '../core/base-service';
import { AirdropStats } from '@/types';

export class AirdropStatsService extends BaseService<AirdropStats> {
  constructor() {
    super('/api/airdrop-stats');
  }

  async getStats(publicKey: string): Promise<AirdropStats> {
    if (!publicKey) {
      throw new Error('Public key is required');
    }

    try {
      const response = await fetch(`${this.baseURL}?publicKey=${publicKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch airdrop stats');
      }

      const data = await response.json();
      return data;
    } catch  {
      throw new Error('Error fetching airdrop stats')
    }
  }
}