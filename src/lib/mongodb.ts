import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess-menu';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface CustomGlobal extends Global {
  mongoose: MongooseCache | undefined;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached = (global as CustomGlobal).mongoose || { conn: null, promise: null };

if (!(global as CustomGlobal).mongoose) {
  (global as CustomGlobal).mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 