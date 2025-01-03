import { Model, Schema, model, models } from 'mongoose'
import { createSchema, IMeme } from '../types';
import { v4 } from  'uuid'

const MemeSchema =  createSchema<IMeme>({
    name: {
        type: String,
        required: true,
    },
    ticker: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    totalVotes: {
        type: Number,
        default: 0,
    },
    isWinner: {
        type: Boolean,
        default: false,
    },
    memeProgramId: {
        type: String,
        default: () => v4(),
        unique: true,
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'MemeArenaSession',
        required: true,
    },
    isFromNews: {
        type: Boolean,
        require: false,
        default: false
    }
}, { 
    timestamps: true
 })
  
 const Meme: Model<IMeme> = models.Meme || model<IMeme>('Meme', MemeSchema);

export default Meme;