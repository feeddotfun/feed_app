import Image from "next/image";
import { initializeSystem } from "@/lib/actions/meme-arena.action";
import PageContainer from "@/components/layout/page-container";
export default async function Home() {
  return (
    <PageContainer >
        <div>Main Content</div>
    </PageContainer>
  );
}