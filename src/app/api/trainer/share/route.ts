import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, exportType, message } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }

    const trainerResult = await query(
      `SELECT trainer_id FROM trainer_clients 
       WHERE client_id = $1 AND status = 'active'
       LIMIT 1`,
      [clientId]
    );

    if (trainerResult.rows.length === 0) {
      return NextResponse.json(
        { error: "You don't have an assigned trainer" },
        { status: 404 }
      );
    }

    const trainerId = trainerResult.rows[0].trainer_id;

    await dbConnect();
    const workoutCountDocs = await WorkoutDay.countDocuments({ userId: clientId });
    const photoCount = await query(
      `SELECT COUNT(*) as count FROM photos WHERE user_id = $1`,
      [clientId]
    );
    const recentWorkoutsDocs = await WorkoutDay.find({ userId: clientId }).sort({ date: -1, createdAt: -1 }).limit(10).lean();
    const workoutCount = { rows: [{ count: String(workoutCountDocs) }] };
    const recentWorkouts = { rows: recentWorkoutsDocs };

    const dataSummary = {
      totalWorkouts: parseInt(workoutCount.rows[0]?.count || "0"),
      totalPhotos: parseInt(photoCount.rows[0]?.count || "0"),
      recentWorkouts: recentWorkouts.rows,
      sharedAt: new Date().toISOString(),
    };

    await query(
      `INSERT INTO shared_exports (from_user_id, to_user_id, export_type, message, data_summary)
       VALUES ($1, $2, $3, $4, $5)`,
      [clientId, trainerId, exportType || "summary", message || null, JSON.stringify(dataSummary)]
    );

    return NextResponse.json({
      success: true,
      message: "Your progress has been shared with your trainer!",
      trainerId,
    });
  } catch (error) {
    console.error("Error sharing with trainer:", error);
    return NextResponse.json(
      { error: "Failed to share with trainer" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");
    const role = searchParams.get("role");

    if (role === "trainer" && visitorId) {
      const result = await query(
        `SELECT 
          se.id,
          se.from_user_id as "clientId",
          se.export_type as "exportType",
          se.message,
          se.data_summary as "dataSummary",
          se.created_at as "createdAt",
          se.is_read as "viewedAt"
         FROM shared_exports se
         WHERE se.to_user_id = $1
         ORDER BY se.created_at DESC
         LIMIT 50`,
        [visitorId]
      );
      return NextResponse.json(result.rows);
    }

    if (visitorId) {
      const result = await query(
        `SELECT trainer_id as "trainerId" 
         FROM trainer_clients 
         WHERE client_id = $1 AND status = 'active'
         LIMIT 1`,
        [visitorId]
      );

      if (result.rows.length > 0) {
        return NextResponse.json({ hasTrainer: true, trainerId: result.rows[0].trainerId });
      }
      return NextResponse.json({ hasTrainer: false });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error checking trainer:", error);
    return NextResponse.json(
      { error: "Failed to check trainer status" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { exportId, trainerId } = body;

    if (!exportId || !trainerId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await query(
      `UPDATE shared_exports 
       SET is_read = true 
       WHERE id = $1 AND to_user_id = $2`,
      [exportId, trainerId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking as viewed:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
