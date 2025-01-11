import { Model, Schema, model, models } from 'mongoose'
import { IMemeArenaSession } from '../types';

const MemeArenaSessionSchema = new Schema({
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Voting', 'LastVoting', 'Contributing', 'Completed'],
        default: 'Voting',
    },
    maxMemes: {
        type: Number,
        required: true,
    },
    votingThreshold: {
        type: Number,
        required: true,
    }, 
    votingTimeLimit: {
        type: Number,
        required: true,
    },   
    votingEndTime: {
         type: Date,
    }, 
    winnerMeme: {
        type: Schema.Types.ObjectId,
        ref: 'Meme',
    },
    nextSessionDelay: {
        type: Number,
        required: true,
    },
    nextSessionStartTime: {
        type: Date,
    },
    contributeEndTime: {
        type: Date,
    },
    claimAvailableTime: {
        type: Number
    },
    initialVaultTokens: { type: Number, default: 0},
    totalContributions: { type: Number, default: 0 },
    contributorCount: { type: Number, default: 0},
    tokenMintAddress: { type: String },
    tx: { type: String },

}, { 
    timestamps: true
 })

const MemeArenaSession: Model<IMemeArenaSession> = models.MemeArenaSession || model<IMemeArenaSession>('MemeArenaSession', MemeArenaSessionSchema);

export default MemeArenaSession;