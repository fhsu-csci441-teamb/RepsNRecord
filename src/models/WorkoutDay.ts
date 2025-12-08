// written by: Caleb Millender & Honesty Beaton
// designed by: Caleb Millender & Honesty Beaton
// debugged by: Caleb Millender & Honesty Beaton


import mongoose, { Schema, model, models } from "mongoose";

const WorkoutDaySchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    exerciseName: { type: String, required: true }, // matches form input
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev mode (Next.js hot reload)
const WorkoutDay = models.WorkoutDay || model("WorkoutDay", WorkoutDaySchema);

export default WorkoutDay;