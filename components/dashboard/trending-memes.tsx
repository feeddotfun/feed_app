import React, { useState } from 'react';
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Trophy, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CopyAddress } from '../ui/copy-address';

interface MemeData {
  id: string;
  name: string;
  image: string;
  ticker: string;
  votes: number;
  marketCap?: number;
  date?: string;
  mintAddress?: string;
}

interface TrendingMemesProps {
  winners: MemeData[];
  topVoted: MemeData[];
}

const formatMarketCap = (marketCap: number) => {
  if (marketCap >= 1000000) {
    return `${(marketCap / 1000000).toFixed(2)}M`;
  }
  if (marketCap >= 1000) {
    return `${(marketCap / 1000).toFixed(2)}K`;
  }
  return `${marketCap.toFixed(2)}`;
};

const MemeCard = ({ meme, rank, isWinner }: { 
  meme: MemeData; 
  rank?: number;
  isWinner?: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-all",
        rank === 1 && !isWinner && "bg-[#99FF19]/5 hover:bg-[#99FF19]/10"
      )}
    >
      {/* Image Container */}
      <div className="relative w-full sm:w-28 aspect-square sm:h-28 rounded-md overflow-hidden bg-muted">
        <div className="absolute inset-0">
          <Image
            src={meme.image}
            alt=""
            fill
            className="object-cover blur-xl opacity-50 scale-110"
            sizes="(max-width: 640px) 100vw, 120px"
            priority
          />
        </div>
        
        <div className={cn(
          "relative h-full transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}>
          <Image
            src={meme.image}
            alt={meme.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 120px"
            onLoad={() => setImageLoaded(true)}
            priority
          />
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold break-words line-clamp-2 text-sm">
              {meme.name}
            </h3>
            <Badge 
              variant="outline" 
              className="shrink-0 bg-black/20"
            >
              {meme.ticker}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-auto">
          <div className="flex items-center gap-1.5 text-[#99FF19]">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-semibold">{meme.votes.toLocaleString()}</span>
          </div>
          {isWinner && meme.marketCap && (
            <div className="flex items-center gap-1.5 text-[#99FF19]">
              market cap:
              <span className="font-semibold">{formatMarketCap(meme.marketCap)}</span>
            </div>
          )}
        </div>

        {/* Mint Address for Winners */}
        {meme.mintAddress && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <CopyAddress address={meme.mintAddress} id={meme.id} isCompact />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TrendingMemes = ({ winners, topVoted }: TrendingMemesProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Winners Section */}
      {winners.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#99FF19]" />
            <h2 className="font-semibold">Latest Winning Memes</h2>
          </div>
          <div className="space-y-3">
            {winners.map((meme) => (
              <MemeCard key={meme.id} meme={meme} isWinner />
            ))}
          </div>
        </div>
      )}

      {/* Top Voted Section */}
      {topVoted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-[#99FF19]" />
            <h2 className="font-semibold">Top Voted Memes</h2>
          </div>
          <div className="space-y-3">
            {topVoted.map((meme, index) => (
              <MemeCard 
                key={meme.id} 
                meme={meme} 
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingMemes;