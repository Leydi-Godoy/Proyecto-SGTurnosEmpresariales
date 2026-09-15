/*
  Reset all passwords to pattern PrimerApellido123
  - Creates a CSV backup at backend/scripts/backup_passwords_<timestamp>.csv with fields: id,correo,old_hash,new_plain
  - Updates `usuarios` (legacy) and `users` (normalized) when present
  - Requires DB credentials via environment variables (see backend/.env)
  - Usage: node backend/scripts/reset_all_passwords.js --dry-run   (just create CSV without updating)
           node backend/scripts/reset_all_passwords.js            (will perform updates)
*/

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async function main(){
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');

  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const outCsv = path.join(__dirname, `backup_passwords_${timestamp}.csv`);
  const outStream = fs.createWriteStream(outCsv, { flags: 'w' });
  outStream.write('source,id,correo,old_hash,new_plain\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sgturnos_empresariales',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  const connection = await pool.getConnection();
  try{
    const [dbNameRow] = await connection.query('SELECT DATABASE() as db');
    console.log('Connected to database:', dbNameRow[0] && dbNameRow[0].db);
    // Process legacy `usuarios` table
    try{
      const [rows] = await connection.query(`SELECT id, correo, primer_apellido, contrasena FROM usuarios WHERE activo = 1`);
      for(const r of rows){
        const apellido = (r.primer_apellido || '').toString().trim();
        if(!apellido) continue;
        const first = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
        const newPlain = `${first}123`;
        const newHash = await bcrypt.hash(newPlain, 12);
        outStream.write(["usuarios", r.id, r.correo, (r.contrasena||'').replace(/\n/g,''), newPlain].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',') + '\n');
        if(!dryRun){
          await connection.query('UPDATE usuarios SET contrasena = ? WHERE id = ? AND activo = 1', [newHash, r.id]);
        }
      }
    }catch(e){
      console.error('usuarios update error:', e && e.code ? e.code : e);
      if(e && e.code && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_FIELD_ERROR')){
        console.info('`usuarios` table not present or has different schema, skipping legacy update.');
      }else{
        throw e;
      }
    }

    // Process normalized `users` table
    try{
      const [rows2] = await connection.query(`SELECT id, email, last_name, password_hash FROM users WHERE is_active = 1`);
      for(const r of rows2){
        const apellido = (r.last_name || '').toString().trim();
        if(!apellido) continue;
        const first = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
        const newPlain = `${first}123`;
        const newHash = await bcrypt.hash(newPlain, 12);
        outStream.write(["users", r.id, r.email, (r.password_hash||'').replace(/\n/g,''), newPlain].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',') + '\n');
        if(!dryRun){
          await connection.query('UPDATE users SET password_hash = ? WHERE id = ? AND is_active = 1', [newHash, r.id]);
        }
      }
    }catch(e){
      if(e && e.code && (e.code === 'ER_NO_SUCH_TABLE' || e.code === 'ER_BAD_FIELD_ERROR')){
        console.info('`users` table not present or has different schema, skipping normalized update.');
      }else{
        throw e;
      }
    }

    console.log('Backup CSV created at', outCsv);
    if(dryRun){
      console.log('Dry run complete. No updates performed.');
    }else{
      console.log('Password updates applied.');
    }
  }catch(err){
    console.error('Error during reset:', err);
  }finally{
    connection.release();
    outStream.end();
    await pool.end();
  }
})();
