import express from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireSupervisor } from '../middleware/rolecheck.js'

const router = express.Router()

// Obtener solicitudes pendientes del supervisor
router.get('/solicitudes', requireAuth, requireSupervisor, async (req, res) => {
  try {
    const usuarioId = req.user.id
    const empresaId = req.user.empresa_id

    // Obtener todas las solicitudes pendientes de la empresa
    const [solicitudes] = await pool.query(`
      SELECT 
        sn.id,
        sn.tipo,
        sn.descripcion,
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
      WHERE sn.empresa_id = ? AND sn.estado = 'pendiente'
      ORDER BY sn.creado_en DESC
    `, [empresaId])

    res.json(solicitudes || [])
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error)
    res.status(500).json({ error: 'Error obteniendo solicitudes' })
  }
})

// Aprobar solicitud
router.post('/solicitudes/:id/aprobar', requireAuth, requireSupervisor, async (req, res) => {
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

    // Actualizar estado
    await pool.query(`
      UPDATE solicitudes_novedad 
      SET estado = 'aprobado', revisado_en = NOW(), revisado_por = ?
      WHERE id = ?
    `, [usuarioId, id])

    res.json({ success: true, message: 'Solicitud aprobada' })
  } catch (error) {
    console.error('Error aprobando solicitud:', error)
    res.status(500).json({ error: 'Error aprobando solicitud' })
  }
})

// Rechazar solicitud
router.post('/solicitudes/:id/rechazar', requireAuth, requireSupervisor, async (req, res) => {
  try {
    const { id } = req.params
    const { motivo_rechazo } = req.body
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

    // Actualizar estado
    await pool.query(`
      UPDATE solicitudes_novedad 
      SET estado = 'rechazado', motivo_rechazo = ?, revisado_en = NOW(), revisado_por = ?
      WHERE id = ?
    `, [motivo_rechazo || null, usuarioId, id])

    res.json({ success: true, message: 'Solicitud rechazada' })
  } catch (error) {
    console.error('Error rechazando solicitud:', error)
    res.status(500).json({ error: 'Error rechazando solicitud' })
  }
})

export default router
