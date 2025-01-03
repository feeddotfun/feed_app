import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IMeme, IMemeArenaSession, IMemeContribution, IMemeNews } from "./database/types";
import { AINewsLabItem, MemeArenaSessionData, MemeContributionData, MemeData } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatPhaseString = (status: string) => {
  switch (status) {
    case 'Voting':
      return 'Voting';
    case 'LastVoting':
      return 'Last Voting';
    case 'Contributing':
      return 'Contributing';
    case 'Completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
}

export function convertLamportsToSol(lamports: number): number {
  const LAMPORTS_PER_SOL = 1_000_000_000;
  return lamports / LAMPORTS_PER_SOL;
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
    isFromNews: meme.isFromNews,
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

export function transformContribution(contribution: IMemeContribution): MemeContributionData {
  return {
    id: contribution._id.toString(),
    meme: contribution.meme.toString(),
    session: contribution.session.toString(),
    contributor: contribution.contributor,
    contributorIpAddress: contribution.contributorIpAddress,
    amount: contribution.amount,
  };
}

export const transformNewsItem = (item: IMemeNews): AINewsLabItem => {
  return {
    id: item._id.toString(),
    news: item.news,
    meme: item.meme,
    ticker: item.ticker,
    name: item.name,
    image: item.image,
    timestamp: item.createdAt.toISOString(),
    createdAt: item.createdAt.toISOString()
  };
};

export const transformNewsItems = (items: IMemeNews[]): AINewsLabItem[] => {
  return items.map(transformNewsItem);
};