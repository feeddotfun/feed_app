'use client'

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wallet, Award, Loader2, Trophy } from "lucide-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { FilterType, useMyInvestments } from '@/lib/query/my-investments/hooks';
import { InvestmentCard } from './investment-card';
import { InvestmentData } from '@/types';
import { ConnectWalletMessage, InvestmentsPageSkeleton } from '../skeletons';


export default function MyInvestmentsPage() {
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const [filter, setFilter] = useState<FilterType>('waiting-claim');

  const { 
    investments, 
    isLoading,
    error, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    claimTokens
  } = useMyInvestments(publicKey?.toBase58() || '', filter);

  const handleClaim = async (investment: InvestmentData) => {
    if (!investment.tokenMintAddress || !investment.meme) {
      return;
    }

    try {
      await claimTokens.mutateAsync({
        investmentId: investment.id,
        mintAddress: investment.tokenMintAddress,
        memeUuid: investment.meme.memeProgramId,
        memeId: investment.meme.id,
      });
    } catch (error) {
      console.error('Claim error:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <InvestmentsPageSkeleton />;
  }

  const renderContent = () => {
    if (!connected) {
      return <ConnectWalletMessage title='Investments' />;
    }

    if (isLoading) {
      return <InvestmentsPageSkeleton/>
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          Error loading investments: {error.message}
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#99FF19]" />
            My Investments
          </h1>
          
          <div className="flex items-center gap-3">            
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <SelectTrigger className="w-[180px] bg-[#141716] border-none">
                <SelectValue>
                  {filter === 'waiting-claim' && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Waiting for Claim
                    </div>
                  )}
                  {filter === 'claimed' && (
                    <div className='flex items-center gap-2'>
                      <Award className='h-4 w-4'/> Claimed
                    </div>
                  )}
                  {filter === 'all' && (
                    <div className='flex -items-center gap-2'>
                      <Wallet className='h-4 w-4'/>All Investments
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting-claim">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Waiting for Claim
                  </div>
                </SelectItem>
                <SelectItem value="claimed">
                  <div className='flex items-center gap-2'>
                    <Award className='h-4 w-4'/>
                    Claimed
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className='flex items-center gap-2'>
                  <Wallet className="h-4 w-4" />                 
                  All Investments
                  </div>
                  </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
  
        <Separator className="bg-white/10" />
  
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#99FF19]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.map((investment) => (
                <InvestmentCard 
                  key={investment.id} 
                  investment={investment}
                  onClaim={handleClaim}
                  isClaimLoading={claimTokens.isLoading}
                  currentInvestmentId={claimTokens.currentInvestmentId}
                />
              ))}
            </div>
  
            {investments.length === 0 && (
              <div className="text-center py-12 text-white/60">
                {filter === 'waiting-claim' && "No investments waiting to be claimed"}
                {filter === 'claimed' && "No claimed investments"}
                {filter === 'all' && "No investments found"}
              </div>
            )}
  
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="border-[#99FF19]/20 text-[#99FF19] hover:bg-[#99FF19]/10"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading more...
                    </div>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
  
            {error && (
              <div className="text-center py-6 text-red-500">
                Error loading investments: {error}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return renderContent();
}