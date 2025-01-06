import { BaseEntity } from '@/types';

export interface WinningMemeData extends BaseEntity {
    id: string;
    name: string;
    image: string;
    description: string;
    ticker: string;
    votes: number;
    date: string;
    mintAddress: string;
  }