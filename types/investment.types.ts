import { BaseEntity } from "./base.types";

export type InvestmentStatus = 'pending' | 'active' | 'claimable' | 'claimed';

export interface IInvestment extends BaseEntity {
    id: string;
    amount: number;
    createdAt: string;    
    status: 'Voting' | 'LastVoting' | 'Contributing' | 'Completed';
    tokenMintAddress?: string;
    claimAvailableTime?: number;
    estimatedTokens?: number;    
    isTokensClaimed?: boolean;
    meme: {
      id: string;
      name: string;
      image: string;
      ticker: string;
      description: string;
      memeProgramId: string;
    },
    session: {
      totalFunds: number;
      status: string;
      claimAvailableTime: number;
    };
}
export type InvestmentData = IInvestment;

export interface ClaimParams {
  investmentId: string;
  mintAddress: string;
  memeUuid: string;
  memeId: string;
}