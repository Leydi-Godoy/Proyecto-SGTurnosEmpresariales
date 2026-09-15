const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async ()=>{
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sgturnos_empresas',
  });
  const conn = await pool.getConnection();
  try{
    const email = process.argv[2] || 'leydigodoy@sgturnos.com';
    const pass = process.argv[3] || 'Godoy123';
    const [rows] = await conn.query('SELECT contrasena FROM usuarios WHERE correo = ? LIMIT 1', [email]);
    console.log('rows:', rows.length);
    if(!rows[0]){
      console.log('User not found');
      return;
    }
    console.log('hash:', rows[0].contrasena);
    const ok = await bcrypt.compare(pass, rows[0].contrasena);
    console.log('bcrypt compare =>', ok);
  }catch(e){
    console.error(e);
  }finally{
    conn.release();
    await pool.end();
  }
})();
