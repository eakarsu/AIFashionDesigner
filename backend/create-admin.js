'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') {
    throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  }
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator').trim();
  if (!email || password.length < 12) {
    throw new Error('Admin email and a 12+ character password are required');
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET
       password = EXCLUDED.password,
       name = EXCLUDED.name,
       role = EXCLUDED.role`,
    [email, hash, name]
  );
  console.log('Administrator provisioned.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
