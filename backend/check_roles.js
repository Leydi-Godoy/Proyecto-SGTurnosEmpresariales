const { pool } = require('./db.js')

;(async () => {
  const [users] = await pool.query(`
    SELECT * FROM usuarios WHERE documento IN ('20304050', '69314718')
  `)
  console.log('\n=== USUARIOS ===')
  console.log(JSON.stringify(users, null, 2))
  
  const [roles] = await pool.query(`
    SELECT ur.usuario_id, r.id as rol_id, r.nombre as rol_nombre
    FROM usuario_roles ur
    LEFT JOIN roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id IN (20304050, 69314718)
  `)
  console.log('\n=== USUARIO_ROLES ===')
  console.log(JSON.stringify(roles, null, 2))
  process.exit(0)
})()
