// ** DB
import { connectToDatabase } from "../database/mongoose";
import MemeContribution from "../database/models/meme-contribution.model";
import MemeArenaSession from "../database/models/meme-arena-session.model";
import Meme from "../database/models/meme.model";

// ** Util
import { transformInvestment } from "../utils";

// ** Types
import { InvestmentData } from "@/types";

interface ContributionQuery {
  contributor: string;
  'session.status'?: string;
  isTokensClaimed?: boolean;
}

interface UpdateClaimStatusParams {
  contributor: string;
  signature: string;
  memeId: string;
}

const ITEMS_PER_PAGE = 6;

export async function getUserInvestments(walletAddress: string, page = 1, filter = 'waiting-claim'): Promise<{
  items: InvestmentData[];
  totalPages: number;
  hasMore: boolean;
}> {
  await connectToDatabase();

  const skipAmount = (page - 1) * ITEMS_PER_PAGE;

  let query: any = { contributor: walletAddress };

  if (filter === 'waiting-claim') {
    query = {
      contributor: walletAddress,
      isTokensClaimed: false,
    };
  } else if (filter === 'claimed') {
    query = {
      contributor: walletAddress,
      isTokensClaimed: true
    };
  }

  const [contributions, totalCount] = await Promise.all([
    MemeContribution.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skipAmount)
      .limit(ITEMS_PER_PAGE)
      .populate([
        {
          path: 'session',
          model: MemeArenaSession,
          select: 'status tokenMintAddress claimAvailableTime totalContributions initialVaultTokens'
        },
        {
          path: 'meme',
          model: Meme,
          select: 'name image ticker description memeProgramId'
        }
      ])
      .lean(),
    
    MemeContribution.countDocuments(query)
  ]);

  // const [contributions, totalCount] = await Promise.all([
  //   MemeContribution.find({ contributor: walletAddress })
  //     .sort({ createdAt: -1, _id: -1 })
  //     .skip(skipAmount)
  //     .limit(ITEMS_PER_PAGE)
  //     .populate([
  //       {
  //         path: 'session',
  //         model: MemeArenaSession,
  //         select: 'status tokenMintAddress claimAvailableTime totalContributions initialVaultTokens'
  //       },
  //       {
  //         path: 'meme',
  //         model: Meme,
  //         select: 'name image ticker description memeProgramId'
  //       }
  //     ])
  //     .lean(),
    
  //   MemeContribution.countDocuments({ contributor: walletAddress })
  // ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasMore = page < totalPages;

  return {
    items: contributions.map(transformInvestment),
    totalPages,
    hasMore
  };
}

export async function updateClaimStatus({ 
  contributor, 
  signature,
  memeId 
}: UpdateClaimStatusParams) {
  try {
    await connectToDatabase();

    const contribution = await MemeContribution.findOneAndUpdate(
      { 
        contributor,
        meme: memeId,
        isTokensClaimed: false // Safety check
      },
      { 
        $set: { 
          claimSignature: signature,
          isTokensClaimed: true,
          claimedAt: new Date()
        }
      },
      { new: true, lean: true }
    ).select('isTokensClaimed claimSignature claimedAt').lean();

    if (!contribution) {
      throw new Error('Contribution not found or already claimed');
    }
    return {
      success: true,
      isTokensClaimed: contribution.isTokensClaimed,
      claimSignature: signature
    };
    
  } catch (error) {
    console.error('Update claim status error:', error);
    throw error;
  }
}