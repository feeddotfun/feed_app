import { QueryClient } from '@tanstack/react-query';
import { BaseResponse, MemeArenaData } from '@/types';
import { QueryKeys } from '../core/query-keys';

const queryKeys = new QueryKeys('memeArena');

export const handleMemeArenaEvents = (data: any, queryClient: QueryClient) => {
  try {     
    switch (data.type) {
      case 'new-meme':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          return {
            ...old,
            items: [{
              ...old.items[0],
              memes: [...old.items[0].memes, data.meme]
            }]
          };
        });
        break;  
            
      case 'new-session':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old) return old;
          return {
            ...old,
            items: [{
              id: data.session.id,
              createdAt: new Date().toISOString(),
              session: data.session,
              memes: []
            }]
          };
        });
        break;  

      case 'meme-vote-update':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              memes: old.items[0].memes.map(meme => 
                meme.id === data.meme.id ? data.meme : meme
              )
            }]
          };
        });
        break;
        
      case 'voting-threshold-reached':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              session: {
                ...old.items[0].session,
                status: 'LastVoting',
                votingEndTime: data.votingEndTime
              },
              memes: data.memes || old.items[0].memes
            }]
          };
        });
        break;

      case 'contributing-started':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;

          const winnerMeme = {
            ...data.meme,
            isWinner: true
          };
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              session: {
                ...old.items[0].session,
                status: 'Contributing',
                winnerMeme: winnerMeme.id,
                contributeEndTime: data.session.contributeEndTime,
                nextSessionStartTime: data.session.nextSessionStartTime,
                totalContributions: 0
              },
              memes: [winnerMeme]
            }]
          };
        });
        break;

      case 'token-creation-started':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;

          const winnerMeme = {
            ...data.meme,
            isWinner: true
          };
          
          return {
            ...old,
            items: [{
              ...old.items[0],
              session: {
                ...old.items[0].session,
                status: 'TokenCreating',
                winnerMeme: winnerMeme.id
              }
            }]
          };
        });
        break;

      case 'new-contribution':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;        
          return {
            ...old,
            items: [{
              ...old.items[0],
              session: {
                ...old.items[0].session,
                totalContributions: data.session.totalContributions,
                contributorCount: data.session.contributorCount
              }
            }]
          };
        });
        break;

      case 'contributing-ended':
        queryClient.setQueryData<BaseResponse<MemeArenaData>>(queryKeys.all(), (old) => {
          if (!old?.items[0]) return old;
          
          const winnerMeme = old.items[0].memes[0];          
          return {
            ...old,
            items: [{
              ...old.items[0],
              session: {
                ...data.session,
                status: 'Completed',
                nextSessionStartTime: data.session.nextSessionStartTime,
                winnerMeme: winnerMeme?.id,
              },
              memes: winnerMeme ? [winnerMeme] : []
            }]
          };
        });
        break;

      default:
        queryClient.invalidateQueries({ queryKey: queryKeys.all() });
        break;
    }
  } catch (error) {
    console.error('Error handling meme arena event:', error);
  }
};