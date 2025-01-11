import React from 'react';
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { CopyAddress } from "@/components/ui/copy-address";
import { formatCreatedTime } from '@/lib/utils';

interface MemeCardProps {
  meme: {
    id: string;
    name: string;
    image: string;
    description: string;
    ticker: string;
    votes: number;
    date: string;
    mintAddress: string;
  };
}

const MemeCard: React.FC<MemeCardProps> = ({ meme }) => {
  const formatMarketCap = (value: any) => {
    return `$50K`;
  };

  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative bg-[#141716]/50 backdrop-blur-sm border-0 overflow-hidden">
        {/* Winner Badge */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-black text-xs font-semibold py-0.5 px-2 rounded-full">
          <Trophy className="w-3 h-3" />
          Winner
        </div>

        {/* Image Container with Blur Background */}
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={meme.image}
              alt=""
              fill
              className="object-cover blur-xl opacity-50 scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
          
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="relative w-full h-full transition-transform group-hover:scale-105">
              <Image
                src={meme.image}
                alt={meme.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Ticker */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg text-white/90">{meme.name}</h3>
            <div className="px-2 py-0.5 bg-[#99FF19]/10 text-[#99FF19] text-sm font-medium rounded">
              {meme.ticker}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/60 line-clamp-2">
            {meme.description}
          </p>

          {/* Mint Address */}
          <div className="pt-2 pb-1 border-t border-white/10">
            <CopyAddress 
              address={meme.mintAddress} 
              id={meme.id} 
              isCompact 
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 pt-2 border-t border-white/10">
            <div>
              <div className="text-sm text-white/40">Market Cap</div>
              <div className="font-medium text-white/90">
                {'0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/40">Votes</div>
              <div className="font-medium text-white/90">
                {meme.votes.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/40">Created</div>
              <div className="font-medium text-white/90">
                {formatCreatedTime(meme.date)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MemeCard;