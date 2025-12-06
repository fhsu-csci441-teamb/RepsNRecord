#!/usr/bin/env node
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable must be set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const sql = `
-- Create trainer_permissions table
CREATE TABLE IF NOT EXISTS trainer_permissions (
  id SERIAL PRIMARY KEY,
  trainer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  allow_export BOOLEAN DEFAULT true,
  allow_photos BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trainer_id, client_id)
);

CREATE INDEX IF NOT EXISTS trainer_permissions_client_idx ON trainer_permissions (client_id);
CREATE INDEX IF NOT EXISTS trainer_permissions_trainer_idx ON trainer_permissions (trainer_id);
`;

async function createTable() {
  try {
    console.log('Creating trainer_permissions table...');
    await pool.query(sql);
    console.log('✓ trainer_permissions table created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTable();
