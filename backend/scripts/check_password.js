#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const plain = process.argv[3] || '';
  if (!email || !plain) {
    console.error('Usage: node scripts/check_password.js user@ejemplo.com apellido123');
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
    // Check usuarios (legacy) first
    const [urows] = await pool.query('SELECT id, correo, primer_nombre, primer_apellido, activo, contrasena FROM usuarios WHERE LOWER(correo) = ? LIMIT 1', [email]);
    if (urows[0]) {
      const u = urows[0];
      console.log('Found in `usuarios`');
      console.log({ id: u.id, correo: u.correo, primer_nombre: u.primer_nombre, primer_apellido: u.primer_apellido, activo: u.activo });
      console.log('Stored hash length:', (u.contrasena || '').length);
      const ok = await bcrypt.compare(plain, u.contrasena || '');
      console.log('bcrypt match:', ok);
      process.exit(ok ? 0 : 1);
    }

    // Check normalized users table
    const [nrows] = await pool.query('SELECT id AS Id_usuario, email AS correo, full_name AS nombre, password_hash AS contrasena, is_active FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);
    if (nrows[0]) {
      const n = nrows[0];
      console.log('Found in `users`');
      console.log({ id: n.Id_usuario, correo: n.correo, nombre: n.nombre, is_active: n.is_active });
      console.log('Stored hash length:', (n.contrasena || '').length);
      const ok = await bcrypt.compare(plain, n.contrasena || '');
      console.log('bcrypt match:', ok);
      process.exit(ok ? 0 : 1);
    }

    console.error('User not found in `usuarios` or `users`');
    process.exit(3);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(4);
  } finally {
    await pool.end();
  }
}

main();
