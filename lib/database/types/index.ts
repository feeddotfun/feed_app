import { Document, Schema, SchemaOptions, Types } from 'mongoose';

export interface SystemConfigSetting {
  type: any;
  default: number;
  min?: number;
  max?: number;
  options: number[];
}
export interface SystemConfigSchema {
  maxMemesPerSession: SystemConfigSetting;
  votingThreshold: SystemConfigSetting;
  votingTimeLimit: SystemConfigSetting;
  nextSessionDelay: SystemConfigSetting;
  contributeFundingLimit: SystemConfigSetting;
  minContributionSol: SystemConfigSetting;
  maxContributionSol: SystemConfigSetting;
}
export interface ISystemConfig  {
    maxMemesPerSession: number;
    votingThreshold: number;
    votingTimeLimit: number;
    nextSessionDelay: number;
    contributeFundingLimit: number;
    minContributionSol: number;
    maxContributionSol: number;
    tokenClaimDelay: number;
    getOptionsForSetting(settingKey: string): number[];
}

export interface IMeme extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    ticker: string;
    description: string;
    image: string;
    totalVotes: number;
    isWinner: boolean;
    session: Schema.Types.ObjectId;
    memeProgramId: string;
    tokenMintAddress: string;
    isFromNews: boolean
    createdAt: Date;
    updatedAt: Date;
}

export interface IMemeArenaSession extends Document {
    _id: Schema.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    status: 'Voting' | 'LastVoting' | 'Contributing' | 'Completed';
    maxMemes: number;
    votingThreshold: number;
    votingTimeLimit: number;
    votingEndTime?: Date;
    winnerMeme?: Schema.Types.ObjectId;
    nextSessionDelay: number;
    nextSessionStartTime?: Date;
    contributeEndTime?: Date;
    claimAvailableTime?: number,
    totalContributions: number;
    contributorCount: number,
    tokenMintAddress?: string;
    tx?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMemeContribution extends Document {
    _id: Schema.Types.ObjectId;
    meme: Schema.Types.ObjectId;
    session: Schema.Types.ObjectId;
    contributor: string;
    contributorIpAddress: string;
    amount: number;
    isTokensClaimed?: boolean;
    claimSignature?: string;
    claimAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMemeNews extends Document {
    _id: Schema.Types.ObjectId;
    news: string;
    meme: string;
    name: string;
    ticker: string;
    image: string;
    isConverted: boolean;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISystemConfigVotes {
  settingKey: string;
  optionValue: number;
  votes: number;
  lastResetTime: Date;
}

export interface ISystemConfigCommunityVote {
  voter: string; 
  voterIpAddress: string;
  settingKey: string; 
  selectedValue: number;
  votedAt: Date;
}

type DocumentType<T> = T & Document;

export function transformDocument<T>(
    doc: DocumentType<T> | T
  ): Omit<T, '__v' | '_id'> & { id: string } {
    let transformed: any;
  
    if (doc instanceof Document) {
      transformed = doc.toObject({ virtuals: true });
    } else {
      transformed = { ...doc };
    }
  
    if (transformed._id instanceof Types.ObjectId) {
      transformed.id = transformed._id.toString();
    } else if (typeof transformed._id === 'string') {
      transformed.id = transformed._id;
    } else {
      transformed.id = String(transformed._id);
    }
  
    delete transformed._id;
    delete transformed.__v;
  
    return transformed as Omit<T, '__v' | '_id'> & { id: string };
  }
    
  export function createSchema<T>(definition: any, options?: SchemaOptions): Schema<T> {
      return new Schema(definition, {
        ...options,
        toJSON: {
          transform: (doc: Document, ret: Record<string, any>) => transformDocument(doc),
          ...options?.toJSON,
        },
        toObject: {
          transform: (doc: Document, ret: Record<string, any>) => transformDocument(doc),
          ...options?.toObject,
        },
      });
  }
    