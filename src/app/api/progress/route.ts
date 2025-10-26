import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { LogWorkout } from "@/models/workoutlogmodel";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const year = searchParams.get("year");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const workouts = await LogWorkout.find({ userId });

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyCounts: { [key: string]: number } = {};
    monthNames.forEach((month) => {
      monthlyCounts[month] = 0;
    });

    workouts.forEach((workout) => {
      if (!workout.date) return;
      
      const workoutDate = new Date(workout.date);
      
      if (isNaN(workoutDate.getTime())) {
        console.warn(`Invalid date format for workout: ${workout.date}`);
        return;
      }

      if (workoutDate.getFullYear() === currentYear) {
        const monthIndex = workoutDate.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyCounts[monthName]++;
      }
    });

    const data = monthNames.map((month) => ({
      month,
      count: monthlyCounts[month],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}
