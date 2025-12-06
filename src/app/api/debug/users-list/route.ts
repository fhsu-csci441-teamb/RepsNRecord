import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

/**
 * Debug endpoint to list all users in user_roles table
 * Remove this in production!
 */
export async function GET(req: Request) {
  try {
    // Get all users from user_roles
    const result = await query(
      `SELECT user_id, role, created_at, updated_at FROM user_roles ORDER BY created_at DESC LIMIT 50`,
      []
    );

    // Also check user_preferences
    const prefs = await query(
      `SELECT user_id, email, created_at FROM user_preferences ORDER BY created_at DESC LIMIT 50`,
      []
    );

    // Check photos
    const photos = await query(
      `SELECT DISTINCT user_id FROM photos ORDER BY created_at DESC LIMIT 50`,
      []
    );

    return NextResponse.json({
      user_roles: result.rows,
      user_preferences: prefs.rows,
      photos_users: photos.rows,
      counts: {
        user_roles: result.rows.length,
        user_preferences: prefs.rows.length,
        photos_users: photos.rows.length,
      },
    });
  } catch (error) {
    console.error("Error fetching debug data:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data", details: String(error) },
      { status: 500 }
    );
  }
}
