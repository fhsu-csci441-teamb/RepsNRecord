import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, periodType } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const validPeriods = ["daily", "weekly", "monthly"];
    const period = validPeriods.includes(periodType) ? periodType : "weekly";

    let dateFormat: string;
    let dateTrunc: string;

    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD";
        dateTrunc = "day";
        break;
      case "monthly":
        dateFormat = "YYYY-MM";
        dateTrunc = "month";
        break;
      default:
        dateFormat = "YYYY-WW";
        dateTrunc = "week";
    }

    const aggregateQuery = `
      INSERT INTO workout_aggregates (user_id, period_type, period_start, total_workouts, total_sets, total_reps, total_weight, exercises_count)
      SELECT 
        user_id,
        $2 as period_type,
        DATE_TRUNC($3, date::date) as period_start,
        COUNT(*) as total_workouts,
        COALESCE(SUM(sets), 0) as total_sets,
        COALESCE(SUM(reps), 0) as total_reps,
        COALESCE(SUM(weight), 0) as total_weight,
        COUNT(DISTINCT exercise_name) as exercises_count
      FROM workout_days
      WHERE user_id = $1
      GROUP BY user_id, DATE_TRUNC($3, date::date)
      ON CONFLICT (user_id, period_type, period_start)
      DO UPDATE SET
        total_workouts = EXCLUDED.total_workouts,
        total_sets = EXCLUDED.total_sets,
        total_reps = EXCLUDED.total_reps,
        total_weight = EXCLUDED.total_weight,
        exercises_count = EXCLUDED.exercises_count,
        updated_at = NOW()
    `;

    await query(aggregateQuery, [userId, period, dateTrunc]);

    const result = await query(
      `SELECT 
        period_type as "periodType",
        period_start as "periodStart",
        total_workouts as "totalWorkouts",
        total_sets as "totalSets",
        total_reps as "totalReps",
        total_weight as "totalWeight",
        exercises_count as "exercisesCount"
      FROM workout_aggregates 
      WHERE user_id = $1 AND period_type = $2
      ORDER BY period_start DESC
      LIMIT 12`,
      [userId, period]
    );

    return NextResponse.json({
      message: "Aggregation completed",
      periodType: period,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error running aggregation:", error);
    return NextResponse.json(
      { error: "Failed to run aggregation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const periodType = searchParams.get("periodType") || "weekly";

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        period_type as "periodType",
        period_start as "periodStart",
        total_workouts as "totalWorkouts",
        total_sets as "totalSets",
        total_reps as "totalReps",
        total_weight as "totalWeight",
        exercises_count as "exercisesCount"
      FROM workout_aggregates 
      WHERE user_id = $1 AND period_type = $2
      ORDER BY period_start DESC
      LIMIT 52`,
      [userId, periodType]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching aggregates:", error);
    return NextResponse.json(
      { error: "Failed to fetch aggregates" },
      { status: 500 }
    );
  }
}
