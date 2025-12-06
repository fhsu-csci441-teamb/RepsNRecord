import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const result = await query(
      `SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ role: null });
    }

    return NextResponse.json({ role: result.rows[0].role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
