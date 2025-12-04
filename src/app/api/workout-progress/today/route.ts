import mongoose, { Schema, models } from "mongoose";

const WorkoutDaySchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    exerciseName: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    intensity: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const WorkoutDay =
  models.WorkoutDay || mongoose.model("WorkoutDay", WorkoutDaySchema);

export default WorkoutDay;
