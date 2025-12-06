import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { requireAuth } from "@/lib/auth";
import { getUserIdFromRequest, verifyUserIdMatch } from "@/lib/authHelper";

export async function GET(req: Request) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // 'sent' or 'received'

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ensure requester is accessing their own connection requests
    if (uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let result;
    if (type === "sent") {
      result = await query(
        `SELECT * FROM connection_requests WHERE from_user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      result = await query(
        `SELECT * FROM connection_requests WHERE to_user_id = $1 AND status = 'pending' ORDER BY created_at DESC`,
        [userId]
      );
    }

    const requests = result.rows.map((row: any) => ({
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      fromRole: row.from_role,
      status: row.status,
      message: row.message,
      createdAt: row.created_at,
    }));

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { fromUserId, toUserId, fromRole, message } = await req.json();

    if (!fromUserId || !toUserId || !fromRole) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const uid = await getUserIdFromRequest(req);
    console.log("[Connections POST] uid from request:", uid, "fromUserId from body:", fromUserId);
    
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (uid !== fromUserId) {
      console.log("[Connections POST] Forbidden: uid !== fromUserId");
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await query(
      `SELECT * FROM connection_requests WHERE from_user_id = $1 AND to_user_id = $2 AND status = 'pending'`,
      [fromUserId, toUserId]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Request already sent" }, { status: 400 });
    }

    await query(
      `INSERT INTO connection_requests (from_user_id, to_user_id, from_role, message) VALUES ($1, $2, $3, $4)`,
      [fromUserId, toUserId, fromRole, message || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { requestId, action, userId } = await req.json();

    if (!requestId || !action || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (uid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const request = await query(
      `SELECT * FROM connection_requests WHERE id = $1 AND to_user_id = $2`,
      [requestId, userId]
    );

    if (request.rows.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "accept") {
      await query(`UPDATE connection_requests SET status = 'accepted' WHERE id = $1`, [requestId]);

      const req = request.rows[0];
      await query(
        `INSERT INTO trainer_clients (trainer_id, client_id, status) VALUES ($1, $2, 'active') ON CONFLICT DO NOTHING`,
        [req.from_user_id, req.to_user_id]
      );
      // create a default permission row for this pairing
      await query(
        `INSERT INTO trainer_permissions (trainer_id, client_id, allow_export, allow_photos) VALUES ($1, $2, true, false) ON CONFLICT DO NOTHING`,
        [req.from_user_id, req.to_user_id]
      );
    } else {
      await query(`UPDATE connection_requests SET status = 'declined' WHERE id = $1`, [requestId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}