import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IMeme, IMemeArenaSession, IMemeContribution, IMemeNews } from "./database/types";
import { AINewsLabItem, MemeArenaSessionData, MemeContributionData, MemeData } from "@/types";
import BN from "bn.js";
import { formatDistanceToNow } from "date-fns";
import SSEManager from "./sse/sse-manager";
import { headers } from "next/headers";

const TOKEN_DECIMALS = 6;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function sendUpdate(type: string, data: Record<string, any>) {
  const sseManager = SSEManager.getInstance();
  return sseManager.broadcast(type, data);
}

export const formatPhaseString = (status: string) => {
  switch (status) {
    case 'Voting':
      return 'Voting';
    case 'LastVoting':
      return 'Final Voting';
    case 'Contributing':
      return 'Contributing';
    case 'TokenCreating':
      return 'Token Creating'
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
    createdAt: meme.createdAt.toISOString()
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
    contributorCount: session.contributorCount || 0,
    tokenMintAddress: session.tokenMintAddress,
    tx: session.tx || '',
    createdAt: session.createdAt.toISOString(),
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
    createdAt: contribution.createdAt.toISOString()
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

export const transformInvestment = (contribution: any) => ({
  id: contribution._id.toString(),
  amount: contribution.amount,
  createdAt: contribution.createdAt,
  status: contribution.session?.status || 'Contributing',
  tokenMintAddress: contribution.session?.tokenMintAddress,
  claimAvailableTime: contribution.session?.claimAvailableTime,
  isTokensClaimed: contribution.isTokensClaimed,
  estimatedTokens: calculateUserTokens(
    contribution.amount, 
    contribution.session.totalContributions,
    contribution.session.initialVaultTokens
  ),
  meme: {
    id: contribution.meme._id.toString(),
    name: contribution.meme.name,
    image: contribution.meme.image,
    ticker: contribution.meme.ticker,
    description: contribution.meme.description || '',
    memeProgramId: contribution.meme.memeProgramId
  },
  session: {
    totalFunds: contribution.session.totalContributions,
    status: contribution.session.status,
    claimAvailableTime: contribution.session.claimAvailableTime
  }
});

export async function getIpAddress(request: Request): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  // Cloudflare proxy
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  return (forwardedFor?.split(',')[0].trim()) || 
         realIp || 
         '127.0.0.1';
}

export async function getIpAddressWithHeader(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  const headersList = await headers();

  // Cloudflare proxy
  const cfConnectingIp = headersList.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  return (forwardedFor?.split(',')[0].trim()) || 
         realIp || 
         '127.0.0.1';
}

export const formatCreatedTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
    .replace('about ', '')
    .replace(' ago', '')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' minutes', 'm')
    .replace(' minute', 'm');
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(num);
};


// Solana Program Utils
export function uuidToMemeIdAndBuffer(uuid: string): { memeId: number[], buffer: Buffer } {
  const hexString = uuid.replace(/-/g, '');
  const buffer = Buffer.from(hexString, 'hex');
  const memeId = Array.from(buffer);
  return { memeId, buffer };
}

export const calculateWithSlippageBuy = (
  amount: BN,
  basisPoints: BN
): BN => {
  const slippage = amount.mul(basisPoints).div(new BN(10000));
  return amount.add(slippage);
};

export const calculateUserTokens = (
  contributionAmount: number,
  totalContributions: number,
  initialVaultTokens: number
): number => {
  if (!totalContributions || !initialVaultTokens) return 0;
  
  try {
    const adjustedVaultTokens = initialVaultTokens / Math.pow(10, TOKEN_DECIMALS);

    const userTokenAmount = (contributionAmount / totalContributions) * adjustedVaultTokens;
    return Math.floor(userTokenAmount);
  } catch  {
    return 0;
  }
};

const formatCompactNumber = (number: number): string => {
  try {
    if (number === 0) return '0';
    
    const absNum = Math.abs(number);
    
    if (absNum >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    
    if (absNum >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    
    return number.toString();
  } catch {
    return number.toString();
  }
}

export const formatTokenAmount = (amount: number, showDecimals: boolean = true): string => {
  try {
    if (!amount) return '0';
    
    const formatted = formatCompactNumber(amount);
    
    if (!showDecimals && /[KMB]$/.test(formatted)) {
      const numPart = parseFloat(formatted);
      return Math.floor(numPart) + formatted.slice(-1);
    }
    
    return formatted;
  } catch  {
    return amount.toString();
  }
};