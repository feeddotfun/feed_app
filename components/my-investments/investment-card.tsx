import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CopyAddress } from "@/components/ui/copy-address";
import { InvestmentData } from '@/types';
import { useClaimTimer } from '@/hooks/use-claim-timer';
import { formatCreatedTime, formatTokenAmount } from '@/lib/utils';

interface InvestmentCardProps {
  investment: InvestmentData & { calculatedTokenAmount?: number };
  onClaim: (investment: InvestmentData) => void;
  isClaimLoading: boolean;
  currentInvestmentId: string | undefined;
}

export const InvestmentCard = ({ investment, onClaim, isClaimLoading, currentInvestmentId }: InvestmentCardProps) => {
  const countdown = useClaimTimer(investment.claimAvailableTime || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="group relative bg-[#141716]/50 backdrop-blur-sm border-0 overflow-hidden">
        {countdown.isExpired && investment.status === 'Completed' && !investment.isTokensClaimed && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-black text-xs font-semibold py-0.5 px-2 rounded-full">
            <Trophy className="w-3 h-3" />
            Ready to Claim
          </div>
        )}

        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={investment.meme.image}
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
                src={investment.meme.image}
                alt={investment.meme.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg text-white/90">{investment.meme.name}</h3>
            <div className="px-2 py-0.5 bg-[#99FF19]/10 text-[#99FF19] text-sm font-medium rounded">
              {investment.meme.ticker}
            </div>
          </div>

          <p className="text-sm text-white/60 line-clamp-2">
            {investment.meme.description}
          </p>

          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#99FF19]" />
              <span className="text-sm text-white/60">Market Cap:</span>
            </div>
            <span className="font-medium text-[#99FF19]">-</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-white/40">Est. Tokens</div>
              <div className="font-medium text-[#99FF19]">
                {formatTokenAmount(investment.estimatedTokens || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/40">Status</div>
              <div className="font-medium text-white/90 capitalize">
                {investment.status.toLowerCase()}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/40">Created</div>
              <div className="font-medium text-white/90">
                {formatCreatedTime(investment.createdAt)}
              </div>
            </div>
          </div>

          {investment.tokenMintAddress && (
            <div className="pt-2 pb-1 border-t border-white/10">
              <CopyAddress 
                address={investment.tokenMintAddress}
                id={investment.id}
                isCompact
              />
            </div>
          )}

          {investment.status === 'Completed' && !investment.isTokensClaimed && (
            <div className="pt-3">
              {countdown.isExpired ? (
                <Button 
                  className="w-full bg-[#99FF19] hover:bg-[#99FF19]/90 text-black"
                  onClick={() => onClaim(investment)}
                  disabled={isClaimLoading && currentInvestmentId === investment.id}
                >
                   {(isClaimLoading && currentInvestmentId === investment.id) ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming...
                    </div>
                    ) : (
                      'Claim Tokens'
                    )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg border border-[#99FF19]/20">
                  <Clock className="w-5 h-5 text-[#99FF19]" />
                  <span className="text-[#99FF19] font-medium">Available in {countdown.formatted}</span>
                </div>
              )}
            </div>
          )}

          {investment.isTokensClaimed && (
            <div className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg text-white/60">
              <Trophy className="w-4 h-4" />
              Tokens Claimed
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};