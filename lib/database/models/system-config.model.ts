import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ISystemConfig } from '../types';
import { Model, Schema, model, models, Document } from 'mongoose'

interface ISystemConfigDocument extends ISystemConfig, Document {}

interface ISystemConfigModel extends Model<ISystemConfigDocument> {
  getConfig(): Promise<ISystemConfigDocument>;
}

const SystemConfigSchema = new Schema<ISystemConfigDocument>({
    maxMemesPerSession: {
        type: Number,
        default: 6,
        min: 1,
        max: 20
    },
    votingThreshold: {
        type: Number,
        default: 20,
        min: 1
    },
    votingTimeLimit: {
        type: Number,
        default: 1 * 60 * 1000, // 5 minutes
        min: 1 * 60 * 1000, // Min 1 minute
        max: 60 * 60 * 1000, // Max 1 hour
        options: [1, 3, 5, 10].map(min => min * 60 * 1000)
      },
    nextSessionDelay: {
        type: Number,
        default: 1 * 60 * 1000, // 5 minutes
        min: 1 * 60 * 1000, // Min 1 minute
        max: 24 * 60 * 60 * 1000, // Max 24 hours
        options: [5, 10, 15, 30].map(min => min * 60 * 1000)
     },
     contributeFundingLimit: {
        type: Number,
        default: 1 * 60 * 1000, // 5 minutes 
        min: 1 * 60 * 1000, // Min 1 minute
        options: [3, 5, 10, 15].map(min => min * 60 * 1000)
     },
     minContributionSol: {
        type: Number,
        default: 0.1,
        min: 0.1,
        options: [0.1, 0.2, 0.3, 0.4] // mainnet [0.1, 0.2, 0.3, 0.5]
      },
      maxContributionSol: {
        type: Number,
        default: 0.5, //  mainnet 1
        min: 0.2, //  mainnet 0.5
        options: [0.5, 0.6, 0.7, 0.8]  // mainnet [0.5, 1, 1.5, 2]
      },
      tokenClaimDelay: {
        type: Number,
        default: 15 * 60 * 1000, // 15 minutes 
        min: 15 * 60 * 1000,
        max: 90 * 60 * 1000,
        options: [15, 30, 45, 90].map(min => min * 60 * 1000)
      },
      totalFundLimit: {
        type: Number,
        default: 1.4 * LAMPORTS_PER_SOL, // 1.4 SOL in lamports (just for devnet because pump program global token reserve different to mainnet)
        min: 1 * LAMPORTS_PER_SOL,
        max: 2 * LAMPORTS_PER_SOL,
    },
}, { timestamps: true })

SystemConfigSchema.statics.getConfig = async function(): Promise<ISystemConfigDocument> {
  try {
    let config = await this.findOne().exec();
    if (!config) {
      config = await this.create({});
    }
    return config;
  }
  catch (error) {
    throw error;
  }
};

// Helper method to get options for a setting
SystemConfigSchema.methods.getOptionsForSetting = function(settingKey: string) {
  const schema = this.schema.obj[settingKey];
  return schema?.options || [];
};

const SystemConfig = models.SystemConfig || model<ISystemConfigDocument, ISystemConfigModel>('SystemConfig', SystemConfigSchema);

export default SystemConfig as ISystemConfigModel;

