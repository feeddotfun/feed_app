import { QueryClient } from '@tanstack/react-query';
import { BaseResponse, CommunityVote } from '@/types';
import { QueryKeys } from '../core/query-keys';
import { CommunitySettingData } from '@/types';

const queryKeys = new QueryKeys('communitySetting');

export const handleCommunitySettingEvents = (data: any, queryClient: QueryClient) => {
  try {     
    switch (data.type) {
      case 'vote-update':
        queryClient.setQueryData<BaseResponse<CommunitySettingData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              votes: old.items[0].votes.map(vote => {
                const updatedVote = data.data.vote.find(
                  (v: any) => v.settingKey === vote.settingKey && v.optionValue === vote.optionValue
                );
                return updatedVote || vote;
              })
            }]
          };
        });
        break;
        
      case 'config-update':
        queryClient.setQueryData<BaseResponse<CommunitySettingData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              config: {
                ...old.items[0].config,
                [data.setting]: data.value
              }
            }]
          };
        });
        break;

      case 'voting-period-reset':
        queryClient.setQueryData<BaseResponse<CommunitySettingData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              votingStartTime: data.votingStartTime,
              votingEndTime: data.votingEndTime,
              votes: old.items[0].votes.map((vote: CommunityVote) => ({
                ...vote,
                votes: 0,
                lastResetTime: data.votingStartTime
              }))
            }]
          };
        });
        break;
        
      default:
        break;
    }
  } catch  {
    throw new Error('Error Community events')
  }
};