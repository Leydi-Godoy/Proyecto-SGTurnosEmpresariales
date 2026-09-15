#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'sgturnos_empresariales',
      waitForConnections: true,
      connectionLimit: 10,
    });

    // If primer_apellido is missing but segundo_nombre contains the value (data shifted),
    // move segundo_nombre -> primer_apellido for those rows before generating passwords.
    const [fixRes] = await pool.query(
      "UPDATE usuarios SET primer_apellido = TRIM(segundo_nombre) WHERE (primer_apellido IS NULL OR TRIM(primer_apellido) = '') AND (segundo_nombre IS NOT NULL AND TRIM(segundo_nombre) <> '')"
    );
    console.log(`Registros actualizados desde segundo_nombre a primer_apellido: ${fixRes.affectedRows}`);

    const [rows] = await pool.query('SELECT id, primer_apellido, primer_nombre FROM usuarios');
    console.log(`Usuarios encontrados: ${rows.length}`);
    let updated = 0;
    let usedNombreFallback = 0;

    for (const r of rows) {
      let apellido = (r.primer_apellido || '').toString().trim();
      const nombre = (r.primer_nombre || '').toString().trim();
      if (!apellido) {
        if (nombre) {
          apellido = nombre; // fallback to primer_nombre when primer_apellido missing
          usedNombreFallback++;
        } else {
          continue; // both missing, skip
        }
      }
      const plain = apellido.toLowerCase() + '123';
      const hash = await bcrypt.hash(plain, 10);
      const [res] = await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, r.id]);
      if (res.affectedRows) updated++;
    }
    console.log(`Se usó primer_nombre como fallback para: ${usedNombreFallback}`);

    console.log(`Contraseñas actualizadas: ${updated}`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error en reset_passwords:', err);
    process.exit(1);
  }
})();
