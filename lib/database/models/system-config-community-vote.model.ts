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
    }
  });

SystemConfigCommunityVoteSchema.index(
  { voter: 1, settingKey: 1 },
  { unique: true, partialFilterExpression: {
    votedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }}
);
SystemConfigCommunityVoteSchema.index(
  { voterIpAddress: 1, settingKey: 1 },
  { unique: true, partialFilterExpression: {
    votedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }}
);
const SystemConfigCommunityVote:  Model<ISystemConfigCommunityVote> = models.SystemConfigCommunityVote || model<ISystemConfigCommunityVote>('SystemConfigCommunityVote', SystemConfigCommunityVoteSchema);

export default SystemConfigCommunityVote;
