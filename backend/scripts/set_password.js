#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/set_password.js (--id ID | --email email) newPassword');
    process.exit(2);
  }

  let identifier = null;
  let value = null;
  let password = null;

  if (args[0] === '--id') {
    identifier = 'id'; value = args[1]; password = args[2];
  } else if (args[0] === '--email') {
    identifier = 'email'; value = args[1]; password = args[2];
  } else {
    // fallback: allow `node set_password.js 11047 password`
    identifier = 'id'; value = args[0]; password = args[1];
  }

  if (!value || !password) {
    console.error('Missing value or password');
    process.exit(2);
  }

  const pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sgturnos_empresas',
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    const hash = await bcrypt.hash(password, 10);
    let res;
    if (identifier === 'id') {
      res = await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, value]);
    } else {
      res = await pool.query('UPDATE usuarios SET contrasena = ? WHERE LOWER(correo) = LOWER(?)', [hash, value]);
    }
    const result = res[0];
    console.log('Rows affected:', result.affectedRows);
    if (result.affectedRows) console.log('Password updated successfully.');
    else console.log('No matching user found or no change made.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error setting password:', err.message || err);
    process.exit(1);
  }
}

main();
