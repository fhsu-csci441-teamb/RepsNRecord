import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";

export async function GET() {
  try {
    await dbConnect();
    const userId = "demo-user";
    const workouts = await WorkoutDay.find({ userId });
    return NextResponse.json(workouts);
  } catch (err) {
    console.error("Error fetching workout days:", err);
    return NextResponse.json({ error: "Failed to fetch workout days" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { userId = "demo-user", date, workoutName, sets, reps, weight, notes, caloriesBurned } = body;

    const existing = await WorkoutDay.findOne({ userId, date });

    if (existing) {
      existing.workoutName = workoutName;
      existing.sets = sets;
      existing.reps = reps;
      existing.weight = weight;
      existing.notes = notes;
      existing.caloriesBurned = caloriesBurned;
      await existing.save();
      return NextResponse.json(existing);
    }

    const newWorkout = new WorkoutDay({
      userId,
      date,
      workoutName,
      sets,
      reps,
      weight,
      notes,
      caloriesBurned,
    });

    await newWorkout.save();
    return NextResponse.json(newWorkout);
  } catch (err) {
    console.error("Error saving workout:", err);
    return NextResponse.json({ error: "Failed to save workout" }, { status: 500 });
  }
}
