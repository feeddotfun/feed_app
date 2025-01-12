'use client'

import { motion } from "framer-motion";
import { useDashboard } from "@/lib/query/dashboard/hooks";
import { useMemeArena } from "@/lib/query/meme-arena/hooks";
import { SessionStats } from "./session-stats";
import { DashboardStats } from "./dashboard-stats";
import { useSessionTimer } from "@/hooks/use-session-timer";
import ActivityChart from "./activity-chart";
import { TrendingMemes } from "./trending-memes";
import { DashboardSkeleton } from "../skeletons";

export default function DashboardContent() {
  const { stats, isLoading: dashboardLoading } = useDashboard();
  const { winners, topVoted } = stats?.trendingMemes || { winners: [], topVoted: [] };
  const { session, memes, isLoading: arenaLoading } = useMemeArena();
  const { remainingTime, contributeEndTime, nextSessionTime } = useSessionTimer(session);

  const isLoading = dashboardLoading || arenaLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6">
      <DashboardStats/>
      {session && (
        <motion.div variants={item}>
          <SessionStats
            status={session.status}
            remainingTime={remainingTime}
            contributeEndTime={contributeEndTime}
            nextSessionTime={nextSessionTime}
            memeSlots={{
              current: memes?.length || 0,
              max: session.maxMemes
            }}
            contributorCount={session.contributorCount}
            totalContributions={session.totalContributions}
            totalVotes={memes?.reduce((sum, meme) => sum + (meme.totalVotes || 0), 0) || 0}
          />
        </motion.div>
      )}
      <ActivityChart data={stats?.activity}/>
      <TrendingMemes winners={winners} topVoted={topVoted} />
    </div>
  );
}