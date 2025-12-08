import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, errorType, message, stackTrace, userId, endpoint, method, durationMs, statusCode } = body;

    if (type === "error") {
      await query(
        `INSERT INTO error_logs (error_type, message, stack_trace, user_id, endpoint)
         VALUES ($1, $2, $3, $4, $5)`,
        [errorType || "unknown", message, stackTrace, userId, endpoint]
      );
      return NextResponse.json({ logged: true, type: "error" });
    }

    if (type === "performance") {
      await query(
        `INSERT INTO performance_logs (endpoint, method, duration_ms, status_code, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [endpoint, method, durationMs, statusCode, userId]
      );
      return NextResponse.json({ logged: true, type: "performance" });
    }

    return NextResponse.json({ error: "Invalid log type" }, { status: 400 });
  } catch (error) {
    console.error("Error logging:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "error";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (type === "error") {
      const result = await query(
        `SELECT id, error_type as "errorType", message, stack_trace as "stackTrace", 
                user_id as "userId", endpoint, created_at as "createdAt"
         FROM error_logs 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return NextResponse.json(result.rows);
    }

    if (type === "performance") {
      const result = await query(
        `SELECT id, endpoint, method, duration_ms as "durationMs", 
                status_code as "statusCode", user_id as "userId", created_at as "createdAt"
         FROM performance_logs 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return NextResponse.json(result.rows);
    }

    if (type === "stats") {
      const errorCount = await query(
        `SELECT COUNT(*) as count FROM error_logs WHERE created_at > NOW() - INTERVAL '24 hours'`
      );
      const avgDuration = await query(
        `SELECT AVG(duration_ms) as avg, MAX(duration_ms) as max, MIN(duration_ms) as min 
         FROM performance_logs WHERE created_at > NOW() - INTERVAL '24 hours'`
      );
      const topEndpoints = await query(
        `SELECT endpoint, COUNT(*) as count, AVG(duration_ms) as "avgDuration"
         FROM performance_logs 
         WHERE created_at > NOW() - INTERVAL '24 hours'
         GROUP BY endpoint 
         ORDER BY count DESC 
         LIMIT 10`
      );

      return NextResponse.json({
        errorsLast24h: parseInt(errorCount.rows[0]?.count || "0"),
        performance: {
          avgDurationMs: parseFloat(avgDuration.rows[0]?.avg || "0"),
          maxDurationMs: parseInt(avgDuration.rows[0]?.max || "0"),
          minDurationMs: parseInt(avgDuration.rows[0]?.min || "0"),
        },
        topEndpoints: topEndpoints.rows,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
