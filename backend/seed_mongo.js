#!/usr/bin/env node

// Backend script to seed MongoDB with demo WorkoutDay for demo_client_1
// Usage: MONGODB_URI="mongodb://..." node backend/seed_mongo.js

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/repsnrecord';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

(async () => {
  try {
    // Import from the project via CJS require: transpile TS at runtime is not available, so use mongoose directly
    const mongoose = require('mongoose');

    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI);
    console.log('Mongo connected');

    // Define a simple schema compatible with src/models/WorkoutDay.ts
    const WorkoutSchema = new mongoose.Schema({
      userId: String,
      date: String,
      exerciseName: String,
      sets: Number,
      reps: Number,
      weight: Number,
      notes: String,
    }, { timestamps: true });

    const Workout = mongoose.models.WorkoutDay || mongoose.model('WorkoutDay', WorkoutSchema);

    // Create a demo WorkoutDay for demo_client_1
    const doc = await Workout.create({
      userId: 'demo_client_1',
      date: new Date().toISOString().split('T')[0],
      exerciseName: 'Demo Squat',
      sets: 3,
      reps: 5,
      weight: 135,
      notes: 'Demo seed workout',
    });

    console.log('Inserted demo workout', doc._id);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed Mongo:', err);
    process.exit(1);
  }
})();
