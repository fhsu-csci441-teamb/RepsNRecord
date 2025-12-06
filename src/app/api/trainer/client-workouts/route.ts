import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";
import { getUserIdFromRequest } from '@/lib/authHelper';

export async function GET(req: Request) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!trainerId || !clientId) {
      return NextResponse.json(
        { error: "Missing trainerId or clientId" },
        { status: 400 }
      );
    }

    // Only allow the trainer to access their own workouts
    if (uid !== trainerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const roleCheck = await query(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [trainerId]
    );

    if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== "trainer") {
      return NextResponse.json(
        { error: "User is not a trainer" },
        { status: 403 }
      );
    }

    const clientCheck = await query(
      `SELECT status FROM trainer_clients 
       WHERE trainer_id = $1 AND client_id = $2 AND status = 'active'`,
      [trainerId, clientId]
    );

    if (clientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Client is not assigned to this trainer" },
        { status: 403 }
      );
    }

    // Permission check: if trainerId is requesting, ensure permission allows export
    if (trainerId) {
      const permResult = await query(
        `SELECT allow_export as "allowExport" FROM trainer_permissions WHERE client_id = $1 AND trainer_id = $2`,
        [clientId, trainerId]
      );

      const allowExport = permResult.rows.length > 0 ? permResult.rows[0].allowExport : true;
      // default allowExport true if not set (maintain existing behavior)
      if (!allowExport) {
        return NextResponse.json({ error: "Client has not granted export permission" }, { status: 403 });
      }
    }

    // Fetch workouts from MongoDB
    await dbConnect();
    const filter: Record<string, any> = { userId: clientId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    const workoutDocs = await WorkoutDay.find(filter).sort({ date: -1 }).limit(100).lean();
    // Convert _id to id for compatibility
    const workouts = workoutDocs.map((d) => ({ ...d, id: (d as any)._id }));
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching client workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch client workouts" },
      { status: 500 }
    );
  }
}
