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
}, {
    timestamps: true
})

const MemeNews: Model<IMemeNews> = models.MemeNews || model<IMemeNews>('MemeNews', MemeNewsSchema);

export default MemeNews;