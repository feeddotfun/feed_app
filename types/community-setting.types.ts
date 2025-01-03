import { BaseEntity } from "./base.types";

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