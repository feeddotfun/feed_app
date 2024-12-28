import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL as string;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  }
  
let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

export const connectToDatabase = async () => {
    if (cached.conn) {
        return cached.conn
    }
    cached.promise = mongoose.connect(MONGODB_URL, {
        dbName: 'feed_fun',
        bufferCommands: true,
        serverSelectionTimeoutMS: 50000,
        socketTimeoutMS: 45000,
        family: 4,        
    })

    cached.conn = await cached.promise
    return cached.conn
}