import { getAvailableNewsMemes } from "@/lib/actions/meme-news.action";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query/core/query-keys';
import AINewsLab from '@/components/ai-news-lab';
import PageContainer from "@/components/layout/page-container";

export default async function NewsLabPage() {
  const queryClient = new QueryClient();
  const queryKeys = new QueryKeys('aiNewsLab');
  
  // Prefetch first page of data on server
  const initialData = await getAvailableNewsMemes(1);
  await queryClient.prefetchInfiniteQuery({
    queryKey: [...queryKeys.all(), 'infinite'],
    queryFn: () => initialData,
    initialPageParam: 1,
    getNextPageParam: (lastPage: { hasMore: any; }, pages: string | any[]) => {
      if (!lastPage.hasMore) return undefined;
      return pages.length + 1;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer scrollable={true}>
        <AINewsLab />
      </PageContainer>
    </HydrationBoundary>
  );
}