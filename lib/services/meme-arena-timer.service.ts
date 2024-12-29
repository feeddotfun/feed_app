import { DateTime } from 'luxon';
import { Client } from '@upstash/qstash';

export class MemeArenaTimerService {
  private static instance: MemeArenaTimerService;
  private qstash: Client;

  private constructor() {
    this.qstash = new Client({
      token: process.env.QSTASH_TOKEN!
    });
  }

  static getInstance(): MemeArenaTimerService {
    if (!MemeArenaTimerService.instance) {
      MemeArenaTimerService.instance = new MemeArenaTimerService();
    }
    return MemeArenaTimerService.instance;
  }


  private async scheduleEvent(url: string, sessionId: string, delay: number) {
    const now = Date.now();
    const endTime = Math.round((now + delay) / 1000);
    
    try {      
      await this.qstash.publishJSON({
        url: `${process.env.API_URL}${url}`,
        body: { 
          sessionId,
          scheduledAt: now,
          expectedEndTime: now + delay
        },
        notBefore: endTime,
        retries: 3
      });

      return {
        success: true,
        scheduledTime: new Date(now + delay)
      };
    } catch (error) {
      console.error(`Failed to schedule event: ${url}`, error);
      return {
        success: false,
        error
      };
    }
  }
  async scheduleVotingEnd(sessionId: string, votingTimeLimit: number) {
    return this.scheduleEvent('/api/timer/voting-end', sessionId, votingTimeLimit);
  }
}