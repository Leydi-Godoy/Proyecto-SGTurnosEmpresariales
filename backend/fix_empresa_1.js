const { pool } = require('./db');

(async () => {
  try {
    console.log('📝 Actualizando empresa 1...\n');
    
    const updates = [
      {
        id: 1,
        nit: '900123456-1',
        pais: 'Colombia',
        ciudad: 'Bogotá',
        contacto: 'María García López',
        correo: 'contacto@empresa-demo.com',
        telefono: '3101234567'
      }
    ];
    
    for (const emp of updates) {
      await pool.query(
        'UPDATE empresas SET nit = ?, pais = ?, ciudad = ?, contacto = ?, correo = ?, telefono = ? WHERE id = ?',
        [emp.nit, emp.pais, emp.ciudad, emp.contacto, emp.correo, emp.telefono, emp.id]
      );
    }
    
    console.log('✅ Empresa actualizada\n');
    
    // Verificar
    const [result] = await pool.query('SELECT id, nombre, nit, pais, ciudad, contacto, correo FROM empresas WHERE id = 1');
    if (result.length > 0) {
      const emp = result[0];
      console.log(`${emp.id}. ${emp.nombre}`);
      console.log(`   NIT: ${emp.nit}`);
      console.log(`   Ubicación: ${emp.ciudad}, ${emp.pais}`);
      console.log(`   Contacto: ${emp.contacto}`);
      console.log(`   Correo: ${emp.correo}\n`);
    }
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
