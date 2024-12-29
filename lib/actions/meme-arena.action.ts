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
import { transformMeme, transformSession } from "../utils";

// ** Types
import { CreateMemeDto, CreateMemeVoteDto, MemeArenaData, MemeData } from "@/types";
import { IMeme, IMemeArenaSession } from "../database/types";


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