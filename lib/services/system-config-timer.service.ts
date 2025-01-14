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

  async createVotingSchedule() {
    try {      
      const response = await this.qstash.schedules.create({
        destination: `${process.env.API_URL}/api/timer/system-config-update`,
        cron: "0 0 * * *",
        retries: 3,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        scheduleId: response.scheduleId
      };
    } catch (error) {
      return {
        success: false,
        error
      };
    }
  }

  async deleteSchedule(scheduleId: string) {
    try {
      await this.qstash.schedules.delete(scheduleId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error
      };
    }
  }

  async listSchedules() {
    try {
      const schedules = await this.qstash.schedules.list();
      return {
        success: true,
        schedules
      };
    } catch (error) {
      return {
        success: false,
        error
      };
    }
  }
}