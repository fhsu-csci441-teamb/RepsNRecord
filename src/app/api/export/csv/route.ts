import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";
import { query } from "@/lib/postgres";
import { getUserIdFromRequest } from '@/lib/authHelper';

export async function GET(req: Request) {
  try {
    // Auth check: ensure the requester is who they say they are
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const requesterId = searchParams.get("requesterId"); // optional trainer requesting

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // If trainer requester exists, ensure uid === requesterId and role is trainer
    if (requesterId && requesterId !== userId) {
      if (uid !== requesterId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const roleCheck = await query(`SELECT role FROM user_roles WHERE user_id = $1`, [requesterId]);
      if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== "trainer") {
        return NextResponse.json({ error: "Requester is not a trainer" }, { status: 403 });
      }
      const permRes = await query(
        `SELECT allow_export as "allowExport" FROM trainer_permissions WHERE client_id = $1 AND trainer_id = $2`,
        [userId, requesterId]
      );
      const allowExport = permRes.rows.length > 0 ? permRes.rows[0].allowExport : true;
      if (!allowExport) {
        return NextResponse.json({ error: "Client has not granted export permission" }, { status: 403 });
      }
    } else {
      // If no requesterId or a same-user request, require uid === userId
      if (uid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const filter: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const result = await WorkoutDay.find(filter).sort({ date: -1 }).lean();

    const headers = ["Date", "Exercise", "Sets", "Reps", "Weight", "Notes"];
    const csvRows = [headers.join(",")];

    // result is an array of workout documents
    for (const row of result as Array<{ date?: string; exerciseName?: string; exercise_name?: string; sets?: number; reps?: number; weight?: number; notes?: string }>) {
      const exercise = (row.exerciseName || row.exercise_name || "");
      const notes = row.notes || "";
      
      // Format date for Excel - parse ISO string and reformat as MM/DD/YYYY
      let formattedDate = "";
      if (row.date) {
        try {
          const dateObj = new Date(row.date);
          // Format as MM/DD/YYYY which Excel recognizes as a date
          formattedDate = `${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}/${String(dateObj.getUTCDate()).padStart(2, "0")}/${dateObj.getUTCFullYear()}`;
        } catch {
          formattedDate = row.date;
        }
      }
      
      const values = [
        formattedDate,
        `"${exercise.replace(/"/g, '""')}"`,
        // We'll format numeric values plainly (no quotes)
        String(row.sets ?? 0),
        String(row.reps ?? 0),
        String(row.weight ?? 0),
        `"${notes.replace(/"/g, '""')}"`,
      ];
      csvRows.push(values.join(","));
    }

    // Add BOM for proper UTF-8 encoding in Excel
    const csvContent = "\uFEFF" + csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="workouts-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}