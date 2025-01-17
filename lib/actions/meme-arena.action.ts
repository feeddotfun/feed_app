'use server'

// ** DB
import mongoose, { Mongoose } from "mongoose";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "../database/mongoose";
import MemeArenaSession from "../database/models/meme-arena-session.model";
import Meme from '../database/models/meme.model';
import SystemConfig from "../database/models/system-config.model";
import MemeVote from "../database/models/meme-vote.model";
import MemeContribution from "../database/models/meme-contribution.model";

// ** SSE & Services
import { sendUpdate } from "@/lib/utils";
import { MemeArenaTimerService } from "../services/meme-arena-timer.service";
import { ContributionValidator } from "../services/contribution-validator.service";

// ** SDK 
import { MemeFundSDK } from "../meme-fund/fund.sdk";
import { headers } from "next/headers";

// ** Utils
import { transformMeme, transformSession, transformContribution } from "../utils";

// ** Types
import { ContributeMemeParams, CreateMemeParams, MemeArenaData, MemeData, VoteMemeParams } from "@/types";
import { IMeme, IMemeArenaSession, IMemeContribution } from "../database/types";


import { v4 as uuidv4 } from 'uuid';

async function ensureCollectionsExist(connection: Mongoose) {
    if (!connection?.connection?.db) {
      console.warn('Database connection not initialized');
      return;
  }
  const requiredCollections = [
      'memecontributions',
      'memes',
      'memevotes',      
  ];
  const collections = await connection.connection.db.listCollections().toArray();
  const existingCollections = collections.map(col => col.name);

  for (const collection of requiredCollections) {
      if (!existingCollections.includes(collection)) {
          await connection.connection.db.createCollection(collection);
          console.log(`Created collection: ${collection}`);
      }
  }
}

// ** Initialize system
export async function initializeSystem() {
    const connection = await connectToDatabase();

    if (connection) {
      ensureCollectionsExist(connection)
    }
    await SystemConfig.getConfig(); 
    const activeSession = await MemeArenaSession.findOne({ status: { $in: ['Voting', 'LastVoting'] } });
    if (!activeSession) {
      await startNewArenaSession();
    }
}

