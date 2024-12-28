'use server'

// ** DB
import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import { connectToDatabase } from "../database/mongoose";
import MemeArenaSession from "../database/models/meme-arena-session.model";
import Meme from '../database/models/meme.model';
import SystemConfig from "../database/models/system-config.model";

// ** SSE
import { sendUpdate } from "./sse";

// ** Utils
import { transformMeme, transformSession } from "../utils";
import { CreateMemeDto, MemeArenaData, MemeData } from "@/types";
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