// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu

import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

/**
 * Debug endpoint to check if a user exists in the database
 * Usage: GET /api/debug/check-user?userId=abc123
 */
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

    console.log("[Check User] Looking for:", userId);

    // Check user_roles
    const userRoles = await query(
      `SELECT user_id, role, created_at FROM user_roles WHERE user_id = $1`,
      [userId]
    );

    // Check user_preferences
    const userPrefs = await query(
      `SELECT user_id, email, created_at FROM user_preferences WHERE user_id = $1`,
      [userId]
    );

    // Check photos
    const userPhotos = await query(
      `SELECT DISTINCT user_id, COUNT(*) as photo_count FROM photos WHERE user_id = $1 GROUP BY user_id`,
      [userId]
    );

    // Test search query directly
    const searchTest = await query(
      `SELECT DISTINCT user_id FROM (
        SELECT DISTINCT user_id FROM user_roles 
          WHERE user_id ILIKE $1
        UNION
        SELECT DISTINCT user_id FROM user_preferences 
          WHERE user_id ILIKE $1
      ) combined_users`,
      [`%${userId}%`]
    );

    return NextResponse.json({
      userId,
      found: {
        user_roles: userRoles.rows.length > 0,
        user_preferences: userPrefs.rows.length > 0,
        photos: userPhotos.rows.length > 0,
      },
      data: {
        user_roles: userRoles.rows,
        user_preferences: userPrefs.rows,
        photos: userPhotos.rows,
        search_result: searchTest.rows,
      },
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user", details: String(error) },
      { status: 500 }
    );
  }
}
