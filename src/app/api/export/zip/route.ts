// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Export ZIP API - creates ZIP archive with workout logs and photos

import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { getUserIdFromRequest } from '@/lib/authHelper';
import archiver from "archiver";
import { dbConnect } from "@/lib/mongodb";
import WorkoutDay from "@/models/WorkoutDay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fetchPhoto(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

function getFileExtension(url: string, mimeType?: string): string {
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("gif")) return "gif";
  if (mimeType?.includes("webp")) return "webp";
  const urlLower = url.toLowerCase();
  if (urlLower.includes(".png")) return "png";
  if (urlLower.includes(".gif")) return "gif";
  if (urlLower.includes(".webp")) return "webp";
  return "jpg";
}

export async function GET(req: Request) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includePhotos = searchParams.get("includePhotos") !== "false";
    const requesterId = searchParams.get("requesterId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Only allow client to export their own data, or trainer if they are requesterId
    if (uid !== userId && uid !== requesterId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch workouts from MongoDB (workouts are stored in the WorkoutDay model)
    await dbConnect();

    // Build query filter for date range
    const workoutFilter: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      workoutFilter.date = {};
      if (startDate) workoutFilter.date.$gte = startDate;
      if (endDate) workoutFilter.date.$lte = endDate;
    }
    const workoutDocs = await WorkoutDay.find(workoutFilter as any).sort({ date: -1 }).lean();

    let photoSql = `
      SELECT 
        id,
        file_url as "fileUrl",
        thumb_url as "thumbUrl",
        mime_type as "mimeType",
        description,
        taken_at as "takenAt",
        created_at as "createdAt"
      FROM photos 
      WHERE user_id = $1
    `;
    const photoParams: any[] = [userId];

    if (startDate) {
      photoParams.push(startDate);
      photoSql += ` AND DATE(taken_at) >= $${photoParams.length}`;
    }
    if (endDate) {
      photoParams.push(endDate);
      photoSql += ` AND DATE(taken_at) <= $${photoParams.length}`;
    }
    photoSql += " ORDER BY taken_at DESC LIMIT 100";

    // Handle permission checks: if trainer requester, ensure they have export permission
    if (requesterId && requesterId !== userId) {
      if (uid !== requesterId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const roleCheck = await query(`SELECT role FROM user_roles WHERE user_id = $1`, [requesterId]);
      if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== "trainer") {
        return NextResponse.json({ error: "Requester is not a trainer" }, { status: 403 });
      }
      const permRes = await query(
        `SELECT allow_export as "allowExport", allow_photos as "allowPhotos" FROM trainer_permissions WHERE client_id = $1 AND trainer_id = $2`,
        [userId, requesterId]
      );
      const allowExport = permRes.rows.length > 0 ? permRes.rows[0].allowExport : true;
      const allowPhotos = permRes.rows.length > 0 ? permRes.rows[0].allowPhotos : false;
      if (!allowExport) {
        return NextResponse.json({ error: "Client has not granted export permission" }, { status: 403 });
      }
      if (includePhotos && !allowPhotos) {
        // we will set effectiveIncludePhotos later
      }
    } else {
      // No trainer requester, ensure the user is the client
      if (uid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const photoResult = await query(photoSql, photoParams);

    const workoutHeaders = ["Date", "Exercise", "Sets", "Reps", "Weight", "Notes"];
    const workoutRows = [workoutHeaders.join(",")];
    for (const row of workoutDocs as Array<{ date?: string; exerciseName?: string; exercise_name?: string; sets?: number; reps?: number; weight?: number; notes?: string }>) {
      const values = [
        row.date,
        `"${(row.exerciseName || row.exercise_name || "").replace(/"/g, '""')}"`,
        row.sets,
        row.reps,
        row.weight || 0,
        `"${(row.notes || "").replace(/"/g, '""')}"`,
      ];
      workoutRows.push(values.join(","));
    }
    const workoutCsv = workoutRows.join("\n");

    const chunks: Uint8Array[] = [];
    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("data", (chunk) => chunks.push(chunk));

    const archiveFinished = new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    archive.append(workoutCsv, { name: "workouts.csv" });

    const photoManifest: string[] = ["Photo ID,Filename,Date Taken,Description,Original URL,Status"];
    let downloadedCount = 0;
    let failedCount = 0;

    // effective include photos: allow only if client requested includePhotos and permission allows it (for trainer requester)
    let effectiveIncludePhotos = includePhotos;
    if (requesterId && requesterId !== userId) {
      // if trainer is requesting and permissions disallow photos, ensure it's false (handled above)
      const permRes2 = await query(
        `SELECT allow_photos as "allowPhotos" FROM trainer_permissions WHERE client_id = $1 AND trainer_id = $2`,
        [userId, requesterId]
      );
      const allowPhotos2 = permRes2.rows.length > 0 ? permRes2.rows[0].allowPhotos : false;
      if (!allowPhotos2) effectiveIncludePhotos = false;
    }

    if (effectiveIncludePhotos && photoResult.rows.length > 0) {
      for (const photo of photoResult.rows) {
        if (!photo.fileUrl) {
          failedCount++;
          continue;
        }

        const takenDate = photo.takenAt 
          ? new Date(photo.takenAt).toISOString().split("T")[0] 
          : "unknown-date";
        const ext = getFileExtension(photo.fileUrl, photo.mimeType);
        const filename = `${takenDate}_${photo.id.slice(0, 8)}.${ext}`;

        const photoBuffer = await fetchPhoto(photo.fileUrl);
        
        if (photoBuffer) {
          archive.append(photoBuffer, { name: `photos/${filename}` });
          downloadedCount++;
          photoManifest.push([
            photo.id,
            filename,
            takenDate,
            `"${(photo.description || "").replace(/"/g, '""')}"`,
            photo.fileUrl,
            "included"
          ].join(","));
        } else {
          failedCount++;
          photoManifest.push([
            photo.id,
            "",
            takenDate,
            `"${(photo.description || "").replace(/"/g, '""')}"`,
            photo.fileUrl,
            "failed - see URL"
          ].join(","));
        }
      }
    }

    archive.append(photoManifest.join("\n"), { name: "photos-manifest.csv" });

    const readmeTxt = `RepsNRecord Data Export
========================
Generated: ${new Date().toISOString()}

This export contains:
- workouts.csv: Your workout log data (${workoutDocs.length} entries)
- photos-manifest.csv: Photo listing with details
- photos/: Your progress photos (${downloadedCount} downloaded${failedCount > 0 ? `, ${failedCount} failed` : ""})

${failedCount > 0 ? `Note: ${failedCount} photos couldn't be downloaded. Check the URLs in photos-manifest.csv to view them online.` : ""}
`;
    archive.append(readmeTxt, { name: "README.txt" });

    archive.finalize();
    await archiveFinished;

    const zipBuffer = Buffer.concat(chunks);
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="repsnrecord-export-${dateStr}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting ZIP:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
