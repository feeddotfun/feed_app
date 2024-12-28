import { Model, Schema, model, models } from 'mongoose'
import { createSchema, IMemeContribution } from '../types';

const MemeContributionSchema = createSchema<IMemeContribution>({
    meme: {
        type: Schema.Types.ObjectId,
        ref: 'Meme',
        required: true,
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'MemeArenaSession',
        required: true,
    },
    contributor: {
        type: String,
        required: true,
    },
    contributorIpAddress: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
})

MemeContributionSchema.index(
    { meme: 1, contributorIpAddress: 1 },
    { unique: true }
);

const MemeContribution: Model<IMemeContribution> = models.MemeContribution || model<IMemeContribution>('MemeContribution', MemeContributionSchema);

export default MemeContribution;