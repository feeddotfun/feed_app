import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createVote, getActiveVotes } from '../actions/system-config-community-vote.action';
import { randomUUID } from 'crypto';

// Query Keys
export const queryKeys = {
  systemConfigVotes: ['system-config-votes'] as const,
};

// Types
interface VoteData {
  voter: string;
  settingKey: string;
  selectedValue: number;
}

// Query Hook
export const useSystemConfigVotes = (initialData?: Record<string, Array<{value: number, votes: number}>>) => {
  const queryClient = useQueryClient();

  const { data: votes, isLoading } = useQuery({
    queryKey: queryKeys.systemConfigVotes,
    queryFn: getActiveVotes,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteData: VoteData) => {
      await createVote({
        ...voteData,
        voterIpAddress: randomUUID(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemConfigVotes });
    },
  });

  // Helper functions
  const getVotesForSetting = (settingKey: string) => {
    return votes?.[settingKey] || [];
  };

  return {
    votes,
    isLoading,
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
    getVotesForSetting,
  };
};