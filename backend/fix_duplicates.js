#!/usr/bin/env node
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable must be set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const sql = `
-- Fix trainer_clients table duplicates and add unique constraint

-- Step 1: Remove duplicate entries, keeping only the oldest one for each trainer-client pair
DELETE FROM trainer_clients
WHERE id NOT IN (
  SELECT MIN(id)
  FROM trainer_clients
  GROUP BY trainer_id, client_id
);

-- Step 2: Create unique index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_clients_trainer_client_idx') THEN
    CREATE UNIQUE INDEX trainer_clients_trainer_client_idx
    ON trainer_clients (trainer_id, client_id);
  END IF;
END$$;

-- Verify the fix
SELECT 
  trainer_id, 
  client_id, 
  COUNT(*) as count 
FROM trainer_clients 
GROUP BY trainer_id, client_id 
HAVING COUNT(*) > 1;
`;

async function fixDuplicates() {
  try {
    console.log('Fixing trainer_clients duplicates and adding unique constraint...');
    const result = await pool.query(sql);
    console.log('✓ Fix applied successfully!');
    
    if (result.rows && result.rows.length > 0) {
      console.log('⚠ Warning: Still found duplicates:', result.rows);
    } else {
      console.log('✓ No duplicates found - table is clean!');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDuplicates();
