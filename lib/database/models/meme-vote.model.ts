import { Schema, model, models } from "mongoose";
import { createSchema } from "../types";

const MemeVoteSchema = createSchema({
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
    voter: {
        type: String, // Sol Wallet Address
        required: true,
    },
    voterIpAddress: {
        type: String,
        required: true,
    },  
}, { timestamps: true })

// Compound index to ensure one vote per wallet per meme
MemeVoteSchema.index({ session: 1, voter: 1 }, { unique: true });

// Compound index to ensure one vote per IP address per meme
MemeVoteSchema.index({ session: 1, voterIpAddress: 1 }, { unique: true });

const MemeVote = models.MemeVote || model('MemeVote', MemeVoteSchema)

export default MemeVote;