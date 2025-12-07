// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Roles API - manages user roles (user/trainer/admin)

import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }

    // Upsert the user role. This is intentionally permissive so developers
    // can assign roles for testing. In production, restrict this operation.
    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role`,
      [userId, role]
    );

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error setting role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}

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
      `SELECT user_id as "userId", role FROM user_roles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ userId, role: "user" });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing userId or role" },
        { status: 400 }
      );
    }

    const validRoles = ["user", "trainer", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be: user, trainer, or admin" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()
       RETURNING user_id as "userId", role`,
      [userId, role]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
