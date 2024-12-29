import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemeArenaData, CreateMemeDto, CreateMemeVoteDto, MemeData } from "@/types";

// Query Keys
export const queryKeys = {
  memeArena: ['meme-arena'] as const,
  memes: ['memes'] as const,
};

// API functions
const fetchMemeArena = async (): Promise<MemeArenaData> => {
  const response = await fetch('/api/meme-arena/session');
  if (!response.ok) {
    throw new Error('Failed to fetch meme arena data');
  }
  return response.json();
};

const voteMeme = async (data: CreateMemeVoteDto): Promise<MemeData> => {
  const response = await fetch('/api/meme-arena/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to vote');
  }

  return response.json();
};


// Query Hooks
export const useMemeArena = (initialData?: MemeArenaData) => {
  return useQuery({
    queryKey: queryKeys.memeArena,
    queryFn: fetchMemeArena,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
};

// Mutation Hooks
export const useCreateMeme = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMemeDto) => {
      const response = await fetch('/api/meme-arena/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create meme');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meme-arena'] });
    },
  });
};

export const useVoteMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteMeme,
    onMutate: async (newVote) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.memeArena });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<MemeArenaData>(queryKeys.memeArena);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<MemeArenaData>(queryKeys.memeArena, {
          ...previousData,
          memes: previousData.memes.map((meme) =>
            meme.id === newVote.meme
              ? { ...meme, totalVotes: meme.totalVotes + 1 }
              : meme
          ),
        });
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.memeArena, context.previousData);
      }
      console.error('Vote error:', err);
    },
  });
};

// SSE Event Handler
export const handleSSEEvent = (queryClient: any, event: MessageEvent) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'new-meme':
      case 'vote-update':
        queryClient.setQueryData(queryKeys.memeArena, (old: MemeArenaData) => ({
          ...old,
          memes: old.memes.map(meme => 
            meme.id === data.meme.id ? data.meme : meme
          )
        }));
        break;
    case 'session-update':
      queryClient.setQueryData(queryKeys.memeArena, (old: MemeArenaData) => {
        if (!old) return old;
        return {
          ...old,
          memes: data.meme ? 
            [...old.memes.filter(m => m.id !== data.meme.id), data.meme] 
            : old.memes,
          session: data.session || old.session,
        };
      });
      
    default:
      queryClient.invalidateQueries({ queryKey: queryKeys.memeArena });
  }
};