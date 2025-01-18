import AirdropFaucet from "@/components/airdrop-faucet";
import PageContainer from "@/components/layout/page-container";

export default function Page() {
    return (
        <PageContainer scrollable={true}>
            <AirdropFaucet/>
        </PageContainer>
    )
}