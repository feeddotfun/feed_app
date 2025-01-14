'use server'

import { connectToDatabase } from "../database/mongoose";
import MemeNews from "../database/models/meme-news.model";
import { createMeme } from "./meme-arena.action";
import mongoose from "mongoose";
import { transformNewsItems } from "../utils";
import { IMemeNews } from "../database/types";


const ITEMS_PER_PAGE = 6;

// Get all available news memes
export async function getAvailableNewsMemes(page = 1) {
  await connectToDatabase();
  
  const skipAmount = (page - 1) * ITEMS_PER_PAGE;

  const query = { 
    isHidden: { $ne: true },
    isConverted: { $ne: true }
  };

  const [news, totalCount] = await Promise.all([
    MemeNews.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skipAmount)
      .limit(ITEMS_PER_PAGE)
      .lean(),
    
    MemeNews.countDocuments(query)
  ]);


  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasMore = page < totalPages;

  return {
    items: transformNewsItems(news as IMemeNews[]),
    totalPages,
    hasMore
  };
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