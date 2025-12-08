// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Progress API - fetches monthly workout counts for authenticated user

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";

export async function GET(req: Request) {
  try {
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

    await dbConnect();
    // Limit the query to the requested year for performance
    const start = `${currentYear}-01-01`;
    const end = `${currentYear + 1}-01-01`;
    const result = await WorkoutDay.find({
      userId,
      date: { $gte: start, $lt: end },
    })
      .select("date")
      .lean();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyCounts: { [key: string]: number } = {};
    monthNames.forEach((month) => {
      monthlyCounts[month] = 0;
    });

    // Postgres returned rows; with Mongo we have an array of documents
    result.forEach((workout: { date: string }) => {
      if (!workout?.date) return;

      const workoutDate = new Date(workout.date);
      
      if (isNaN(workoutDate.getTime())) {
        console.warn(`Invalid date format for workout: ${workout.date}`);
        return;
      }

      if (workoutDate.getUTCFullYear() === currentYear) {
        const monthIndex = workoutDate.getUTCMonth();
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