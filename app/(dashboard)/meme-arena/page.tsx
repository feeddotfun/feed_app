// ** Components
import PageContainer from "@/components/layout/page-container";
import MemeArena from "@/components/meme-arena";


export default async function Page() {   
    return (
        <PageContainer scrollable={true}>
            <MemeArena/>
      </PageContainer>
    );
 }
