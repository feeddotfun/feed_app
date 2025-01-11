import { Icons } from "@/components/ui/icon";
export * from './base.types';

export * from './dashboard.types'
export * from './meme-arena.types';
export * from './community-setting.types';
export * from './ai-news-lab.types';
export * from './winning-memes.types'
export * from './investment.types'
export * from './airdrop-stat.types'

export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
}

export const SYSTEM_CONFIG_OPTIONS = {
    minContributionSol: [0.1, 0.3, 0.5, 1.0],
    maxContributionSol: [0.5, 1.0, 1.5, 2.0],
    votingTimeLimit: [1, 3, 5, 10].map(min => min * 60 * 1000),
    nextSessionDelay: [1, 5, 15, 30].map(min => min * 60 * 1000),
    contributeFundingLimit: [1, 5, 7, 10].map(min => min * 60 * 1000)
  } as const;


