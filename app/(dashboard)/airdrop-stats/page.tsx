export const dynamic = 'force-dynamic';

import AirdropStats from "@/components/airdrop-stats";
import PageContainer from "@/components/layout/page-container";

export default async function AirdropPage() {

  return (
      <PageContainer scrollable={true}>
        <AirdropStats />
      </PageContainer>
  );
}