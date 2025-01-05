import { createGenericQuery } from '../core/use-generic-query';
import { MemeArenaService } from './service';
import { ContributeMemeParams, CreateMemeParams, MemeArenaData, VoteMemeParams } from '@/types';

const memeArenaService = new MemeArenaService();
const useMemeArenaQuery = createGenericQuery<
  MemeArenaData,
  MemeArenaService,
  any
>(
  memeArenaService,
  'memeArena',
  { staleTime: 30000 }
);

export const useMemeArena = () => {
  const { useGetAll, useCustomAction } = useMemeArenaQuery();
  
  const items = useGetAll();

  const createMemeMutation = useCustomAction<CreateMemeParams, MemeArenaData>((params) => 
    memeArenaService.createMeme(params)
  );

  const voteMutation = useCustomAction<VoteMemeParams>((params) => 
    memeArenaService.voteMeme(params)
  );

  const contributeMutation = useCustomAction<ContributeMemeParams>((params) => 
    memeArenaService.contributeMeme(params)
  );

  return {
    isLoading: !items.data || items.isLoading,
    isError: items.isError,
    error: items.error,
    session: items.data?.items[0]?.session,
    memes: items.data?.items[0]?.memes || [],
    createMeme: createMemeMutation.mutateAsync,
    isCreating: createMemeMutation.isPending,
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
    contribute: contributeMutation.mutateAsync,
    isContributing: contributeMutation.isPending
  };
};