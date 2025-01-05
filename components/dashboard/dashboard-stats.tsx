'use client'

import { Trophy, ImagePlus, Crown, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/ui/stats-card";
import { useDashboard } from "@/lib/query/dashboard/hooks";

export const DashboardStats = () => {
  const { stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[#141716] animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <StatsCard
          title="Trending Meme"
          value={stats?.trendingMeme?.name || "No trending memes"}
          icon={Trophy}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatsCard
          title="Total Memes"
          value={stats?.totalMemes || 0}
          icon={ImagePlus}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatsCard
          title="Total Winner Memes"
          value={stats?.totalWinners || 0}
          icon={Crown}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatsCard
          title="Total Votes"
          value={stats?.totalVotes || 0}
          icon={ThumbsUp}
        />
      </motion.div>
    </motion.div>
  );
};