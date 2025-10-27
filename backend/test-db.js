// backend/test-db.js
require('dotenv').config();
const { pool } = require('./db');

(async () => {
  try {
    // 1) simple connectivity
    const now = await pool.query('SELECT NOW() AS now');
    console.log('Connected ✅  Server time:', now.rows[0].now);

    // 2) can we see the photos table?
    const cols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'photos'
      ORDER BY ordinal_position
    `);
    console.log('photos columns:', cols.rows);

    // 3) tiny round-trip (no rows expected yet)
    const rows = await pool.query('SELECT COUNT(*) FROM photos');
    console.log('photos row count:', rows.rows[0].count);

    process.exit(0);
  } catch (err) {
    console.error('DB test failed ❌', err);
    process.exit(1);
  }
})();
