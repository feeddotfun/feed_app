import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IMeme, IMemeArenaSession } from "./database/types";
import { MemeArenaSessionData, MemeData } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ** Helpers
export function transformMeme(meme: IMeme): MemeData {
  return {
    id: meme._id.toString(),
    name: meme.name,
    ticker: meme.ticker,
    description: meme.description,
    image: meme.image,
    totalVotes: meme.totalVotes,
    isWinner: meme.isWinner,
    session: meme.session.toString(),
    memeProgramId: meme.memeProgramId,
    tokenMintAddress: meme.tokenMintAddress,
  };
}

export function transformSession(session: IMemeArenaSession): MemeArenaSessionData {
  return {
    id: session._id.toString(),
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    maxMemes: session.maxMemes,
    votingThreshold: session.votingThreshold,
    votingTimeLimit: session.votingTimeLimit,
    votingEndTime: session.votingEndTime,
    winnerMeme: session.winnerMeme?.toString(),
    nextSessionDelay: session.nextSessionDelay,
    nextSessionStartTime: session.nextSessionStartTime,    
    contributeEndTime: session.contributeEndTime,   
    totalContributions: session.totalContributions, 
    tokenMintAddress: session.tokenMintAddress,
  };
}