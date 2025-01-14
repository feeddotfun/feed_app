import mongoose, { Mongoose } from 'mongoose';

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
        return null;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (cached.conn) {
        return cached.conn;
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'feed_fun',
        bufferCommands: true,
        serverSelectionTimeoutMS: 50000,
        socketTimeoutMS: 45000,
        family: 4,
    });

    cached.conn = await cached.promise;
    return cached.conn;
};