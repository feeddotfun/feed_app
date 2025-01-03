import { model, Model, models } from "mongoose";
import { createSchema, IMemeNews } from "../types";

const MemeNewsSchema = createSchema<IMemeNews>({
    news: {
        type: String,
        required: true,
    },
    meme: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    ticker: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        require: true,
    },
    isConverted: {
        type: Boolean,
        require: false,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const MemeNews: Model<IMemeNews> = models.MemeNews || model<IMemeNews>('MemeNews', MemeNewsSchema);

export default MemeNews;