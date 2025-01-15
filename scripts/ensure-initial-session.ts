import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/database/mongoose';
import MemeArenaSession from '../lib/database/models/meme-arena-session.model';
import { startNewArenaSession } from '../lib/actions/meme-arena.action';

async function ensureInitialSession() {
    try {
      await connectToDatabase();
      
      const totalSessions = await MemeArenaSession.countDocuments();
  
      if (totalSessions === 0) {
        console.log('No sessions or memes found. Creating initial session...');
        await startNewArenaSession();
        console.log('Initial session created successfully.');
      } else {
        console.log('Existing sessions and memes found.');
      }
    } catch (error) {
      console.error('Error ensuring initial session:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
    }
  }
  
  ensureInitialSession().catch(console.error);