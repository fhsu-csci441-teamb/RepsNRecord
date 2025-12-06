import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { getUserIdFromRequest } from '@/lib/authHelper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const trainerId = searchParams.get("trainerId");

    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId parameter" }, { status: 400 });
    }

    let sql = `SELECT trainer_id as "trainerId", allow_export as "allowExport", allow_photos as "allowPhotos", created_at as "createdAt", updated_at as "updatedAt" FROM trainer_permissions WHERE client_id = $1`;
    const params: any[] = [clientId];
    if (trainerId) {
      params.push(trainerId);
      sql += ` AND trainer_id = $${params.length}`;
    }
    sql += " ORDER BY created_at DESC";

    const uid = await getUserIdFromRequest(req);
    // If requester is trainer and matches trainerId param or client requests his own permissions
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // If trainerId specified, ensure uid === trainerId OR uid === clientId (client can list their perms)
    if (trainerId && uid !== trainerId && uid !== clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching trainer permissions:", error);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { clientId, trainerId, allowExport, allowPhotos } = body;
    if (!clientId || !trainerId) {
      return NextResponse.json({ error: "Missing clientId or trainerId" }, { status: 400 });
    }

    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Only the client himself can update permissions for their clientId
    if (uid !== clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await query(
      `INSERT INTO trainer_permissions (trainer_id, client_id, allow_export, allow_photos, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (trainer_id, client_id)
       DO UPDATE SET allow_export = $3, allow_photos = $4, updated_at = NOW()
       RETURNING trainer_id as "trainerId", client_id as "clientId", allow_export as "allowExport", allow_photos as "allowPhotos"`,
      [trainerId, clientId, !!allowExport, !!allowPhotos]
    );

    return NextResponse.json(result.rows[0] || { success: true });
  } catch (error) {
    console.error("Error updating trainer permissions:", error);
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const trainerId = searchParams.get("trainerId");

    if (!clientId || !trainerId) {
      return NextResponse.json({ error: "Missing clientId or trainerId" }, { status: 400 });
    }

    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (uid !== clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await query(`DELETE FROM trainer_permissions WHERE client_id = $1 AND trainer_id = $2`, [clientId, trainerId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing permission:", error);
    return NextResponse.json({ error: "Failed to delete permission" }, { status: 500 });
  }
}
