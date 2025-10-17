// lib/mongodb.ts
import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {

    try{
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }

    if (cached.conn)
    {
        return cached.conn;
    }
    
    if (!cached.promise) 
    {
         cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    }
    
    cached.com = await cached.promise;
    return cached.conn;
}

export { dbConnect };