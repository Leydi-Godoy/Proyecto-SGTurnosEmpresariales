const mysql = require('mysql2/promise');
(async()=>{
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sgturnos_empresas',
  });
  const conn = await pool.getConnection();
  try{
    const [tables] = await conn.query("SHOW TABLES");
    console.log('Tables:', tables.map(r=>Object.values(r)[0]).join(', '));
    const tryTables = ['usuarios','usuario','users','Users','USUARIOS'];
    for(const t of tryTables){
      try{
        const [cols] = await conn.query(`DESCRIBE ${t}`);
        console.log(`\nTable ${t} columns:`);
        cols.forEach(c=>console.log(' ',c.Field));
        const [rows] = await conn.query(`SELECT * FROM ${t} LIMIT 3`);
        console.log(` Sample rows from ${t}:`, rows);
      }catch(e){
        // ignore
      }
    }
  }catch(e){
    console.error(e);
  }finally{
    conn.release();
    await pool.end();
  }
})();
