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
        max: 60 * 60 * 1000 // Max 1 hour
      },
    nextSessionDelay: {
        type: Number,
        default: 1 * 60 * 1000, // 5 minutes
        min: 1 * 60 * 1000, // Min 1 minute
        max: 24 * 60 * 60 * 1000 // Max 24 hours
     },
     contributeFundingLimit: {
        type: Number,
        default: 1 * 60 * 1000, // 5 minutes 
        min: 1 * 60 * 1000, // Min 1 minute
     }
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
  
const SystemConfig = models.SystemConfig || model<ISystemConfigDocument, ISystemConfigModel>('SystemConfig', SystemConfigSchema);

export default SystemConfig as ISystemConfigModel;