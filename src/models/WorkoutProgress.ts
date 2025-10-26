import mongoose, { Schema, models } from "mongoose";

const WorkoutProgressSchema = new Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  calories: { type: Number, default: 0 },
  workouts: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
});

const WorkoutProgress =
  models.WorkoutProgress || mongoose.model("WorkoutProgress", WorkoutProgressSchema);

export default WorkoutProgress;