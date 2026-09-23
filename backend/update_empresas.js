const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

(async () => {
  try {
    console.log('📝 Completando datos de empresas...\n');
    const scriptPath = path.join(__dirname, './migrations/15_complete_empresas_data.sql');
    let sql = fs.readFileSync(scriptPath, 'utf8');
    
    // Separar por sentencias
    const statements = sql.split(';').filter(s => s.trim() && !s.startsWith('--'));
    
    let count = 0;
    for (const stmt of statements) {
      if (stmt.trim()) {
        await pool.query(stmt);
        count++;
      }
    }
    
    console.log(`✅ ${count} registros actualizados\n`);
    
    // Verificar que se actualizaron
    const [result] = await pool.query('SELECT id, nombre, nit, pais, ciudad, contacto, correo FROM empresas WHERE id <= 8 ORDER BY id');
    console.log('📊 Empresas completadas:\n');
    result.forEach(emp => {
      console.log(`${emp.id}. ${emp.nombre}`);
      console.log(`   NIT: ${emp.nit}`);
      console.log(`   Ubicación: ${emp.ciudad}, ${emp.pais}`);
      console.log(`   Contacto: ${emp.contacto}`);
      console.log(`   Correo: ${emp.correo}\n`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