// ** Create a new arena session
export async function startNewArenaSession() {  
    await connectToDatabase();
    const dbSession = await mongoose.startSession();
    try {
      dbSession.startTransaction();
      const config = await SystemConfig.getConfig();
      const session = await MemeArenaSession.create([{
        startTime: new Date(),
        status: 'Voting',
        maxMemes: config.maxMemesPerSession,
        votingThreshold: config.votingThreshold,
        votingTimeLimit: config.votingTimeLimit,
        nextSessionDelay: config.nextSessionDelay
      }], { session: dbSession });
  
      await dbSession.commitTransaction();
      sendUpdate('new-session',{        
        session: transformSession(session[0])
      });
      return session[0];
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

// ** Create a new meme
export async function createMeme(createMemeParams: Partial<CreateMemeParams>): Promise<MemeData> {
  await connectToDatabase();
  const sanitized = sanitize(createMemeParams);
  const now = Date.now();

  const dbSession = await mongoose.startSession();
  try {
      dbSession.startTransaction();

      const session = await MemeArenaSession.findById({ _id: sanitized.session }).session(dbSession);
      if (!session || !['Voting', 'Contributing'].includes(session.status)) {
          throw new Error('Invalid session status for meme creation');
      }

      const memeCount = await Meme.countDocuments({ session: sanitized.session }).session(dbSession);
      if (memeCount >= session.maxMemes) {
          throw new Error('Maximum meme limit reached for this session');
      }

      const newMeme = await Meme.create([{...sanitized, createdAt: now}], { session: dbSession });
      await dbSession.commitTransaction();

      const transformedMeme = transformMeme(newMeme[0]);
      
      return transformedMeme;
  } catch (error) {
      await dbSession.abortTransaction();
      throw error;
  } finally {
      dbSession.endSession();
  }
}

// ** Get active session memes
export async function getActiveSessionMemes() {
  await connectToDatabase();

  let completedSession = await MemeArenaSession.findOne<IMemeArenaSession>({ 
    status: 'Completed',
    nextSessionStartTime: { $gt: new Date() }
  }).sort('-endTime').lean();

  if (completedSession) {
    const winnerMeme = await Meme.findById(completedSession.winnerMeme).lean();
    
    const transformedData: MemeArenaData = {
      id: completedSession._id.toString(),
      createdAt: completedSession.createdAt.toISOString(),
      session: transformSession(completedSession as IMemeArenaSession),
      memes: winnerMeme ? [transformMeme(winnerMeme as IMeme)] : []
    };
    
    return transformedData;
  }

  let activeSession = await MemeArenaSession.findOne<IMemeArenaSession>({ 
    status: { $in: ['Voting', 'LastVoting', 'Contributing'] } 
   }).sort('-startTime').lean();

  if (!activeSession) {
    throw new Error('No active session found');
  }

  const memes: IMeme[] = activeSession.status === 'Completed' || activeSession.status === 'Contributing'
    ? await Meme.findById(activeSession.winnerMeme).lean().then(winner => winner ? [winner as IMeme] : [])
    : await Meme.find({ session: activeSession._id }).sort('-totalVotes').lean() as IMeme[];

  const transformedData: MemeArenaData = {
    id: activeSession._id.toString(),
    createdAt: activeSession.createdAt.toISOString(),
    session: transformSession(activeSession as IMemeArenaSession),
    memes: memes.map(meme => transformMeme(meme as IMeme))
  };
  
  return transformedData;
}

// ** Vote for a meme
export async function createMemeVote(voteMemeParams: Partial<VoteMemeParams>): Promise<MemeData> {
  await connectToDatabase()
  const sanitized = sanitize(voteMemeParams);
  const session = await MemeArenaSession.findById({ _id: sanitized.session });
  if (!session || !['Voting', 'LastVoting'].includes(session.status)) {
      throw new Error('Invalid session or voting not active');
  }

  const { voter, voterIpAddress } = sanitized;
  
  const existingVote = await MemeVote.findOne({ session: session._id, $or: [{ voter }, { voterIpAddress }] });
  if (existingVote) {
    throw new Error('You have already voted in this session');
  }

  await MemeVote.create(sanitized);

  const updatedMeme = await Meme.findByIdAndUpdate(
      sanitized.meme, 
      { $inc: { totalVotes: 1 } },
      { new: true }
    );

    if (!updatedMeme) {
      throw new Error('Meme not found');
    }

  const transformedMeme = transformMeme(updatedMeme);

  if (updatedMeme.totalVotes === session.votingThreshold && session.status === 'Voting') {
    await startLastVotingOnSession(session.id.toString());
  }

  return transformedMeme;
}

// ** Start last voting on session
export async function startLastVotingOnSession(sessionId: string) {
  await connectToDatabase();
  const sanitized = sanitize(sessionId);
  const dbSession = await mongoose.startSession();
 
  try {
    dbSession.startTransaction();
 
    const session = await MemeArenaSession.findById({ _id: sanitized }).session(dbSession);
    if (!session || session.status !== 'Voting') {
      throw new Error('Invalid session or wrong status');
    }
 
    const now = Date.now();
    
    const timerService = MemeArenaTimerService.getInstance();
    const timerResult = await timerService.scheduleVotingEnd(sessionId, session.votingTimeLimit);
    
    if (!timerResult.success) {
      throw new Error('Failed to schedule voting end');
    }
        
    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      sessionId, 
      { 
        votingEndTime: timerResult.scheduledTime,
        status: 'LastVoting',
        lastUpdateTime: now
      }, 
      { new: true, session: dbSession }
    );
 
    if (!updatedSession) {
      throw new Error('Failed to update session');
    }
 
    await dbSession.commitTransaction();
 
    sendUpdate('voting-threshold-reached',{ 
      session: transformSession(updatedSession as IMemeArenaSession),
      votingEndTime: timerResult?.scheduledTime?.toISOString(),
      sessionId: session.id.toString(),
      timestamp: now
    });
 
    return updatedSession;
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
 }

// ** Start contributing phase on session
 export async function startContributing(sessionId: string) {
  await connectToDatabase();
  const memeSession = await MemeArenaSession.findById({ _id: sessionId });
  if (!memeSession || memeSession.status !== 'LastVoting') {
    return;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const now = Date.now();
    const config = await SystemConfig.getConfig();
    
    const winnerMeme = await Meme.findOne({ session: sessionId })
      .sort('-totalVotes')
      .limit(1)
      .session(session);

    if (!winnerMeme) {
      throw new Error('No memes found for this session');
    }
    
    await Meme.findByIdAndUpdate(
      winnerMeme._id, 
      { isWinner: true },
      { session }
    );

    // Create meme registry on program
    const sdk = new MemeFundSDK();
    const result = await sdk.createMemeRegistry(winnerMeme.memeProgramId);
    if (!result.success) {
      await session.abortTransaction();
      throw new Error(`Failed to create meme registry: ${result.error}`);
    }

    const timerService = MemeArenaTimerService.getInstance();
    const contributeTimerResult = await timerService.scheduleContributingEnd(
      sessionId, 
      config.contributeFundingLimit
    );

    if (!contributeTimerResult.success) {
      throw new Error('Failed to schedule contributing end');
    }

    const claimAvailableTime = (await sdk.getClaimAvailableTime(winnerMeme.memeProgramId)).toNumber() + 60

    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'Contributing',
        endTime: new Date(now),
        winnerMeme: winnerMeme._id,
        contributeEndTime: contributeTimerResult.scheduledTime,
        nextSessionStartTime: contributeTimerResult.nextSessionTime,
        claimAvailableTime: claimAvailableTime,
        lastUpdateTime: now,
        totalContributions: 0
      },
      { new: true, session }
    );

    await session.commitTransaction();

    if (updatedSession) {
      sendUpdate('contributing-started',{ 
        meme: {
          ...transformMeme(winnerMeme),
          isWinner: true
        },
        session: transformSession(updatedSession),
        timestamp: now
      });
    }

    return updatedSession;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// ** Create a new meme contribution
export async function createMemeContribution(contributeMemeParams: ContributeMemeParams) {
  await connectToDatabase();
  const sanitized = sanitize(contributeMemeParams);
  const now = Date.now();

   // Get IP address from request headers
   const contributorIpAddress = uuidv4() //await getIpAddressWithHeader();
 
  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    // Validate contribution amount
    const validationResult = await ContributionValidator.validateContribution(
      sanitized.session,
      sanitized.amount
    );

    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }
 
    const session = await MemeArenaSession.findById({ _id: sanitized.session }).session(dbSession);
    if (!session || session.status !== 'Contributing') {
      throw new Error('Invalid session or contribution period not active');
    }
 
    if (!session.contributeEndTime) {
      throw new Error('Contribution end time not set for this session');
    }
 
    if (now > session.contributeEndTime.getTime()) {
      throw new Error('Contribution period has ended');
    }
 
    const existingContributionWithIp = await MemeContribution.findOne({
      meme: sanitized.meme,
      contributorIpAddress,
    }).session(dbSession);
 
    if (existingContributionWithIp) {
      throw new Error('A contribution for this meme has already been made from this IP address');
    }
 
    const existingContribution = await MemeContribution.findOne({
      meme: sanitized.meme,
      contributor: sanitized.contributor
    }).session(dbSession);
 
    if (existingContribution) {
      throw new Error('A contribution for this meme has already been made from this address');
    }
 
    const [newContribution] = await MemeContribution.create([{
      ...sanitized,
      contributorIpAddress,
      createdAt: new Date()
    }], { session: dbSession });

    const winnerMeme = await Meme.findById(session.winnerMeme).lean();
    if (!winnerMeme) {
      throw new Error('Winner meme not found');    }
    
    await dbSession.commitTransaction();

    const totalAmount = await MemeContribution.aggregate([
      { $match: { session: session._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const uniqueContributors = await MemeContribution.distinct('contributor', { session: session._id });

    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      session._id,
      {
        totalContributions: totalAmount[0]?.total || 0,
        contributorCount: uniqueContributors.length,
        remainingContributions: validationResult.remainingAmount
      },
      { new: true }
    );
    

    sendUpdate('new-contribution',{ 
      contribution: transformContribution(newContribution), 
      session: transformSession(updatedSession as IMemeArenaSession),
      remainingContributions: validationResult.remainingAmount,
      timestamp: now
    });
 
    return transformContribution(newContribution);
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}

// ** End contributing and start new session
export async function endContributingAndStartNewSession(sessionId: string) {
  await connectToDatabase();
  const dbSession = await mongoose.startSession();

  try {
    dbSession.startTransaction();

    const session = await MemeArenaSession.findById({ _id: sessionId }).session(dbSession);
    if (!session || session.status !== 'Contributing') {
      throw new Error('Invalid session status');
    }

    sendUpdate('token-creation-started', {
      session: transformSession(session),
      timestamp: new Date()
    });

    const winner = await Meme.findById(session.winnerMeme).lean();
    if (!winner) {
      throw new Error('Winner meme not found');
    }

     // Create token using SDK
    const sdk = new MemeFundSDK();

    // Start meme token creation
    const tokenResult = await sdk.startMeme(
      winner.memeProgramId,
      {
        name: winner.name,
        symbol: winner.ticker,
        description: winner.description,
        imageUrl: winner.image,
        twitter: "",
        telegram: "",
        website: ""
      }
    );

    if (!tokenResult.success) {
      throw new Error(`Token creation failed: ${tokenResult.error}`);
    }
    
    console.log(tokenResult)
    const vaultTokens = await sdk.getVaultTokenAccount(
      tokenResult.mintAddress!,
      winner.memeProgramId
    );
    
    const timerService = MemeArenaTimerService.getInstance();
    const timerResult = await timerService.scheduleNextSession(sessionId, session.nextSessionDelay);

    if (!timerResult.success) {
      throw new Error('Failed to schedule next session');
    }
    
    const now = new Date();
    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      sessionId, 
      { 
        endTime: new Date(),
        status: 'Completed',
        initialVaultTokens: vaultTokens.amount,
        tokenMintAddress: tokenResult.mintAddress,
        tx: tokenResult.tx,
        nextSessionStartTime: timerResult.scheduledTime,
        lastUpdateTime: now,
      }, 
      { new: true, session: dbSession }
    );

    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    await dbSession.commitTransaction();
    const winnerMeme = await Meme.findById(session.winnerMeme).lean();

    sendUpdate('contributing-ended',{ 
      session: transformSession(updatedSession as IMemeArenaSession),
      winnerMeme: winnerMeme ? transformMeme(winnerMeme as IMeme) : null
    });
    
    return updatedSession;
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}

// ** Check contribution eligibility
export async function checkContributionEligibility(memeId: string, contributor: string, ipAddress: string) {
  await connectToDatabase();
  const activeSession = await MemeArenaSession.findOne({ 
    status: 'Contributing',
    contributeEndTime: { $gt: new Date() }
  });
  if (!activeSession) {
    return { 
      eligible: false, 
      reason: 'No active contribution session' 
    };
  }

  const ipContribution = await MemeContribution.findOne({
    meme: memeId,
    contributorIpAddress: ipAddress
  });

  if (ipContribution) {
    return { eligible: false, reason: 'IP address already contributed' };
  }

  const walletContribution = await MemeContribution.findOne({
    meme: memeId,
    contributor: contributor
  });

  if (walletContribution) {
    return { eligible: false, reason: 'Wallet already contributed' };
  }

  return { eligible: true, reason: null };

}

// ** Get Active Session Contributions
export async function getActiveSessionContributions() {
  await connectToDatabase();
  const activeSession = await MemeArenaSession.findOne({ status: 'Contributing' });
  if (!activeSession) {
    throw new Error('No active contribution session found');
  }

  const contributions = await MemeContribution.find({ session: activeSession._id }).lean();
  return contributions.map(contribution => transformContribution(contribution as IMemeContribution));
}

// ** Get With Session ID Contributions
export async function getWithSessionContributions(sessionId: string) {
  await connectToDatabase();
  const contributions = await MemeContribution.find({ 
    session: sessionId 
  })
  .sort('-createdAt')
  .lean();

  const uniqueContributors = await MemeContribution.distinct('contributor', { 
    session: sessionId 
  });
  const totalAmount = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  return {
    items: contributions.map(contribution => ({
      id: contribution._id.toString(),
      contributor: contribution.contributor,
      amount: contribution.amount,
      createdAt: contribution.createdAt
    })),
    total: uniqueContributors.length,
    totalAmount
  };
}

// ** Get Meme Vote Details
export async function getMemeVoteDetails(memeId: string, sessionId: string) {
  await connectToDatabase();
  
  // Session validation
  const session = await MemeArenaSession.findById(sessionId);
  if (!session || !['Voting', 'LastVoting'].includes(session.status)) {
    throw new Error('Voting is not active for this session');
  }

  // Meme validation
  const meme = await Meme.findById(memeId);
  if (!meme) {
    throw new Error('Meme not found');
  }

  return {
    meme,
    session
  };
}


export async function getIpAddressWithHeader(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  const headersList = await headers();

  // Cloudflare proxy
  const cfConnectingIp = headersList.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  return (forwardedFor?.split(',')[0].trim()) || 
         realIp || 
         '127.0.0.1';
}