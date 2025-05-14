import mongoose from 'mongoose';

// Skip MongoDB connection during build
const isNextBuild = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

// Log environment for debugging (not in production)
if (!isProduction) {
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isNextBuild,
    isVercel,
    isProduction,
    hasMongoDB: !!MONGODB_URI,
  });
}

// Only throw an error if we're not in build phase and MongoDB URI is missing
if (!MONGODB_URI && !isNextBuild) {
  console.error('MongoDB URI is missing');
  if (!isVercel) {
    // Only throw in development to prevent production crashes
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local or .env.production'
    );
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the type for the cached mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null | { connection: { readyState: number } };
  promise: Promise<typeof mongoose | { connection: { readyState: number } }> | null;
}

// Add mongoose to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Use the global mongoose cache
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Initialize the cache if it doesn't exist
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  // Return a mock connection during build
  if (isNextBuild) {
    return { connection: { readyState: 1 } };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Add connection timeout
      serverSelectionTimeoutMS: 5000,
      // Add retry mechanism
      retryWrites: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        // Return a mock connection on error to prevent app crashes
        return { connection: { readyState: 0 } };
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error resolving MongoDB connection:', error);
    // Return a mock connection on error to prevent app crashes
    return { connection: { readyState: 0 } };
  }
}

export default dbConnect;
