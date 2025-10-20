// src/app/api/progress/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import { LogWorkout } from "@/models/workoutlogmodel";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const userFromQuery = searchParams.get("userId");
    const userFromCookie = cookies().get("uid")?.value;
    const userId = userFromQuery || userFromCookie;

    if (!yearParam) {
      return NextResponse.json({ error: "Missing year" }, { status: 400 });
    }
    const year = Number(yearParam);
    if (!Number.isInteger(year) || year < 1970 || year > 3000) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (!userId) {
      // If you don't use cookies/sessions, pass ?userId=... from the client.
      return NextResponse.json({ error: "Missing userId" }, { status: 401 });
    }

    // Build filter depending on how `date` is stored in your schema.
    const schemaUsesDateType = true; // <-- set to false if you store date as "YYYY-MM-DD" string

    let monthlyCounts: number[] = new Array(12).fill(0);

    if (schemaUsesDateType) {
      // date is a real Date
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));

      const agg = await LogWorkout.aggregate([
        { $match: { userId, date: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
      ]);

      // _id is 1..12
      for (const row of agg) {
        const idx = (row._id as number) - 1;
        if (idx >= 0 && idx < 12) monthlyCounts[idx] = row.count as number;
      }
    } else {
      // date is "YYYY-MM-DD" string; use regex prefix match
      const prefix = `${year}-`; // matches that year
      const agg = await LogWorkout.aggregate([
        { $match: { userId, date: { $regex: `^${prefix}` } } },
        {
          $project: {
            month: {
              $toInt: { $substr: ["$date", 5, 2] } // "YYYY-MM-DD" -> MM
            }
          }
        },
        { $group: { _id: "$month", count: { $sum: 1 } } }
      ]);

      for (const row of agg) {
        const idx = (row._id as number) - 1; // 1..12 -> 0..11
        if (idx >= 0 && idx < 12) monthlyCounts[idx] = row.count as number;
      }
    }

    const monthly = MONTHS.map((m, i) => ({ month: m, count: monthlyCounts[i] }));
    return NextResponse.json({ monthly });
  } catch (err) {
    console.error("GET /api/progress error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

