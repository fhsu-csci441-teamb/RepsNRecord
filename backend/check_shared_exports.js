import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkSharedExports() {
  const client = await pool.connect();
  try {
    console.log('Checking shared_exports table...\n');

    // Check if table exists
    const existsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'shared_exports'
      )
    `);

    if (!existsResult.rows[0].exists) {
      console.log('❌ Table does NOT exist');
      return;
    }

    console.log('✓ Table exists\n');

    // Show table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'shared_exports'
      ORDER BY ordinal_position
    `);
    
    console.log('Table structure:');
    columnsResult.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(30)} ${nullable}${defaultVal}`);
    });

    // Check for any existing records
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM shared_exports
    `);

    console.log(`\nCurrent records: ${countResult.rows[0].count}`);

    // Check indexes
    const indexResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'shared_exports'
    `);

    console.log('\nIndexes:');
    if (indexResult.rows.length === 0) {
      console.log('  (none)');
    } else {
      indexResult.rows.forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
    }

  } catch (error) {
    console.error('Error checking shared_exports table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSharedExports();
