import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';
import { MemeData, MemeArenaSessionData } from "@/types";
import { useWinnerMeme } from '@/hooks/use-winner-meme';
import { ContributionForm } from './contribution-form';
import { MemeDetails } from './winner-meme-detail';
import { TokenCreation } from './token-creation';
import { CompletedMeme } from './completed-meme';
import { Transaction } from '@solana/web3.js';

interface SystemConfig {
  maxContributionSol: number;
  minContributionSol: number;
}

interface WinnerMemeProps {
  meme: MemeData;
  session: MemeArenaSessionData;
  connected: boolean;
  publicKey?: string;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
  systemConfig: SystemConfig;
}

export default function WinnerMeme({
  meme,
  session,
  connected,
  publicKey,
  signTransaction,
  systemConfig
}: WinnerMemeProps) {
  const {
    isVisible,
    remainingTime,
    isEligible,
    isContributing,
    handleContribute,
    purchaseAmount,
    setPurchaseAmount
  } = useWinnerMeme(meme, session, systemConfig.maxContributionSol, publicKey, signTransaction);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[95%] sm:max-w-xl mx-auto my-4 px-2 sm:px-0"
      >
        <Card className="border-2 sm:border-4 border-primary shadow-lg sm:shadow-2xl">
          <CardHeader className="text-center py-2 sm:py-4 bg-primary text-primary-foreground">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center space-x-2">
              <Trophy size={24} className="sm:w-6 sm:h-6" />
              <span>Winner Meme!</span>
              <Trophy size={24} className="sm:w-6 sm:h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-4 sm:pt-6 px-2 sm:px-4">
            {session.status === 'TokenCreating' ? (
              <TokenCreation />
            ) : (
              <>
                <MemeDetails 
                  meme={meme} 
                  remainingTime={remainingTime} 
                  session={session} 
                />
                {session.status === 'Contributing' && (
                  <ContributionForm 
                    isEligible={isEligible!}
                    minContributionSol={systemConfig.minContributionSol}
                    maxContributionSol={systemConfig.maxContributionSol}                   
                    isContributing={isContributing}
                    remainingContributions={session.remainingContributions}
                    handleContribute={handleContribute}
                    purchaseAmount={purchaseAmount}
                    setPurchaseAmount={setPurchaseAmount}
                    connected={connected}
                  />
                )}
                {session.status === 'Completed' && session.tokenMintAddress && (
                  <CompletedMeme session={session} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}