-- Migration: Create user_preferences table for user settings

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'light',
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  weight_unit TEXT NOT NULL DEFAULT 'lbs',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
