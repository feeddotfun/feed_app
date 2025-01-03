import { getAvailableNewsMemes } from "@/lib/actions/meme-news.action";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/query/core/query-keys';
import AINewsLab from '@/components/ai-news-lab';
import PageContainer from "@/components/layout/page-container";

export default async function NewsLabPage() {
  const queryClient = new QueryClient();
  const queryKeys = new QueryKeys('aiNewsLab');
  
  // Prefetch data on server
  const initialData = await getAvailableNewsMemes();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.all(),
    queryFn: () => ({ items: initialData, total: initialData.length }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <AINewsLab />
      </PageContainer>
    </HydrationBoundary>
  );
}