const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

(async () => {
  try {
    console.log('📂 Leyendo script SQL...');
    const path = require('path');
    const scriptPath = path.join(__dirname, '../scripts/sgturnos_empresas(3)Edi.sql');
    let sqlScript = fs.readFileSync(scriptPath, 'utf8');
    
    // Eliminar comentarios de línea y multi-línea
    sqlScript = sqlScript
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Elimina /* ... */
      .replace(/^--.*$/gm, '')            // Elimina líneas que comienzan con --
      .replace(/^#.*$/gm, '')             // Elimina líneas que comienzan con #
      .replace(/;[\s\n]*;+/g, ';')        // Elimina puntos y comas múltiples
      .replace(/^\s*;/gm, '');            // Elimina puntos y comas al inicio
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: 'sgturnos_empresas',
      multipleStatements: true
    });

    console.log('📥 Importando datos (esto puede tomar unos segundos)...');
    
    try {
      // Ejecutar el script completo de una vez con multipleStatements
      const results = await connection.query(sqlScript);
      
      console.log(`✅ Importación completada correctamente`);
      console.log(`📊 ${results.length} resultados procesados`);
    } catch (err) {
      // Si falla por que ya existen las tablas, intentar con IF NOT EXISTS
      if (err.message.includes('already exists')) {
        console.log('⚠️  Algunas tablas ya existen, limpiando y reiniciando...');
        
        // Conectarse sin la BD especificada
        await connection.end();
        const connAdmin = await mysql.createConnection({
          host: process.env.DB_HOST || '127.0.0.1',
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || '',
          multipleStatements: true
        });
        
        // Eliminar y recrear la BD
        console.log('🗑️  Eliminando BD...');
        await connAdmin.query('DROP DATABASE IF EXISTS sgturnos_empresas');
        console.log('🆕 Creando BD nueva...');
        await connAdmin.query('CREATE DATABASE sgturnos_empresas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connAdmin.end();
        
        // Reconectar a la BD nueva
        const connNew = await mysql.createConnection({
          host: process.env.DB_HOST || '127.0.0.1',
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || '',
          database: 'sgturnos_empresas',
          multipleStatements: true
        });
        
        console.log('📥 Importando datos...');
        await connNew.query(sqlScript);
        await connNew.end();
        
        console.log(`✅ Importación completada correctamente`);
      } else {
        throw err;
      }
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
