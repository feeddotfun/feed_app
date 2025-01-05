
import DashboardContent from "@/components/dashboard";
import PageContainer from "@/components/layout/page-container";
import { getDashboardStats } from "@/lib/actions/dashboard.action";
import { QueryKeys } from "@/lib/query/core/query-keys";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function DashboardPage() {
  const queryClient = new QueryClient();
  const queryKeys = new QueryKeys('dashboard');

  // Prefetch data on server
  const initialData = await getDashboardStats();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.all(),
    queryFn: () => ({
      items: [initialData],
      total: 1
    }),
  });  
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
        <PageContainer scrollable={true}>
            <DashboardContent/>
        </PageContainer>
    </HydrationBoundary>
  );
}