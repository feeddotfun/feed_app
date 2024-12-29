import Image from "next/image";
import { initializeSystem } from "@/lib/actions/meme-arena.action";
export default async function Home() {
  await initializeSystem();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        Main Content
      </main>
    </div>
  );
}