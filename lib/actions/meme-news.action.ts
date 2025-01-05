'use server'

import { connectToDatabase } from "../database/mongoose";
import MemeNews from "../database/models/meme-news.model";
import { createMeme } from "./meme-arena.action";
import mongoose from "mongoose";
import { transformNewsItems } from "../utils";
import { IMemeNews } from "../database/types";

// Get all available news memes
export async function getAvailableNewsMemes() {
  await connectToDatabase();
  const news = await MemeNews.find({ 
    isHidden: { $ne: true },
    isConverted: { $ne: true}
  })
    .sort('-createdAt')
    .limit(10)
    .lean();
  
    const updatedNews = await Promise.all(news.map(async (item) => {
      const shouldHide = 
        (item.meme?.length || 0) > 100 ||
        (item.meme?.match(/\p{Emoji}/gu) || []).length > 10 ||
        !!item.meme?.match(/(.)\1{4,}/g) || 
        !!item.meme?.match(/[a-zA-Z]{15,}/g); 
  
      if (shouldHide && !item.isHidden) {
        await MemeNews.findByIdAndUpdate(item._id, { isHidden: true });
      }
  
      return {
        ...item,
        isHidden: shouldHide
      };
    }));
    updatedNews.filter(item => !item.isHidden && !item.isConverted); 
    return transformNewsItems(updatedNews as IMemeNews[]);
}


// Create meme from selected news
export async function createMemeFromNews(sessionId: string, newsId: string) {
  await connectToDatabase();
  const dbSession = await mongoose.startSession();
  
  try {
    dbSession.startTransaction();

    // Find the news meme
    const newsMeme = await MemeNews.findById(newsId).session(dbSession);
    if (!newsMeme) {
      throw new Error('News meme not found');
    }

    // Create meme in the arena
    const memeData = await createMeme({
      session: sessionId,
      name: newsMeme.name,
      ticker: newsMeme.ticker,
      description: newsMeme.meme,
      image: newsMeme.image,
      isFromNews: true
    });

    // Update Meme News Converted
    await MemeNews.findByIdAndUpdate(
      newsMeme._id, 
      { isConverted: true },
    );

    await dbSession.commitTransaction();

    return memeData;

  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}