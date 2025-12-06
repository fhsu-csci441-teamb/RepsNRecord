#!/usr/bin/env node
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable must be set');
  console.error('Example: DATABASE_URL="postgresql://..." node run_migrations.js');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const migrations = [
  '001_create_photos.sql',
  '002_create_user_preferences.sql',
  '003_create_user_roles.sql',
  '004_create_app_schema_and_indexes.sql',
  '005_seed_demo_users.sql',
  '006_seed_admin_and_demo_data.sql',
  '007_create_trainer_permissions.sql',
  '008_add_email_to_user_preferences.sql',
];

async function runMigrations() {
  try {
    for (const file of migrations) {
      const filePath = path.join(__dirname, 'migrations', file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping missing migration: ${file}`);
        continue;
      }

      console.log(`Applying ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await pool.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    console.log('\n✓ All migrations applied successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
