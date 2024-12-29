import { useQuery } from '@tanstack/react-query';
import { MemeArenaData } from "@/types";
import { sampleMemeArenaData } from '@/lib/sample-data';

// Query Keys
export const queryKeys = {
  memeSession: ['meme-session'] as const,
};

// Test mock delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API fetcher
const fetchMemeSession = async (): Promise<MemeArenaData> => {
  await delay(1000);
  return sampleMemeArenaData;
};

// Query Hook
export const useMemeSession = (initialData?: MemeArenaData) => {
  return useQuery({
    queryKey: queryKeys.memeSession,
    queryFn: fetchMemeSession,
    initialData,
    refetchInterval: 30000, // 30 seconds
  });
};