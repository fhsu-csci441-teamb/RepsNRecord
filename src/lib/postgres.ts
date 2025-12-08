import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS personal_records (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      record_type TEXT NOT NULL,
      value INTEGER NOT NULL,
      achieved_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      theme TEXT DEFAULT 'light',
      weight_unit TEXT DEFAULT 'lbs',
      notifications_enabled BOOLEAN DEFAULT true,
      email_reminders BOOLEAN DEFAULT false,
      weekly_summary BOOLEAN DEFAULT true
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user'
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS trainer_clients (
      id SERIAL PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Permissions that clients can set for trainers
  await query(`
    CREATE TABLE IF NOT EXISTS trainer_permissions (
      id SERIAL PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      allow_export BOOLEAN NOT NULL DEFAULT true,
      allow_photos BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_permissions_trainer_client_idx') THEN
        CREATE UNIQUE INDEX trainer_permissions_trainer_client_idx
        ON trainer_permissions (trainer_id, client_id);
      END IF;
    END$$;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS shared_exports (
      id SERIAL PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      export_type TEXT NOT NULL,
      message TEXT,
      data_summary TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS connection_requests (
      id SERIAL PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      from_role TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export default pool;