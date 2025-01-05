import { createGenericQuery } from '../core/use-generic-query';
import { DashboardService } from './service';
import { DashboardStats } from '@/types';

const dashboardService = new DashboardService();
const useDashboardQuery = createGenericQuery<
  DashboardStats,
  DashboardService,
  any
>(
  dashboardService,
  'dashboard',
  { staleTime: 30000 }
);

export const useDashboard = () => {
  const { useGetAll } = useDashboardQuery();
  const { data, isLoading, isError, error} = useGetAll();
  console.log(data)
  return {
    isLoading: !data || isLoading,
    isError: isError,
    error: error,
    stats: data?.items[0]
  };
}