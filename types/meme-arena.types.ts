import { BaseEntity } from "./base.types";

export type SessionStatus = 'Voting' | 'LastVoting' | 'Contributing' | 'TokenCreating' | 'Completed';

export interface MemeData extends BaseEntity {
    name: string;
    ticker: string;
    description: string;
    image: string;
    totalVotes: number;
    isWinner: boolean;
    session: string;
    memeProgramId: string;
    isFromNews: boolean;
    tokenMintAddress: string;
}

export interface MemeArenaSessionData extends BaseEntity {
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
    contributorCount: number;
    tokenMintAddress?: string;   
    tx?: string; 
    isTokenCreating?: boolean;
}

export interface MemeArenaData extends BaseEntity {
    session: MemeArenaSessionData;
    memes: MemeData[];
}

export interface MemeContributionData extends BaseEntity {
    meme: string;
    session: string;
    contributor: string;
    contributorIpAddress: string;
    amount: number;  
}

// DTOs
export interface MemeArenaParams {
    session?: string;
    status?: SessionStatus;
}

export interface CreateMemeParams {
    session: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
    isFromNews?: boolean;
}

export interface VoteMemeParams {
    session: string;
    meme: string;
    voter: string;
    voterIpAddress: string;
}

export interface ContributeMemeParams {
    session: string;
    meme: string;
    contributor: string;
    //contributorIpAddress: string;
    amount: number;
}

export interface CreateContributeDto {
    memeProgramId: string;
    amount: string;
    contributor: string;
}

export interface CheckContributionEligibilityParams {
    memeId: string;
    contributor: string;
}
// export interface MemeData {
//     id: string;
//     name: string;
//     ticker: string;
//     description: string;
//     image: string;
//     totalVotes: number;
//     isWinner: boolean;
//     session: string;
//     memeProgramId: string;
//     isFromNews: boolean;
//     tokenMintAddress: string;
//     createdAt: string;
// }


// export interface MemeDataItem {
//     id: string;
//     name: string;
//     ticker: string;
//     description: string;
//     image: string;
//     totalVotes: number;
//     isWinner: boolean;
//     session: string;
//     memeProgramId: string;
//     isFromNews: boolean;
//     tokenMintAddress: string;
//     createdAt: string;
// }


// export interface MemeArenaSessionData {
//     id: string;
//     startTime: Date;
//     endTime?: Date;
//     status: SessionStatus;
//     maxMemes: number;
//     votingThreshold: number;
//     votingTimeLimit: number;
//     votingEndTime?: Date;
//     winnerMeme?: string;
//     nextSessionDelay: number;
//     nextSessionStartTime?: Date;
//     contributeEndTime?: Date;
//     totalContributions: number;
//     tokenMintAddress?: string;
// }

// export interface MemeArenaData extends BaseEntity {
//     session: MemeArenaSessionData;
//     memes: MemeData[];
// }

// // DTOs
// export interface CreateMemeDto {
//     session: string;
//     name: string;
//     ticker: string;
//     description: string;
//     image: string;
//     isFromNews?: boolean;
// }

// export interface CreateMemeVoteDto {
//     session: string;
//     meme: string;
//     voter: string;
//     voterIpAddress: string;
// }

// export type SessionStatus = 'Voting' | 'LastVoting' | 'Contributing' | 'Completed';

// export interface MemeData {
//     id: string;
//     name: string;
//     ticker: string;
//     description: string;
//     image: string;
//     totalVotes: number;
//     isWinner: boolean;
//     session: string;
//     memeProgramId: string;
//     isFromNews: boolean;
//     tokenMintAddress: string;
// }

// export interface MemeArenaSessionData {
//     id: string;
//     startTime: Date;
//     endTime?: Date;
//     status: SessionStatus;
//     maxMemes: number;
//     votingThreshold: number;
//     votingTimeLimit: number;
//     votingEndTime?: Date;
//     winnerMeme?: string;
//     nextSessionDelay: number;
//     nextSessionStartTime?: Date;
//     contributeEndTime?: Date;
//     totalContributions: number;
//     tokenMintAddress?: string;
// }

// export interface MemeArenaData {
//     session: MemeArenaSessionData;
//     memes: MemeData[];
// }

// export interface MemeContributionData {
//     id: string;
//     meme: string;
//     session: string;
//     contributor: string;
//     contributorIpAddress: string;
//     amount: number;  
// }

// // DTOs
// export interface CreateMemeDto {
//     session: string;
//     name: string;
//     ticker: string;
//     description: string;
//     image: string;
//     isFromNews?: boolean;
// }

// export interface CreateMemeVoteDto {
//     session: string;
//     meme: string;
//     voter: string;
//     voterIpAddress: string;
// }

// export interface CreateMemeContributionDto {
//     session: string;
//     meme: string;
//     contributor: string;
//     contributorIpAddress: string;
//     amount: number;
// }

// export interface CheckContributionEligibilityDto {
//     memeId: string;
//     contributor: string;
// }

// export interface CreateContributeDto {
//     memeProgramId: string;
//     amount: string;
//     contributor: string;
// }