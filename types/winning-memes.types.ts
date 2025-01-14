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

const SORT_OPTIONS = ['votes', 'created'] as const;
export type WinningMemesSortType = typeof SORT_OPTIONS[number]; 