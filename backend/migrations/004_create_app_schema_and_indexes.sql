-- Combined migration for RepsNRecord schema updates
-- Adds or updates tables used by the app and creates indexes
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- Ensure pgcrypto extension exists (for UUID gen_random_uuid if used elsewhere)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  weight_unit TEXT DEFAULT 'lbs',
  notifications_enabled BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT false,
  weekly_summary BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If older table exists but missing updated_at, add the column
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles (role);

-- trainer_clients
CREATE TABLE IF NOT EXISTS trainer_clients (
  id SERIAL PRIMARY KEY,
  trainer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_clients_trainer_client_idx') THEN
    CREATE UNIQUE INDEX trainer_clients_trainer_client_idx
    ON trainer_clients (trainer_id, client_id);
  END IF;
END$$;

-- shared_exports
CREATE TABLE IF NOT EXISTS shared_exports (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  export_type TEXT NOT NULL,
  message TEXT,
  data_summary JSONB,
  viewed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS shared_exports_trainer_idx ON shared_exports (trainer_id);

-- connection_requests
CREATE TABLE IF NOT EXISTS connection_requests (
  id SERIAL PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  from_role TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS connection_requests_from_idx ON connection_requests (from_user_id);
CREATE INDEX IF NOT EXISTS connection_requests_to_idx ON connection_requests (to_user_id, status);

-- personal_records
CREATE TABLE IF NOT EXISTS personal_records (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL,
  value INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  bytes INTEGER NOT NULL CHECK (bytes > 0),
  width INTEGER,
  height INTEGER,
  taken_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum_md5 CHAR(32)
);
CREATE INDEX IF NOT EXISTS photos_user_taken_idx ON photos (user_id, taken_at);

-- trainer_permissions
CREATE TABLE IF NOT EXISTS trainer_permissions (
  id SERIAL PRIMARY KEY,
  trainer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  allow_export BOOLEAN NOT NULL DEFAULT true,
  allow_photos BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_permissions_trainer_client_idx') THEN
    CREATE UNIQUE INDEX trainer_permissions_trainer_client_idx
    ON trainer_permissions (trainer_id, client_id);
  END IF;
END$$;

-- Safety: ensure trainer_clients uniqueness index exists
-- This also ensures the inner application behavior which uses trainer_clients lookups.

-- Optionally create any additional indexes for performance: user_preferences.user_id already unique

-- Done.
