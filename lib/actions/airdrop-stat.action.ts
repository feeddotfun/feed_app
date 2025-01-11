'use server'

import { connectToDatabase } from "../database/mongoose";
import MemeVote from "../database/models/meme-vote.model";
import MemeContribution from "../database/models/meme-contribution.model";
import SystemConfigCommunityVote from "../database/models/system-config-community-vote.model";

const POINTS = {
  VOTE: 10,
  COMMUNITY_VOTE: 15,
  CONTRIBUTE: 50,
  CLAIM: 70,
  CONTRIBUTE_PER_SOL: 20,
  MAX_POINTS: 1000000
};

export async function getAirdropStats(walletAddress: string) {
  await connectToDatabase();

  const [memeVotes, communityVotes, contributions] = await Promise.all([
    MemeVote.countDocuments({ voter: walletAddress }),
    SystemConfigCommunityVote.countDocuments({ voter: walletAddress }),
    MemeContribution.find({ contributor: walletAddress }).lean()
  ]);

  const totalSol = contributions.reduce((sum, contrib) => 
    sum + (contrib.amount / 1e9), 0
  );

  const claimsCount = contributions.filter(contrib => contrib.isTokensClaimed).length;

  const votesPoints = memeVotes * POINTS.VOTE;
  const communityVotesPoints = communityVotes * POINTS.COMMUNITY_VOTE;
  const contributionPoints = (contributions.length * POINTS.CONTRIBUTE) + 
                           (totalSol * POINTS.CONTRIBUTE_PER_SOL);
  const claimPoints = claimsCount * POINTS.CLAIM;
  const totalPoints = votesPoints + communityVotesPoints + contributionPoints + claimPoints;

  return {
    activities: {
      votes: {
        count: memeVotes,
        points: votesPoints
      },
      communityVotes: {
        count: communityVotes,
        points: communityVotesPoints
      },
      contributions: {
        count: contributions.length,
        totalSol,
        points: contributionPoints
      },
      claims: {
        count: claimsCount,
        points: claimPoints
      }
    },
    totalPoints,
    maxPoints: POINTS.MAX_POINTS,
    progress: (totalPoints / POINTS.MAX_POINTS) * 100
  };
}