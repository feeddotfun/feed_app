import { BaseEntity } from "./base.types";

export interface DashboardMetric {
    id: string;
    title: string;
    value: number | string;
    change?: number;
    prefix?: string;
    suffix?: string;
  }
  
  export interface DashboardChart {
    id: string;
    title: string;
    data: any[];
    type: 'line' | 'bar' | 'area';
    xKey: string;
    yKey: string;
  }
  
  export interface DashboardList {
    id: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      value?: number | string;
      image?: string;
    }>;
  }
  
  export interface DashboardData extends BaseEntity {
    metrics: DashboardMetric[];
    charts: DashboardChart[];
    lists: DashboardList[];
  }