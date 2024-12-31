import { SETTINGS_CONFIG } from "@/constants/community-setting-config";

export interface CommunitySettingOption {
    value: number;
    label: string;
}

export interface CommunitySettingConfig {
    title: string;
    description: string;
    iconType: string;
    format: (value: number) => string;
    category: 'investment' | 'timing';
    options: CommunitySettingOption[];
  }
  
  export type CommunitySettingConfigType = {
    [K in keyof typeof SETTINGS_CONFIG]: CommunitySettingConfig;
  };
  export type CommunitySettingKeyType = keyof CommunitySettingConfigType;
  
  export interface CommunityVoteData {
    settingKey: string;
    optionValue: number;
    votes: number;
    lastResetTime: string;
  }
  
  export interface CommunitySystemConfig {
    votingTimeLimit: number;
    nextSessionDelay: number;
    contributeFundingLimit: number;
    minContributionSol: number;
    maxContributionSol: number;
    [key: string]: number;
  }
  
  export interface CommunitySettingData {
    config: CommunitySystemConfig;
    votes: CommunityVoteData[];
    settings: Record<string, CommunitySettingConfig>;
    votingEndTime: string; // ISO string
    votingStartTime: string; // ISO string
  }
  
  export interface CommunityVoteParams {
    voter: string;
    settingKey: string;
    selectedValue: number;
  }