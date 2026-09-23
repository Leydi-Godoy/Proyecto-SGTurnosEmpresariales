const { pool } = require('./db');

(async () => {
  try {
    // Contar tablas
    const [tables] = await pool.query('SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = "sgturnos_empresas"');
    console.log('📊 Tablas en la BD:', tables[0].count);
    
    // Contar registros principales
    const [usuarios] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    console.log('👥 Usuarios:', usuarios[0].count);
    
    const [empleados] = await pool.query('SELECT COUNT(*) as count FROM empleados');
    console.log('👔 Empleados:', empleados[0].count);
    
    const [empresas] = await pool.query('SELECT COUNT(*) as count FROM empresas');
    console.log('🏢 Empresas:', empresas[0].count);
    
    const [instancias] = await pool.query('SELECT COUNT(*) as count FROM instancias_turno');
    console.log('📅 Instancias de Turno:', instancias[0].count);
    
    const [asignaciones] = await pool.query('SELECT COUNT(*) as count FROM asignaciones_turno');
    console.log('🎯 Asignaciones:', asignaciones[0].count);
    
    const [plantillas] = await pool.query('SELECT COUNT(*) as count FROM plantillas_turno');
    console.log('📋 Plantillas:', plantillas[0].count);
    
    console.log('\n✅ BD sincronizada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
