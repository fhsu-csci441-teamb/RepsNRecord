import { Schema, models, model } from "mongoose";

const WorkoutDaySchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    exerciseName: { type: String, required: true }, // match frontend
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    intensity: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const WorkoutDay = models.WorkoutDay || model("WorkoutDay", WorkoutDaySchema);
export default WorkoutDay;
