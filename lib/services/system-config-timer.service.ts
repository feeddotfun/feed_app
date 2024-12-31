import { Client } from "@upstash/qstash";

export class SystemConfigTimerService {
    private static instance: SystemConfigTimerService;
    private qstash: Client;
  
    private constructor() {
      this.qstash = new Client({
        token: process.env.QSTASH_TOKEN!
      });
    }
  
    static getInstance(): SystemConfigTimerService {
      if (!SystemConfigTimerService.instance) {
        SystemConfigTimerService.instance = new SystemConfigTimerService();
      }
      return SystemConfigTimerService.instance;
    }
  
    async scheduleConfigUpdate(delay: number = 24 * 60 * 60 * 1000) { // 24 Hours
      const now = Date.now();
      const endTime = Math.round((now + delay) / 1000);
      
      try {      
        await this.qstash.publishJSON({
          url: `${process.env.API_URL}/api/timer/system-config-update`,
          body: { 
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
        console.error('Failed to schedule config update:', error);
        return {
          success: false,
          error
        };
      }
    }
  }