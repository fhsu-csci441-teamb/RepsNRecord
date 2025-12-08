import { NextResponse } from "next/server";
import WorkoutDay from "@/models/WorkoutDay";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userId = req.headers.get("userId") || "demo-user";

    const workouts = await WorkoutDay.find({ userId }).sort({ date: 1 });

    if (workouts.length === 0) {
      return NextResponse.json({
        streak: { currentStreak: 0, longestStreak: 0 },
        streakDays: []
      });
    }

    let current = 1;
    let longest = 1;
    const streakDates: string[] = [workouts[0].date];

    for (let i = 1; i < workouts.length; i++) {
      const prev = new Date(workouts[i - 1].date);
      const curr = new Date(workouts[i].date);

      const diffDays =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        current++;
        streakDates.push(workouts[i].date);
        if (current > longest) longest = current;
      } else {
        current = 1;
        streakDates.push(workouts[i].date);
      }
    }

    return NextResponse.json({
      streak: {
        currentStreak: current,
        longestStreak: longest
      },
      streakDays: streakDates
    });

  } catch (error) {
    console.error("Streak API Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate streak" },
      { status: 500 }
    );
  }
}
