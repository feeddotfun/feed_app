export const dynamic = 'force-dynamic';

import MemeArena from "@/components/meme-arena";
import { getActiveSessionMemes, initializeSystem } from "@/lib/actions/meme-arena.action";
import { QueryKeys } from "@/lib/query/core/query-keys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import { getSystemConfig } from "@/lib/actions/community-setting.action";

export default async function MemeArenaPage() {
  const queryClient = new QueryClient();
  const memeArenaKeys = new QueryKeys('memeArena');
  //await initializeSystem()
  // Get initial data for both meme arena and config
  const [memeArenaData, configData] = await Promise.all([
    getActiveSessionMemes(),
    getSystemConfig()
  ]);

  // Prefetch meme arena data
  await queryClient.prefetchQuery({
    queryKey: memeArenaKeys.all(),
    queryFn: () => ({
      items: [memeArenaData],
      total: 1
    }),
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
       <PageContainer>
          <MemeArena systemConfig={configData} />
        </PageContainer>
    </HydrationBoundary>
  );
}