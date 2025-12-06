#!/usr/bin/env node
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable must be set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const trainerId = 'rxgmQJYAdJbvvoQbjAaCrEAWmyJ3';

async function checkClients() {
  try {
    console.log('Checking trainer_clients for trainer:', trainerId);
    
    const result = await pool.query(
      'SELECT * FROM trainer_clients WHERE trainer_id = $1',
      [trainerId]
    );
    
    console.log('Found rows:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('✓ No clients found - table is clean!');
    } else {
      console.log('\nCleaning up ALL entries for this trainer...');
      await pool.query('DELETE FROM trainer_clients WHERE trainer_id = $1', [trainerId]);
      console.log('✓ Cleaned up!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkClients();
