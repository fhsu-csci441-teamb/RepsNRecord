import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");

    if (!trainerId) {
      return NextResponse.json(
        { error: "Missing trainerId parameter" },
        { status: 400 }
      );
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

    const result = await query(
      `SELECT 
        tc.client_id as "clientId",
        tc.status,
        tc.created_at as "addedAt"
      FROM trainer_clients tc
      WHERE tc.trainer_id = $1 AND tc.status = 'active'
      ORDER BY tc.created_at DESC`,
      [trainerId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching trainer clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trainerId, clientId } = body;

    if (!trainerId || !clientId) {
      return NextResponse.json(
        { error: "Missing trainerId or clientId" },
        { status: 400 }
      );
    }

    const { getUserIdFromRequest } = await import('@/lib/authHelper');
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (uid !== trainerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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

    const result = await query(
      `INSERT INTO trainer_clients (trainer_id, client_id, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (trainer_id, client_id) 
       DO UPDATE SET status = 'active'
       RETURNING trainer_id as "trainerId", client_id as "clientId", status`,
      [trainerId, clientId]
    );

    // Ensure a default permission record exists: by default allow_export=true, allow_photos=false
    await query(
      `INSERT INTO trainer_permissions (trainer_id, client_id, allow_export, allow_photos)
       VALUES ($1, $2, true, false)
       ON CONFLICT (trainer_id, client_id) DO NOTHING`,
      [trainerId, clientId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding client:", error);
    return NextResponse.json(
      { error: "Failed to add client" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");
    const clientId = searchParams.get("clientId");

    if (!trainerId || !clientId) {
      return NextResponse.json(
        { error: "Missing trainerId or clientId" },
        { status: 400 }
      );
    }

    const { getUserIdFromRequest } = await import('@/lib/authHelper');
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (uid !== trainerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await query(
      `UPDATE trainer_clients SET status = 'inactive' 
       WHERE trainer_id = $1 AND client_id = $2`,
      [trainerId, clientId]
    );

    return NextResponse.json({ message: "Client removed successfully" });
  } catch (error) {
    console.error("Error removing client:", error);
    return NextResponse.json(
      { error: "Failed to remove client" },
      { status: 500 }
    );
  }
}
