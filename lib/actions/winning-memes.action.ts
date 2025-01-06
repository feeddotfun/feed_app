import { connectToDatabase } from "../database/mongoose";
import Meme from '../database/models/meme.model';
import { WinningMemeData } from "@/types";
import { IMemeArenaSession } from "../database/types";

const ITEMS_PER_PAGE = 6;

export async function getWinningMemes(page = 1): Promise<{
  items: WinningMemeData[];
  totalPages: number;
  hasMore: boolean;
}> {
  await connectToDatabase();

  const skipAmount = (page - 1) * ITEMS_PER_PAGE;

  const [winningMemes, totalCount] = await Promise.all([
    Meme.find({ isWinner: true })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skipAmount)
      .limit(ITEMS_PER_PAGE)
      .populate<{ session: IMemeArenaSession }>('session', 'tokenMintAddress')
      .lean(),
    
    Meme.countDocuments({ isWinner: true })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasMore = page < totalPages;

  return {
    items: winningMemes.map(meme => ({
      id: meme._id.toString(),
      name: meme.name,
      image: meme.image,
      description: meme.description,
      ticker: meme.ticker,
      votes: meme.totalVotes,
      marketCap:  0,
      date: meme.createdAt.toISOString(),
      mintAddress: meme.session?.tokenMintAddress || '',
      createdAt: meme.createdAt.toISOString()
    })),
    totalPages,
    hasMore
  };
}