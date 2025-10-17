import mongoose, {Schema, models, model } from "mongoose";

const workoutSchema = new Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  exerciseName: String,
  bodyPart: String,
  intensity: Number,
  sets: Number,
  reps: Number,
});

export const LogWorkout = models.LogWorkout || model("LogWorkout", workoutSchema);
