import { useQuery } from '@tanstack/react-query';
import { AirdropStatsService } from './service';
import { AirdropStats } from '@/types';

const service = new AirdropStatsService();

export const useAirdropStats = (publicKey: string | undefined) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<AirdropStats, Error>({
    queryKey: ['airdrop-stats', publicKey],
    queryFn: () => service.getStats(publicKey!),
    enabled: !!publicKey,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    stats: data,
    isLoading,
    isError,
    error: error,
    refetch: async () => {
      await refetch();
    }
  };
};
