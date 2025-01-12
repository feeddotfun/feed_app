'use client'
import { useCallback, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMemeArena } from "@/lib/query/meme-arena/hooks";
import { MemeArenaSkeleton } from "../skeletons";
import MemeCard from "./meme-card";
import { formatPhaseString, formatTime } from "@/lib/utils";

import { v4 as uuidv4 } from 'uuid';
import AddMeme from "./add-meme";
import { useSessionTimer } from "@/hooks/use-session-timer";
import WinnerMeme from "./winner-meme";
import { TokenCreation } from "./token-creation";

interface MemeArenaProps {
  systemConfig: SystemConfig;
}

interface SystemConfig {
  maxContributionSol: number;
  minContributionSol: number;
}

export default function MemeArena({ systemConfig }: MemeArenaProps) {
  const [votingMemeIds, setVotingMemeIds] = useState<string[]>([]);
  const { connected, publicKey, signTransaction } = useWallet();
  const { 
    memes, 
    session, 
    isLoading, 
    isError, 
    error,
    vote,
    createMeme,
    isCreating,
  } = useMemeArena();

  const memoizedData = useMemo(() => {
    if (!session) {
      return { 
        shouldShowVoting: false,
        shouldShowAddMeme: false, 
        winnerMeme: null,
        sortedMemes: [] 
      };
    }
  
    const winner = memes.find(meme => meme.isWinner);
    const isContributingPhase = ['Contributing', 'Completed', 'TokenCreating'].includes(session.status);
    const isCompletedWithNextSession = session.status === 'Completed' && session.nextSessionStartTime;
    
    const shouldShowAddMeme = session.status === 'Voting' && (!memes || memes.length < session.maxMemes);

    const shouldShowVoting = !isContributingPhase && !isCompletedWithNextSession;
    
    const sortedMemes = [...memes].sort((a, b) => b.totalVotes - a.totalVotes);
    
    return {
      shouldShowVoting,
      shouldShowAddMeme,
      winnerMeme: winner || (isContributingPhase ? sortedMemes[0] : null),
      sortedMemes
    };
  }, [memes, session]);

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-6xl mx-auto">
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load meme arena data'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !memes || !session) {
    return <MemeArenaSkeleton />;
  }

  const { shouldShowVoting, shouldShowAddMeme, winnerMeme, sortedMemes } = memoizedData;
  const { remainingTime, contributeEndTime, nextSessionTime } = useSessionTimer(session);

  const handleVote = useCallback(async (memeId: string) => {
    if (!session?.id) return;
    
    try {
      setVotingMemeIds(prev => [...prev, memeId])
      await vote({
        session: session.id,
        meme: memeId,
        voter: uuidv4(),
        voterIpAddress: uuidv4()
      });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
    finally {
      setVotingMemeIds(prev => prev.filter(id => id !== memeId));
    }
  }, [session?.id, vote]);

  const handleCreateMeme = useCallback(async ( name: string, ticker: string, description: string, image: string) => {
    if (!session?.id) return;
    
    try {
      await createMeme({
        session: session.id,
        name,
        ticker,
        description,
        image
      })
    }
    catch (error) {
      console.log('Failed to create:', error)
    }

  }, [session?.id, createMeme]) 

    
  
  return (
    <div className="py-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Meme Arena</h1>
        
        <div className="flex justify-between items-center mb-4">
          <Badge variant='default' className="text-sm py-1 px-2">
            {formatPhaseString(session.status)}
          </Badge>
          <div className="text-sm font-semibold">
            {session.status === 'Voting' && (
              <span>Meme Slots: {memes.length}/{session.maxMemes}</span>
            )}
            {session.status === 'LastVoting' && remainingTime !== null && (
              <span>Time Remaining: {formatTime(remainingTime)}</span>
            )}
            {session.status === 'Contributing' && contributeEndTime !== null && (  
              <span>Contributing ends in: {formatTime(contributeEndTime)}</span>
            )}
            {session.status === 'Completed' && nextSessionTime !== null && (
              <span>Next session in: {formatTime(nextSessionTime)}</span>
            )}
            </div>
        </div>

        <Separator className="shadow mb-6"/>
        
        {session.status === 'TokenCreating' && <TokenCreation/>}
        
        {winnerMeme && ['Contributing', 'Completed'].includes(session.status) && (
          <WinnerMeme
            meme={winnerMeme}
            session={session}
            connected={connected}
            publicKey={publicKey?.toString()}
            signTransaction={signTransaction}
            systemConfig={systemConfig}
            // contributeEndTime={contributeEndTime}
            // nextSessionTime={nextSessionTime}
          />
        )}

        {shouldShowVoting && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {shouldShowVoting && sortedMemes.map((meme) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <MemeCard
                  meme={meme}
                  walletConnected={connected}
                  onVote={handleVote}
                  isVoting={votingMemeIds.includes(meme.id)}
                />
              </motion.div>
            ))}
            {connected  && shouldShowAddMeme && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AddMeme 
                  sessionId={session.id}
                  onCreate={handleCreateMeme}
                  isCreating={isCreating}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      </div>
    </div>
  );
}
