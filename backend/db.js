const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // <-- force backend/.env
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD, // must be a string
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE
});

module.exports = { pool };
