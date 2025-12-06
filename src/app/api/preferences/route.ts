import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { getUserIdFromRequest } from "@/lib/authHelper";

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
      `SELECT 
        user_id as "userId",
        theme,
        notifications_enabled as "notificationsEnabled",
        email_reminders as "emailReminders",
        weekly_summary as "weeklySummary",
        weight_unit as "weightUnit"
      FROM user_preferences 
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      const defaultPrefs = {
        userId,
        theme: "light",
        notificationsEnabled: true,
        emailReminders: false,
        weeklySummary: true,
        weightUnit: "lbs",
      };
      return NextResponse.json(defaultPrefs);
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const uid = await getUserIdFromRequest(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { userId, email, theme, notificationsEnabled, emailReminders, weeklySummary, weightUnit } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Verify user can only save their own preferences
    if (uid !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot modify other users' preferences" },
        { status: 403 }
      );
    }

    const result = await query(
      `INSERT INTO user_preferences (user_id, theme, notifications_enabled, email_reminders, weekly_summary, weight_unit)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         theme = EXCLUDED.theme,
         notifications_enabled = EXCLUDED.notifications_enabled,
         email_reminders = EXCLUDED.email_reminders,
         weekly_summary = EXCLUDED.weekly_summary,
         weight_unit = EXCLUDED.weight_unit
       RETURNING 
         user_id as "userId",
         theme,
         notifications_enabled as "notificationsEnabled",
         email_reminders as "emailReminders",
         weekly_summary as "weeklySummary",
         weight_unit as "weightUnit"`,
      [
        userId,
        theme || "light",
        notificationsEnabled ?? true,
        emailReminders ?? false,
        weeklySummary ?? true,
        weightUnit || "lbs",
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
