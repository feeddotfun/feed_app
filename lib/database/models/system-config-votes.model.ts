import { ISystemConfigVotes } from './../types/index';
import { Model, model, models, Schema } from 'mongoose';

const SystemConfigVotesSchema = new Schema({
    settingKey: {
        type: String,
        required: true
      },
    optionValue: {
        type: Number,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    lastResetTime: {
        type: Date,
        default: Date.now
    }
  });

SystemConfigVotesSchema.index({ settingKey: 1, lastResetTime: 1 });

const SystemConfigVotes:  Model<ISystemConfigVotes> = models.SystemConfigVotes || model<ISystemConfigVotes>('SystemConfigVotes', SystemConfigVotesSchema);

export default SystemConfigVotes;
