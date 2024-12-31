import { Icons } from "@/components/ui/icon";
import { QueryClient } from "@tanstack/react-query";

export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
}

export type SessionStatus = 'Voting' | 'LastVoting' | 'Contributing' | 'Completed';

export const SYSTEM_CONFIG_OPTIONS = {
    minContributionSol: [0.1, 0.3, 0.5, 1.0],
    maxContributionSol: [0.5, 1.0, 1.5, 2.0],
    votingTimeLimit: [1, 3, 5, 10].map(min => min * 60 * 1000),
    nextSessionDelay: [1, 5, 15, 30].map(min => min * 60 * 1000),
    contributeFundingLimit: [1, 5, 7, 10].map(min => min * 60 * 1000)
  } as const;

export interface MemeData {
    id: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
    totalVotes: number;
    isWinner: boolean;
    session: string;
    memeProgramId: string;
    isFromNews?: boolean;
    tokenMintAddress: string;
}

export interface MemeArenaSessionData {
    id: string;
    startTime: Date;
    endTime?: Date;
    status: SessionStatus;
    maxMemes: number;
    votingThreshold: number;
    votingTimeLimit: number;
    votingEndTime?: Date;
    winnerMeme?: string;
    nextSessionDelay: number;
    nextSessionStartTime?: Date;
    contributeEndTime?: Date;
    totalContributions: number;
    tokenMintAddress?: string;
}

export interface MemeArenaData {
    session: MemeArenaSessionData;
    memes: MemeData[];
}

export interface MemeContributionData {
    id: string;
    meme: string;
    session: string;
    contributor: string;
    contributorIpAddress: string;
    amount: number;  
}

export interface SystemConfigVoteData {
    settingKey: string;
    optionValue: number;
    votes: number;
}




export * from './community-setting'




// DTOs
export interface CreateMemeDto {
    session: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
}

export interface CreateMemeVoteDto {
    session: string;
    meme: string;
    voter: string;
    voterIpAddress: string;
}

export interface CreateMemeContributionDto {
    session: string;
    meme: string;
    contributor: string;
    contributorIpAddress: string;
    amount: number;
}

export interface CheckContributionEligibilityDto {
    memeId: string;
    contributor: string;
}

export interface CreateContributeDto {
    memeProgramId: string;
    amount: string;
    contributor: string;
}

export interface CreateSystemSettingVoteDto {
    voter: string;
    voterIpAddress: string;
    settingKey: string;
    selectedValue: number;
  }