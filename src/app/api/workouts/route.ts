import { NextResponse } from "next/server";
import mongoose from "mongoose";
import WorkoutDay from "@/models/WorkoutDay";

// ✅ Connect to MongoDB
async function connectMongo() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connected");
  }
}

// ✅ GET: Fetch all workouts
export async function GET() {
  try {
    await connectMongo();
    const workouts = await WorkoutDay.find();
    return NextResponse.json(workouts, { status: 200 });
  } catch (err) {
    console.error("Error fetching workouts:", err);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

// ✅ POST: Create a new workout
export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { userId, date, exerciseName, sets, reps, weight } = body;

    if (!userId || !date || !exerciseName || !sets || !reps) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newWorkout = await WorkoutDay.create({
      userId,
      date,
      exerciseName,
      sets,
      reps,
      weight,
    });

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (err) {
    console.error("Error saving workout:", err);
    return NextResponse.json({ error: "Failed to save workout" }, { status: 500 });
  }
}

// ✅ DELETE: Remove a workout by ID
export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing workout ID" }, { status: 400 });
    }

    const deleted = await WorkoutDay.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workout deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting workout:", err);
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}
