import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createSharedExports() {
  const client = await pool.connect();
  try {
    console.log('Creating shared_exports table...');

    // Create shared_exports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shared_exports (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(255) NOT NULL,
        trainer_id VARCHAR(255) NOT NULL,
        export_type VARCHAR(50) DEFAULT 'summary',
        message TEXT,
        data_summary JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        viewed_at TIMESTAMP
      )
    `);

    console.log('✓ shared_exports table created successfully!');

    // Create index for faster trainer queries
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS shared_exports_trainer_idx ON shared_exports (trainer_id)
      `);
      console.log('✓ Index created successfully!');
    } catch {
      // Index might already exist or table structure is different
      console.log('⚠ Index creation skipped (may already exist)');
    }

    // Verify table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'shared_exports'
      )
    `);

    if (checkResult.rows[0].exists) {
      console.log('✓ Verified: shared_exports table exists');
      
      // Show table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'shared_exports'
        ORDER BY ordinal_position
      `);
      
      console.log('\nTable structure:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('⚠ Warning: Table verification failed');
    }
  } catch (error) {
    console.error('Error creating shared_exports table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createSharedExports();
