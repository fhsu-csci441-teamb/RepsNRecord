import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        id,
        user_id as "userId",
        exercise_name as "exerciseName",
        record_type as "recordType",
        value,
        achieved_at as "achievedAt",
        workout_id as "workoutId"
      FROM personal_records 
      WHERE user_id = $1 
      ORDER BY achieved_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching personal records:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal records" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, exerciseName, recordType, value, workoutId } = body;

    if (!userId || !exerciseName || !recordType || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingRecord = await query(
      `SELECT id, value FROM personal_records 
       WHERE user_id = $1 AND exercise_name = $2 AND record_type = $3`,
      [userId, exerciseName, recordType]
    );

    if (existingRecord.rows.length > 0) {
      const currentValue = existingRecord.rows[0].value;
      if (value > currentValue) {
        const result = await query(
          `UPDATE personal_records 
           SET value = $1, achieved_at = NOW(), workout_id = $2, updated_at = NOW()
           WHERE user_id = $3 AND exercise_name = $4 AND record_type = $5
           RETURNING id, user_id as "userId", exercise_name as "exerciseName", 
                     record_type as "recordType", value, achieved_at as "achievedAt"`,
          [value, workoutId, userId, exerciseName, recordType]
        );
        return NextResponse.json({ 
          ...result.rows[0], 
          isNewRecord: true,
          previousValue: currentValue 
        }, { status: 200 });
      }
      return NextResponse.json({ 
        isNewRecord: false, 
        currentRecord: existingRecord.rows[0].value 
      });
    }

    const result = await query(
      `INSERT INTO personal_records (user_id, exercise_name, record_type, value, workout_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", exercise_name as "exerciseName", 
                 record_type as "recordType", value, achieved_at as "achievedAt"`,
      [userId, exerciseName, recordType, value, workoutId]
    );

    return NextResponse.json({ 
      ...result.rows[0], 
      isNewRecord: true,
      isFirstRecord: true 
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving personal record:", error);
    return NextResponse.json(
      { error: "Failed to save personal record" },
      { status: 500 }
    );
  }
}
