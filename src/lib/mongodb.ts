<<<<<<< HEAD
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/repsnrecord";
=======
// src/lib/mongodb.ts
import mongoose from "mongoose";
>>>>>>> origin/main

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
<<<<<<< HEAD
  throw new Error("⚠️ MONGODB_URI environment variable not set");
}

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
=======
  throw new Error("Missing MONGODB_URI in .env.local");
}

// allow a cached connection in dev to avoid re-connecting on HMR
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = global._mongoose;
if (!cached) {
  cached = { conn: null, promise: null };
  global._mongoose = cached;
}

export async function dbConnect() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI);
    // If you prefer to force a db name instead of putting it in the URI:
    // cached!.promise = mongoose.connect(MONGODB_URI, { dbName: "repsnrecord" });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
>>>>>>> origin/main
