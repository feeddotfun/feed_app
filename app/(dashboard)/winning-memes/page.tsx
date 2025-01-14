import PageContainer from "@/components/layout/page-container";
import WinningMemesPage from "@/components/winning-memes";
import { getWinningMemes } from '@/lib/actions/winning-memes.action';
import { QueryKeys } from "@/lib/query/core/query-keys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function WinningMemes() {
  const queryClient = new QueryClient();
  const queryKeys = new QueryKeys('winningMemes');
  const defaultSort = 'votes'

  await queryClient.prefetchInfiniteQuery({
    queryKey: [...queryKeys.all(), 'infinite', { sortBy: defaultSort }],
    queryFn: ({ pageParam = 1 }) => getWinningMemes(pageParam, defaultSort),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer scrollable={true}>
        <WinningMemesPage/>
      </PageContainer>
    </HydrationBoundary>
  );
}