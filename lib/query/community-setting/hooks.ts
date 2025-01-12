import { createGenericQuery } from '../core/use-generic-query';
import { CommunitySettingService } from './service';
import { CommunitySettingData, VoteParams } from '@/types';

const communitySettingService = new CommunitySettingService();
const useSettingQuery = createGenericQuery<
  CommunitySettingData, 
  CommunitySettingService,
  VoteParams
>(
  communitySettingService, 
  'communitySetting',
  { staleTime: 30000 }
);

export const useCommunitySetting = () => {
  const { useGetAll, useCustomAction } = useSettingQuery();
  const voteMutation = useCustomAction((params: VoteParams) => 
    communitySettingService.vote(params)
  );
  
  const { data, isLoading } = useGetAll()
  
  const getVotesForSetting = (settingKey: string) => {
    if (!data?.items[0]?.votes) return [];
    return data.items[0].votes.filter(vote => vote.settingKey === settingKey);
  };

  const getCurrentValue = (settingKey: string) => {
    if (!data?.items[0]?.config) return 0;
    return data.items[0].config[settingKey] ?? 0;
  };

  return {
    currentConfig: data?.items[0]?.config,
    votingStartTime: data?.items[0]?.votingStartTime,
    votingEndTime: data?.items[0]?.votingEndTime,
    isLoading,
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
    getVotesForSetting,
    getCurrentValue,
    settings: data?.items[0]?.settings
  };
};