import { QueryClient } from '@tanstack/react-query';
import { BaseResponse } from '@/types';
import { QueryKeys } from '../core/query-keys';
import { CommunitySettingData } from '@/types';

const queryKeys = new QueryKeys('communitySetting');

export const handleCommunitySettingEvents = (event: MessageEvent, queryClient: QueryClient) => {
  try {     
    const data = JSON.parse(event.data);    

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
        
      default:
        break;
    }
  } catch (error) {
    console.error('Error handling community setting event:', error);
  }
};