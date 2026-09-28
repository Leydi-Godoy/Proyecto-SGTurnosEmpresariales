const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../auth')

const router = express.Router()

// Middleware: Solo empleados (rol 5)
function requireEmpleado(req, res, next) {
  const role = String(req.auth?.role || '').trim().toLowerCase()
  if (!['5', 'empleado'].includes(role)) {
    return res.status(403).json({ error: 'solo empleados pueden acceder' })
  }
  next()
}

router.use(authenticateToken, requireEmpleado)

// GET /api/empleado/perfil - Obtener perfil del empleado
router.get('/perfil', async (req, res) => {
  try {
    const usuarioId = req.auth?.id
    if (!usuarioId) return res.status(401).json({ error: 'usuario no identificado' })

    const [rows] = await pool.query(
      `SELECT e.id, e.usuario_id, e.empresa_id, e.codigo_empleado, e.estado,
              CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre,
              esp.nombre AS especialidad, esp.codigo AS codigo_especialidad
       FROM empleados e
       LEFT JOIN usuarios u ON u.id = e.usuario_id
       LEFT JOIN especialidades esp ON esp.id = e.especialidad_id
       WHERE e.usuario_id = ? LIMIT 1`,
      [usuarioId]
    )

    if (!rows[0]) return res.status(404).json({ error: 'perfil de empleado no encontrado' })
    
    res.json(rows[0])
  } catch (error) {
    console.error('empleado perfil error', error)
    res.status(500).json({ error: 'error al obtener perfil' })
  }
})

// GET /api/empleado/mis-turnos - Obtener solo los turnos asignados al empleado
router.get('/mis-turnos', async (req, res) => {
  try {
    const usuarioId = req.auth?.id
    if (!usuarioId) return res.status(401).json({ error: 'usuario no identificado' })

    // Primero obtener el ID del empleado
    const [empleados] = await pool.query(
      'SELECT id, empresa_id FROM empleados WHERE usuario_id = ? LIMIT 1',
      [usuarioId]
    )

    if (!empleados[0]) return res.status(404).json({ error: 'empleado no encontrado' })

    const empleadoId = empleados[0].id
    const empresaId = empleados[0].empresa_id

    // Obtener los turnos asignados al empleado en los próximos 30 días
    const [turnos] = await pool.query(
      `SELECT 
        it.id,
        it.fecha,
        pt.nombre AS nombre_turno,
        pt.hora_inicio,
        pt.hora_fin,
        esp.nombre AS especialidad,
        CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre_empleado
       FROM asignaciones_turno at
       JOIN instancias_turno it ON it.id = at.instancia_turno_id
       JOIN plantillas_turno pt ON pt.id = it.plantilla_turno_id
       LEFT JOIN especialidades esp ON esp.id = pt.especialidad_id
       LEFT JOIN empleados e ON e.id = at.empleado_id
       LEFT JOIN usuarios u ON u.id = e.usuario_id
       WHERE at.empleado_id = ? AND it.empresa_id = ? AND it.fecha >= CURDATE() AND it.fecha <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY it.fecha ASC`,
      [empleadoId, empresaId]
    )

    res.json(turnos || [])
  } catch (error) {
    console.error('empleado mis-turnos error', error)
    res.status(500).json({ error: 'error al obtener turnos' })
  }
})

// GET /api/empleado/malla-completa - Obtener malla completa (todos los empleados)
router.get('/malla-completa', async (req, res) => {
  try {
    const usuarioId = req.auth?.id
    if (!usuarioId) return res.status(401).json({ error: 'usuario no identificado' })

    const { fecha_inicio, fecha_fin } = req.query

    // Obtener empresa del empleado
    const [empleados] = await pool.query(
      'SELECT empresa_id FROM empleados WHERE usuario_id = ? LIMIT 1',
      [usuarioId]
    )

    if (!empleados[0]) return res.status(404).json({ error: 'empleado no encontrado' })

    const empresaId = empleados[0].empresa_id
    const fechaIni = fecha_inicio || new Date().toISOString().split('T')[0]
    const fechaFin = fecha_fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Obtener todos los turnos de la empresa en el rango de fechas
    const [turnos] = await pool.query(
      `SELECT 
        it.id,
        it.fecha,
        pt.nombre AS nombre_turno,
        pt.hora_inicio,
        pt.hora_fin,
        esp.nombre AS especialidad,
        CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre_empleado
       FROM instancias_turno it
       LEFT JOIN plantillas_turno pt ON pt.id = it.plantilla_turno_id
       LEFT JOIN especialidades esp ON esp.id = pt.especialidad_id
       LEFT JOIN asignaciones_turno at ON at.instancia_turno_id = it.id
       LEFT JOIN empleados e ON e.id = at.empleado_id
       LEFT JOIN usuarios u ON u.id = e.usuario_id
       WHERE it.empresa_id = ? AND it.fecha >= ? AND it.fecha <= ?
       ORDER BY it.fecha ASC, pt.nombre ASC`,
      [empresaId, fechaIni, fechaFin]
    )

    res.json({ 
      empresa_id: empresaId,
      fecha_inicio: fechaIni,
      fecha_fin: fechaFin,
      turnos: turnos || []
    })
  } catch (error) {
    console.error('empleado malla-completa error', error)
    res.status(500).json({ error: 'error al obtener malla completa' })
  }
})

module.exports = router
