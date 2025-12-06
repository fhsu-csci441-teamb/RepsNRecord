import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";

export async function GET() {
  console.log("✅ /api/monthly-summary hit");
  try {
    await dbConnect();
    console.log("✅ MongoDB connected");

    const userId = "demo-user";

    // Fetch all workouts
    const workouts = await WorkoutDay.find({ userId });

    if (!workouts || workouts.length === 0) {
      console.log("No workouts found.");
      return NextResponse.json([]);
    }

    // Group workouts by month (e.g. "2025-10")
    const summary = workouts.reduce((acc: any, workout: any) => {
      const month = workout.date.slice(0, 7); // "YYYY-MM"
      if (!acc[month]) {
        acc[month] = {
          month,
          totalWorkouts: 0,
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
        };
      }

      acc[month].totalWorkouts += 1;
      acc[month].totalSets += workout.sets || 0;
      acc[month].totalReps += workout.reps || 0;
      acc[month].totalWeight += workout.weight || 0;

      return acc;
    }, {});

    // Convert grouped object into an array
    const summaryArray = Object.values(summary);

    // Compute average weight per workout
    const result = summaryArray.map((m: any) => ({
      month: m.month,
      totalWorkouts: m.totalWorkouts,
      totalSets: m.totalSets,
      totalReps: m.totalReps,
      averageWeight: m.totalWorkouts > 0
        ? Math.round(m.totalWeight / m.totalWorkouts)
        : 0,
    }));

    console.log("✅ Monthly summary generated successfully");
    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Error generating monthly summary:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly summary" },
      { status: 500 }
    );
  }
}
