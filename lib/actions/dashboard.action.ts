'use server'

import { connectToDatabase } from "../database/mongoose";
import Meme from '../database/models/meme.model';
import MemeArenaSession from "../database/models/meme-arena-session.model";
import MemeVote from "../database/models/meme-vote.model";
import MemeContribution from "../database/models/meme-contribution.model";
import { DashboardStats } from "@/types";
import { IMemeArenaSession } from "../database/types";


export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  // Get 24 hours ago date
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  
  const [
    totalMemes, 
    totalVotes, 
    trendingMeme, 
    winnerMemes, 
    activeSessions,
    recentWinners,
    topVotedMemes,
    activityData
  ] = await Promise.all([
    // Get total memes count
    Meme.countDocuments(),
    
    // Get total votes
    MemeVote.countDocuments(),
    
    // Get trending meme (most voted in current voting sessions)
    Meme.findOne({
      session: {
        $in: await MemeArenaSession.find({ 
          status: { $in: ['Voting', 'LastVoting'] } 
        }).distinct('_id')
      }
    })
    .sort("-totalVotes")
    .select("name image totalVotes ticker"),
    
    // Get winner memes count
    Meme.countDocuments({ isWinner: true }),
    
    // Get active sessions count
    MemeArenaSession.countDocuments({ 
      status: { $in: ['Voting', 'LastVoting', 'Contributing'] } 
    }),

    // Get recent winners
    Meme.find({ isWinner: true })
      .populate<{ session: IMemeArenaSession }>('session', 'tokenMintAddress')
      .sort("-createdAt")
      .limit(2)
      .select("name image totalVotes ticker session"),

    // Get top voted memes in last 24h
    Meme.find({ 
      createdAt: { $gte: last24Hours },
      isWinner: { $ne: true },
    })
    .populate<{ session: IMemeArenaSession }>({
      path: 'session',
      match: { status: 'Completed' },
      select: 'tokenMintAddress status'
    })
    .sort("-totalVotes")
    .limit(3)
    .select("name image totalVotes ticker createdAt session"),

    // Get 24h activity data
    Promise.all([
      // Meme creation activity
      Meme.aggregate([
        {
          $match: {
            createdAt: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%H", 
                date: "$createdAt",
                timezone: "UTC" 
              }
            },
            count: { $sum: 1 }
          }
        }
      ]),

      // Voting activity
      MemeVote.aggregate([
        {
          $match: {
            createdAt: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%H", 
                date: "$createdAt",
                timezone: "UTC"
              }
            },
            count: { $sum: 1 }
          }
        }
      ]),

      // Contribution activity
      MemeContribution.aggregate([
        {
          $match: {
            createdAt: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%H", 
                date: "$createdAt",
                timezone: "UTC"
              }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ])
  ]);

  // Process activity data
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const [memeActivity, voteActivity, contributionActivity] = activityData;

  const activity = hours.map(hour => {
    const memeCount = memeActivity.find(m => m._id === hour)?.count || 0;
    const voteCount = voteActivity.find(v => v._id === hour)?.count || 0;
    const contributionCount = contributionActivity.find(c => c._id === hour)?.count || 0;

    // Calculate weighted activity score
    const activityScore = (
      memeCount * 10 +
      voteCount * 2 + 
      contributionCount * 5 
    );

    // Calculate baseline (minimum activity level)
    const baselineScore = Math.max(
      Math.floor(activityScore * 0.3),  // 30% of activity score
      5  // Minimum baseline
    );

    return {
      time: `${hour}:00`,
      activity: activityScore,
      baseline: baselineScore
    };
  });

  // Transform winner memes
  const transformedWinners = recentWinners.map(meme => ({
    id: meme._id.toString(),
    name: meme.name,
    image: meme.image,
    ticker: meme.ticker,
    votes: meme.totalVotes,
    mintAddress: meme.session?.tokenMintAddress || undefined
  }));

  // Transform top voted memes
  const transformedTopVoted = topVotedMemes.map(meme => ({
    id: meme._id.toString(),
    name: meme.name,
    image: meme.image,
    ticker: meme.ticker,
    votes: meme.totalVotes,
    date: meme.createdAt.toISOString(),
    ...(meme.session?.status === 'Completed' && meme.isWinner && meme.session?.tokenMintAddress ? 
      { mintAddress: meme.session.tokenMintAddress } : {})
  }));

  return {
    id: 'dashboard-stats',
    totalMemes,
    totalVotes,
    totalWinners: winnerMemes,
    activeSessions,
    activity,
    trendingMeme: trendingMeme ? {
      id: trendingMeme._id.toString(),
      name: trendingMeme.name,
      image: trendingMeme.image,
      votes: trendingMeme.totalVotes,
      ticker: trendingMeme.ticker
    } : null,
    trendingMemes: {
      winners: transformedWinners,
      topVoted: transformedTopVoted
    },
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
}