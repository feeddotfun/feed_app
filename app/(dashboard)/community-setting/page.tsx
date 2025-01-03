import CommunitySetting from "@/components/community-setting";
import { getSystemConfigAndVotes } from "@/lib/actions/community-setting.action";
import { QueryKeys } from "@/lib/query/core/query-keys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function CommunitySettingsPage() {
  const queryClient = new QueryClient();
  const queryKeys = new QueryKeys('communitySetting');

  // Prefetch data on server
  const initialData = await getSystemConfigAndVotes();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.all(),
    queryFn: () => ({
      items: [initialData],
      total: 1
    }),
  });  
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommunitySetting/>
    </HydrationBoundary>
  );
}