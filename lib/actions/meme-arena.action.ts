'use server'

// ** DB
import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "../database/mongoose";
import MemeArenaSession from "../database/models/meme-arena-session.model";
import Meme from '../database/models/meme.model';
import SystemConfig from "../database/models/system-config.model";
import MemeVote from "../database/models/meme-vote.model";

// ** SSE & Services
import { sendUpdate } from "./sse";
import { MemeArenaTimerService } from "../services/meme-arena-timer.service";

// ** Utils
import { transformMeme, transformSession, transformContribution } from "../utils";

// ** Types
import { CreateMemeContributionDto, CreateMemeDto, CreateMemeVoteDto, MemeArenaData, MemeData } from "@/types";
import { IMeme, IMemeArenaSession, IMemeContribution } from "../database/types";
import MemeContribution from "../database/models/meme-contribution.model";


// ** Initialize system
export async function initializeSystem() {
    await connectToDatabase();
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
      sendUpdate({
        type: 'new-session',
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
export async function createMeme(createMemeDto: Partial<CreateMemeDto>): Promise<MemeData> {
  await connectToDatabase();
  const sanitized = sanitize(createMemeDto);
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
      sendUpdate({ type: 'new-meme', meme: transformedMeme, timestamp: now });
      
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

  let activeSession = await MemeArenaSession.findOne<IMemeArenaSession>({ 
    status: { $in: ['Voting', 'LastVoting', 'Contributing'] } 
}).sort('-startTime').lean();

  if (!activeSession) {
    activeSession = await MemeArenaSession.findOne<IMemeArenaSession>({ 
      status: 'Completed' 
    }).sort('-endTime').lean();
  }

  if (!activeSession) {
    throw new Error('No active session found');
  }

  let memes: IMeme[];

  if (activeSession.status === 'Completed' || activeSession.status === 'Contributing') {
    const winnerMeme = await Meme.findById(activeSession.winnerMeme).lean();
    memes = winnerMeme ? [winnerMeme as IMeme] : [];
  } else {
    memes = await Meme.find({ session: activeSession._id }).sort('-totalVotes').lean() as IMeme[];
  }

  const transformedData: MemeArenaData = {
      session: transformSession(activeSession as IMemeArenaSession),
      memes: memes.map(meme => transformMeme(meme as IMeme)),
  };
  
  return transformedData; 
}

// ** Vote for a meme
export async function createMemeVote(createMemeDto: Partial<CreateMemeVoteDto>): Promise<MemeData> {
  await connectToDatabase()
  const sanitized = sanitize(createMemeDto);
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

  sendUpdate({ type: 'vote-update', meme: transformedMeme}); 

  if (updatedMeme.totalVotes === session.votingThreshold && session.status === 'Voting') {
    console.log('Voting threshold reached');
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
 
    sendUpdate({ 
      type: 'voting-threshold-reached',
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

    const timerService = MemeArenaTimerService.getInstance();
    const contributeTimerResult = await timerService.scheduleContributingEnd(
      sessionId, 
      config.contributeFundingLimit
    );

    if (!contributeTimerResult.success) {
      throw new Error('Failed to schedule contributing end');
    }
    const time = contributeTimerResult?.scheduledTime?.getTime();
    let nextSessionStartTime;
    if (time !== undefined) {
     nextSessionStartTime = new Date(time + memeSession.nextSessionDelay);
    }    

    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'Contributing',
        endTime: new Date(now),
        winnerMeme: winnerMeme._id,
        contributeEndTime: contributeTimerResult.scheduledTime,
        nextSessionStartTime,
        lastUpdateTime: now
      },
      { new: true, session }
    );

    await session.commitTransaction();

    if (updatedSession) {
      sendUpdate({ 
        type: 'contributing-started', 
        meme: transformMeme(winnerMeme),
        session: transformSession(updatedSession as IMemeArenaSession),
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
export async function createMemeContribution(createMemeContributionDto: CreateMemeContributionDto) {
  await connectToDatabase();
  const sanitized = sanitize(createMemeContributionDto);
  const now = Date.now();
 
  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();
 
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
      contributorIpAddress: sanitized.contributorIpAddress
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
 
    const newContribution = await MemeContribution.create([{
      ...sanitized,
      createdAt: now
    }], { session: dbSession });
 
    const result = await MemeContribution.aggregate([
      { $match: { session: session._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).session(dbSession);
 
    const totalContributions = result[0]?.total || 0;
    
    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      session._id,
      {
        totalContributions,
        lastUpdateTime: now
      },
      { new: true, session: dbSession }
    );
 
    await dbSession.commitTransaction();
 
    sendUpdate({ 
      type: 'new-contribution', 
      contribution: transformContribution(newContribution[0]), 
      session: transformSession(updatedSession as IMemeArenaSession),
      timestamp: now
    });
 
    return transformContribution(newContribution[0]);
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

    const mintAddress = "00x";
    const timerService = MemeArenaTimerService.getInstance();
    const timerResult = await timerService.scheduleNextSession(sessionId, session.nextSessionDelay);

    if (!timerResult.success) {
      throw new Error('Failed to schedule next session');
    }

    const updatedSession = await MemeArenaSession.findByIdAndUpdate(
      sessionId, 
      { 
        endTime: new Date(),
        status: 'Completed',
        tokenMintAddress: mintAddress,
        nextSessionStartTime: timerResult.scheduledTime
      }, 
      { new: true, session: dbSession }
    );

    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    await dbSession.commitTransaction();

    sendUpdate({ 
      type: 'contributing-ended',
      session: transformSession(updatedSession as IMemeArenaSession)
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
  const activeSession = await MemeArenaSession.findOne({ status: 'Contributing' });
  if (!activeSession || !activeSession.contributeEndTime || new Date() > activeSession.contributeEndTime) {
      return { eligible: false, reason: 'No active contribution session' };
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

  return { eligible: true };

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