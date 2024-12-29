'use client';

import { useMemo } from "react";
import { useSessionTiming } from "@/hooks/use-session-timing";
import { useMemeArena } from "@/lib/queries/meme-queries";
import { useWallet } from "@solana/wallet-adapter-react";
import { Alert, AlertDescription } from "../ui/alert";
import { MemeCardSkeleton, MemeGridSkeleton } from "../skeletons";
import { Badge } from "../ui/badge";
import { formatPhaseString, formatTime } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import MemeCard from "./meme-card";
import AddMeme from "./add-meme";
import WinnerMeme from "./winner-meme";



const MemeArena = () => {
    const { connected, publicKey, signTransaction} = useWallet();
    const { 
        data, 
        isLoading, 
        isError, 
        error 
      } = useMemeArena();

    const winnerMeme = useMemo(() => {
    if (!data?.memes) return null;
    return data.memes.find(meme => meme.isWinner) || 
            (['Contributing', 'Completed'].includes(data.session.status) 
            ? data.memes.sort((a, b) => b.totalVotes - a.totalVotes)[0] 
            : null);
    }, [data]);

    const { remainingTime, nextSessionTime } = useSessionTiming(data?.session);
    const sortedMemes = useMemo(() => {
        if (!data?.memes) return [];
        return [...data.memes].sort((a, b) => b.totalVotes - a.totalVotes);
      }, [data?.memes]);

    if (isError) {
        return (
            <Alert variant="destructive" className="max-w-6xl mx-auto">
            <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load meme arena data'}
            </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="py-4 space-y-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Meme Arena</h1>
                <div className="flex justify-between items-center mb-4">
                    {isLoading ? (
                        <>
                            <MemeCardSkeleton />
                            <MemeCardSkeleton />
                        </>
                    ) : data ? (
                    <>
                        <Badge variant="secondary" className="text-sm py-1 px-2">
                            {formatPhaseString(data.session.status)}
                        </Badge>
                        <div className="text-sm font-semibold">
                            {data.session.status === 'Voting' ? (
                                <span>Meme Slots: {data.memes.length}/{data.session.maxMemes}</span>
                            ) : data.session.status === 'LastVoting' ? (
                                <span>Time Remaining: {remainingTime !== null ? formatTime(remainingTime) : 'N/A'}</span>
                            ) : ['Contributing', 'Completed'].includes(data.session.status) ? (
                                <span>Next session starts in: {nextSessionTime !== null ? formatTime(nextSessionTime) : 'N/A'}</span>
                            ) : null}
                        </div>
                    </>
                ) : null}
                </div>

                <Separator className="shadow mb-6"/>

                {/* Winner Meme Section */}
                {winnerMeme && data && (
                <WinnerMeme
                    meme={winnerMeme}
                    session={data.session}
                    connected={connected}
                    publicKey={publicKey?.toString()}
                    signTransaction={signTransaction}
                />
                )}
                {isLoading ? (
                    <MemeGridSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <AnimatePresence mode="popLayout">
                        {sortedMemes.map((meme) => (
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
                                sessionId={data?.session.id!}
                                walletAddress={'walletAddress'}
                                walletConnected={connected}
                            />
                            </motion.div>
                        ))}
                        {data && 
                            data.memes.length < data.session.maxMemes && 
                            data.session.status !== 'Completed' && 
                            connected && (
                                <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                >
                                <AddMeme sessionId={data.session.id} />
                                </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )
                
                }
            </div>
        </div>
    )
}

export default MemeArena;
