import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { 
 CommunitySettingData, 
 CommunityVoteParams,
 CommunityVoteData,
 CommunitySystemConfig
} from '@/types';

export const queryKeys = {
  communitySetting: ['community-setting'] as const,
 votingProgress: ['voting-progress'] as const,
};

const fetchCommunitySetting = async (): Promise<CommunitySettingData> => {
 const response = await fetch('/api/community-setting');
 if (!response.ok) {
   throw new Error('Failed to fetch community setting');
 }
 return response.json();
};

const submitVote = async (data: CommunityVoteParams): Promise<{ success: boolean }> => {
 const response = await fetch('/api/community-setting', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(data),
 });

 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(errorData.error || 'Failed to submit vote');
 }

 return response.json();
};

export const useCommunitySetting = ({ initialData }: { initialData?: CommunitySettingData }) => {
 const queryClient = useQueryClient();

 const { 
   data: currentData,
   isLoading,
   error 
 } = useQuery({
   queryKey: queryKeys.communitySetting,
   queryFn: fetchCommunitySetting,
   initialData,
   staleTime: 0,
   gcTime: 30 * 1000,
 });

 const { mutate: vote, isPending: isVoting } = useMutation({
   mutationFn: submitVote,
   onMutate: async (newVote) => {
     await queryClient.cancelQueries({ queryKey: queryKeys.communitySetting });
     const previousData = queryClient.getQueryData<CommunitySettingData>(queryKeys.communitySetting);

     if (previousData) {
       const previousVotes = previousData.votes.reduce((acc, vote) => ({
         ...acc,
         [vote.settingKey]: (acc[vote.settingKey] || 0) + vote.votes
       }), {} as Record<string, number>);

       if (previousVotes[newVote.settingKey] >= 1000) {
         throw new Error('Maximum votes reached for this setting');
       }
       queryClient.setQueryData<CommunitySettingData>(queryKeys.communitySetting, {
         ...previousData,
         votes: previousData.votes.map(vote => 
           vote.settingKey === newVote.settingKey && 
           vote.optionValue === newVote.selectedValue
             ? { ...vote, votes: vote.votes + 1 }
             : vote
         ),
       });
     }

     return { previousData };
   },
   onError: (err, newVote, context) => {
     if (context?.previousData) {
       queryClient.setQueryData(queryKeys.communitySetting, context.previousData);
     }
   },
   onSettled: () => {
     queryClient.invalidateQueries({ 
       queryKey: queryKeys.communitySetting,
       refetchType: "all"
     });
   },
 });

 const getVotesForSetting = (settingKey: string): CommunityVoteData[] => {
   if (!currentData?.votes) return [];
   return currentData.votes.filter(vote => vote.settingKey === settingKey);
 };

 const getCurrentValue = (settingKey: string): number | undefined => {
   if (!currentData?.config) return undefined;
   return currentData.config[settingKey as keyof CommunitySystemConfig];
 };

 return {
   currentConfig: currentData?.config,
   settings: currentData?.settings,
   votingEndTime: currentData?.votingEndTime,
   votingStartTime: currentData?.votingStartTime,
   isLoading,
   error,
   vote,
   isVoting,
   getVotesForSetting,
   getCurrentValue,
 };
};