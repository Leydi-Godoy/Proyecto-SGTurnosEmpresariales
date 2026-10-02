import pool from './db.js'

const [solicitudes] = await pool.query(`
  SELECT 
    sn.id, 
    sn.empleado_id, 
    sn.estado, 
    sn.empresa_id, 
    sn.tipo,
    sn.fecha_inicio,
    e.usuario_id,
    u.documento,
    u.nombre,
    u.apellido
  FROM solicitudes_novedad sn
  LEFT JOIN empleados e ON sn.empleado_id = e.id
  LEFT JOIN usuarios u ON e.usuario_id = u.id
  ORDER BY sn.creado_en DESC
`)

console.log('\n📋 SOLICITUDES EN LA BASE DE DATOS:')
console.log(JSON.stringify(solicitudes, null, 2))
console.log(`\n✅ Total: ${solicitudes.length} solicitudes`)

// Ahora verificar qué retorna el query del supervisor
const [supervisorSolicitudes] = await pool.query(`
  SELECT 
    sn.id,
    sn.tipo,
    sn.motivo,
    sn.estado,
    sn.fecha_inicio,
    sn.fecha_fin,
    sn.creado_en,
    e.id as empleado_id,
    u.documento,
    u.correo,
    CONCAT(u.nombre, ' ', u.apellido) as empleado_nombre
  FROM solicitudes_novedad sn
  JOIN empleados e ON sn.empleado_id = e.id
  JOIN usuarios u ON e.usuario_id = u.id
  WHERE sn.empresa_id = 1 AND sn.estado = 'pendiente'
  ORDER BY sn.creado_en DESC
`)

console.log('\n📋 SOLICITUDES PENDIENTES (empresa_id=1):')
console.log(JSON.stringify(supervisorSolicitudes, null, 2))
console.log(`\n✅ Total pendientes: ${supervisorSolicitudes.length}`)

process.exit(0)
