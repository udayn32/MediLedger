import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose || { conn: null, promise: null };

export async function dbConnect() {
  const uri = process.env.MONGODB_URI as string | undefined;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || 'abha',
    });
  }
  cached.conn = await cached.promise;
  global._mongoose = cached;
  return cached.conn;
}
