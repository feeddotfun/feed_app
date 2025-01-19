import { ISystemConfigCommunityVote } from './../types/index';
import { Model, model, models, Schema } from 'mongoose';

const SystemConfigCommunityVoteSchema = new Schema({
    voter: {
      type: String,
      required: true,
    },
    voterIpAddress: {
      type: String,
      required: true,
    },
    settingKey: {
      type: String,
      required: true
    },
    selectedValue: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    },
    votingPeriodId: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  });

  SystemConfigCommunityVoteSchema.index(
    { voter: 1, settingKey: 1, votingPeriodId: 1 },
    { 
      unique: true, 
      partialFilterExpression: {
        isActive: true
      }
    }
  );
  
  SystemConfigCommunityVoteSchema.index(
    { voterIpAddress: 1, settingKey: 1, votingPeriodId: 1 },
    { 
      unique: true, 
      partialFilterExpression: {
        isActive: true
      }
    }
  );
const SystemConfigCommunityVote:  Model<ISystemConfigCommunityVote> = models.SystemConfigCommunityVote || model<ISystemConfigCommunityVote>('SystemConfigCommunityVote', SystemConfigCommunityVoteSchema);

export default SystemConfigCommunityVote;
