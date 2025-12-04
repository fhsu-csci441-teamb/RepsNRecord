// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ MONGODB_URI is not defined in your environment file (.env.local)");
}

// Allow global caching to prevent multiple connections during HMR in dev
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    console.log("✅ MongoDB already connected");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        autoIndex: true,
      })
      .then((mongooseInstance) => {
        console.log("🟢 MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
