const express = require('express')
const { pool } = require('../db.js')
const { authenticateToken } = require('../auth.js')
const { requireSupervisor } = require('../middleware/rolecheck.js')

const router = express.Router()

// Obtener solicitudes pendientes del supervisor
router.get('/solicitudes', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const empresaId = req.user.empresa_id

    // Obtener todas las solicitudes pendientes de la empresa
    const [solicitudes] = await pool.query(`
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
        TRIM(CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido)) as empleado_nombre
      FROM solicitudes_novedad sn
      JOIN empleados e ON sn.empleado_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE sn.empresa_id = ? AND sn.estado = 'pendiente'
      ORDER BY sn.creado_en DESC
    `, [empresaId])

    res.json(solicitudes || [])
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error)
    res.status(500).json({ error: 'Error obteniendo solicitudes' })
  }
})

// Obtener detalle de una solicitud (empleado, documentos y decisión si ya fue gestionada)
router.get('/solicitudes/:id', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const { id } = req.params
    const empresaId = req.user.empresa_id

    const [rows] = await pool.query(`
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
        TRIM(CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido)) as empleado_nombre
      FROM solicitudes_novedad sn
      JOIN empleados e ON sn.empleado_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE sn.id = ? AND sn.empresa_id = ?
      LIMIT 1
    `, [id, empresaId])

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    const solicitud = rows[0]

    const [documentos] = await pool.query(`
      SELECT id, nombre_archivo, url_almacenamiento, creado_en
      FROM documentos_solicitud
      WHERE solicitud_id = ?
      ORDER BY creado_en ASC
    `, [id])

    const [aprobaciones] = await pool.query(`
      SELECT id, aprobador_id, decision, comentario, decidido_en
      FROM aprobaciones
      WHERE solicitud_id = ?
      ORDER BY decidido_en DESC
      LIMIT 1
    `, [id])

    res.json({
      ...solicitud,
      documentos: documentos || [],
      aprobacion: aprobaciones && aprobaciones[0] ? aprobaciones[0] : null,
    })
  } catch (error) {
    console.error('Error obteniendo detalle de solicitud:', error)
    res.status(500).json({ error: 'Error obteniendo detalle de solicitud' })
  }
})

// Aprobar solicitud
router.post('/solicitudes/:id/aprobar', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const { id } = req.params
    const usuarioId = req.user.id
    const empresaId = req.user.empresa_id

    // Verificar que la solicitud pertenece a la empresa del supervisor
    const [solicitud] = await pool.query(`
      SELECT * FROM solicitudes_novedad 
      WHERE id = ? AND empresa_id = ?
    `, [id, empresaId])

    if (!solicitud || solicitud.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    // 1. Actualizar estado en solicitudes_novedad
    await pool.query(`
      UPDATE solicitudes_novedad 
      SET estado = 'aprobado'
      WHERE id = ?
    `, [id])

    // 2. Registrar la aprobación en la tabla aprobaciones
    await pool.query(`
      INSERT INTO aprobaciones (solicitud_id, aprobador_id, decision, comentario)
      VALUES (?, ?, 'aprobado', ?)
    `, [id, usuarioId, 'Aprobado por supervisor'])

    res.json({ success: true, message: 'Solicitud aprobada' })
  } catch (error) {
    console.error('Error aprobando solicitud:', error)
    res.status(500).json({ error: 'Error aprobando solicitud' })
  }
})

// Rechazar solicitud
router.post('/solicitudes/:id/rechazar', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const { id } = req.params
    const motivo_rechazo = req.body?.motivo_rechazo || req.body?.comentario
    const usuarioId = req.user.id
    const empresaId = req.user.empresa_id

    // Verificar que la solicitud pertenece a la empresa del supervisor
    const [solicitud] = await pool.query(`
      SELECT * FROM solicitudes_novedad 
      WHERE id = ? AND empresa_id = ?
    `, [id, empresaId])

    if (!solicitud || solicitud.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    // 1. Actualizar estado en solicitudes_novedad
    await pool.query(`
      UPDATE solicitudes_novedad 
      SET estado = 'rechazado'
      WHERE id = ?
    `, [id])

    // 2. Registrar el rechazo en la tabla aprobaciones
    await pool.query(`
      INSERT INTO aprobaciones (solicitud_id, aprobador_id, decision, comentario)
      VALUES (?, ?, 'rechazado', ?)
    `, [id, usuarioId, motivo_rechazo || 'Rechazado por supervisor'])

    res.json({ success: true, message: 'Solicitud rechazada' })
  } catch (error) {
    console.error('Error rechazando solicitud:', error)
    res.status(500).json({ error: 'Error rechazando solicitud' })
  }
})

module.exports = router
