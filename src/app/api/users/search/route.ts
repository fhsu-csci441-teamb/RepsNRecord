import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const searcherId = searchParams.get("searcherId");

    console.log("[Search] Query:", q, "SearcherId:", searcherId);

    if (!q || q.length < 3) {
      console.log("[Search] Query too short, returning empty");
      return NextResponse.json([]);
    }

    const existingClients = await query(
      `SELECT DISTINCT client_id FROM trainer_clients WHERE trainer_id = $1`,
      [searcherId]
    );
    const clientIds = existingClients.rows.map((r: any) => r.client_id);
    console.log("[Search] Existing clients:", clientIds);

    const pendingRequests = await query(
      `SELECT to_user_id FROM connection_requests WHERE from_user_id = $1 AND status = 'pending'`,
      [searcherId]
    );
    const pendingIds = pendingRequests.rows.map((r: any) => r.to_user_id);
    console.log("[Search] Pending requests:", pendingIds);

    const excludeIds = [searcherId, ...clientIds, ...pendingIds];
    console.log("[Search] Will exclude IDs:", excludeIds);

    // First, try to search including email (if column exists)
    // If that fails, fall back to searching without email
    let allUsers;
    try {
      allUsers = await query(
        `SELECT DISTINCT user_id FROM (
          SELECT DISTINCT user_id FROM user_roles 
            WHERE user_id ILIKE $1
          UNION
          SELECT DISTINCT user_id FROM user_preferences 
            WHERE user_id ILIKE $1 OR email ILIKE $1
          UNION
          SELECT DISTINCT user_id FROM photos WHERE user_id ILIKE $1
          UNION
          SELECT DISTINCT from_user_id as user_id FROM connection_requests 
            WHERE from_user_id ILIKE $1
          UNION
          SELECT DISTINCT to_user_id as user_id FROM connection_requests 
            WHERE to_user_id ILIKE $1
        ) combined_users`,
        [`%${q}%`]
      );
      console.log("[Search] Found users (with email):", allUsers.rows);
    } catch (error: any) {
      // If email column doesn't exist yet, search without it
      if (error?.code === '42703') {
        console.log("[Search] Email column missing, falling back to query without email");
        allUsers = await query(
          `SELECT DISTINCT user_id FROM (
            SELECT DISTINCT user_id FROM user_roles 
              WHERE user_id ILIKE $1
            UNION
            SELECT DISTINCT user_id FROM user_preferences 
              WHERE user_id ILIKE $1
            UNION
            SELECT DISTINCT user_id FROM photos WHERE user_id ILIKE $1
            UNION
            SELECT DISTINCT from_user_id as user_id FROM connection_requests 
              WHERE from_user_id ILIKE $1
            UNION
            SELECT DISTINCT to_user_id as user_id FROM connection_requests 
              WHERE to_user_id ILIKE $1
          ) combined_users`,
          [`%${q}%`]
        );
        console.log("[Search] Found users (no email):", allUsers.rows);
      } else {
        throw error;
      }
    }

    const users = allUsers.rows
      .filter((r: any) => !excludeIds.includes(r.user_id))
      .slice(0, 10)
      .map((r: any) => ({
        id: r.user_id,
        displayId: r.user_id.slice(0, 16) + "...",
      }));

    console.log("[Search] Final results after filtering:", users);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json([]);
  }
}