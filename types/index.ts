import { Icons } from "@/components/ui/icon";

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