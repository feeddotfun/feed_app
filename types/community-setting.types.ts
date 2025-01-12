import { SETTINGS_CONFIG } from "@/constants/community-setting.config";
import { BaseEntity } from "./base.types";

export type CommunitySettingKeyType = keyof typeof SETTINGS_CONFIG;

export interface CommunitySettingOption {
  value: number;
  label: string;
  description?: string;
  votes?: number;
}

export interface SettingConfig {
  category: 'investment' | 'timing';
  description: string;
  options: CommunitySettingOption[];
}

export interface CommunityVote extends BaseEntity {
    settingKey: string;
    optionValue: number;
    votes: number;
    lastResetTime: string;
}

export interface SystemConfig extends BaseEntity {
    [key: string]: any;
}
  
export interface CommunitySettingData extends BaseEntity {
    config: SystemConfig;
    votes: CommunityVote[];
    settings: Record<string, any>;
    votingStartTime: string;
    votingEndTime: string;
}
  
export interface VoteParams {
    voter: string;
    settingKey: string;
    selectedValue: number;
}

export interface SystemConfigVoteData {
  settingKey: string;
  optionValue: number;
  votes: number;
}

export interface CreateSystemSettingVoteDto {
  voter: string;
  voterIpAddress: string;
  settingKey: string;
  selectedValue: number;
}

export interface CommunitySettingConfig {
  title: string;
  description: string;
  iconType: string;
  format: (value: number) => string;
  category: 'investment' | 'timing';
  options: CommunitySettingOption[];
}