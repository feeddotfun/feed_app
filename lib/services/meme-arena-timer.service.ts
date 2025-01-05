import { Client } from '@upstash/qstash';

export enum SessionEventType {
  VOTING_END = 'voting-end',
  CONTRIBUTING_END = 'contributing-end',
  START_SESSION = 'start-session'
}

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

  private async scheduleQstashEvent(
    eventType: SessionEventType,
    sessionId: string,
    scheduledAt: number,
    expectedEndTime: number
  ) {
    return this.qstash.publishJSON({
      url: `${process.env.API_URL}/api/timer/${eventType}`,
      body: { 
        sessionId,
        scheduledAt,
        expectedEndTime
      },
      notBefore: Math.round(expectedEndTime / 1000),
      retries: 3
    });
  }

  private async scheduleContributingEndEvent(sessionId: string, delay: number) {
    const now = Date.now();
    const eventTime = now + delay;
    const nextSessionTime = eventTime + delay;

    // Schedule contributing end
    await this.scheduleQstashEvent(
      SessionEventType.CONTRIBUTING_END,
      sessionId,
      now,
      eventTime
    );

    return {
      success: true,
      scheduledTime: new Date(eventTime),
      nextSessionTime: new Date(nextSessionTime)
    };
  }

  private async scheduleStandardEvent(eventType: SessionEventType, sessionId: string, delay: number) {
    const now = Date.now();
    const eventTime = now + delay;

    await this.scheduleQstashEvent(
      eventType,
      sessionId,
      now,
      eventTime
    );

    return {
      success: true,
      scheduledTime: new Date(eventTime)
    };
  }

  async scheduleVotingEnd(sessionId: string, votingTimeLimit: number) {
    return this.scheduleStandardEvent(SessionEventType.VOTING_END, sessionId, votingTimeLimit);
  }

  async scheduleContributingEnd(sessionId: string, contributeFundingLimit: number) {
    return this.scheduleContributingEndEvent(sessionId, contributeFundingLimit);
  }

  async scheduleNextSession(sessionId: string, nextSessionDelay: number) {
    return this.scheduleStandardEvent(SessionEventType.START_SESSION, sessionId, nextSessionDelay);
  }
}