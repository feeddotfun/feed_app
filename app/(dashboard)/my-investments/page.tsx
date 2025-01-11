'use client'

import PageContainer from "@/components/layout/page-container";
import MyInvestmentsPage from "@/components/my-investments";

export default function Page() {
  return(
    <PageContainer scrollable={true}>
      <MyInvestmentsPage/>
    </PageContainer>
  )
}