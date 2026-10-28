const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    try {
      const check = await client.query(
        "SELECT to_regclass('public.users') AS exists"
      );
      if (!check.rows[0]?.exists) {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✅ Database tables & seed users initialized from schema.sql');
      } else {
        await client.query(`
          ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
          ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'worker', 'customer'));
          ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
        `);
      }
    } catch (initErr) {
      console.error('⚠️ Auto-schema check error:', initErr.message);
    } finally {
      release();
    }
  }
});

module.exports = pool;
