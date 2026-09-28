const express = require('express');
const router = express.Router();
require('dotenv').config();

let pool = null;
try {
  ({ pool } = require('./db'));
} catch (e) {
  pool = null;
}

const { authenticateToken } = (() => {
  try {
    return require('./auth');
  } catch (e) {
    return {};
  }
})();

// Middleware para verificar que sea supervisor (rol 4)
function requireSupervisor(req, res, next) {
  const role = req.auth?.role;
  if (!role) return res.status(401).json({ error: 'invalid token' });
  
  // Aceptar rol 4 (supervisor) o strings equivalentes
  const ok = [4, '4', 'supervisor'].includes(String(role).toLowerCase());
  if (!ok) return res.status(403).json({ error: 'Supervisor role required' });
  next();
}

// Proteger todas las rutas de supervisor
if (authenticateToken) router.use(authenticateToken, requireSupervisor);

// GET /solicitudes - Obtener solicitudes del equipo del supervisor
router.get('/solicitudes', async (req, res) => {
  const supervisorId = req.auth?.id;
  const empresaId = req.auth?.empresa_id;
  
  if (!supervisorId || !empresaId) {
    return res.status(401).json({ error: 'invalid token' });
  }
  if (!pool) return res.json([]);

  try {
    // Obtener empleados supervisados
    const [empleados] = await pool.query(
      `SELECT u.id FROM usuarios u
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       WHERE u.empresa_id = ? AND ur.rol_id = 5
       LIMIT 100`,
      [empresaId]
    );

    const empleadoIds = empleados.map(e => e.id);
    
    if (empleadoIds.length === 0) {
      return res.json([]);
    }

    // Obtener solicitudes de esos empleados
    const placeholders = empleadoIds.map(() => '?').join(',');
    const [solicitudes] = await pool.query(
      `SELECT sn.id, sn.empleado_id, sn.empresa_id, sn.tipo, sn.fecha_inicio, sn.fecha_fin,
              sn.motivo, sn.estado, sn.creado_en,
              CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS empleado_nombre,
              u.correo, COUNT(ds.id) AS documentos_count
       FROM solicitudes_novedad sn
       LEFT JOIN usuarios u ON sn.empleado_id = u.id
       LEFT JOIN documentos_solicitud ds ON sn.id = ds.solicitud_id
       WHERE sn.empleado_id IN (${placeholders}) AND sn.empresa_id = ?
       GROUP BY sn.id
       ORDER BY sn.creado_en DESC
       LIMIT 500`,
      [...empleadoIds, empresaId]
    );

    return res.json(solicitudes || []);
  } catch (err) {
    console.error('GET /api/supervisor/solicitudes error', err);
    return res.status(500).json({ error: 'could not fetch solicitudes' });
  }
});

// GET /solicitudes/:id - Obtener detalles de una solicitud
router.get('/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  const empresaId = req.auth?.empresa_id;
  
  if (!empresaId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({});

  try {
    const [solicitudes] = await pool.query(
      `SELECT sn.id, sn.empleado_id, sn.empresa_id, sn.tipo, sn.fecha_inicio, sn.fecha_fin,
              sn.motivo, sn.estado, sn.creado_en,
              CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS empleado_nombre,
              u.correo
       FROM solicitudes_novedad sn
       LEFT JOIN usuarios u ON sn.empleado_id = u.id
       WHERE sn.id = ? AND sn.empresa_id = ?
       LIMIT 1`,
      [id, empresaId]
    );

    if (!solicitudes[0]) {
      return res.status(404).json({ error: 'solicitud not found' });
    }

    // Obtener documentos
    const [documentos] = await pool.query(
      `SELECT id, nombre_archivo, url_almacenamiento, creado_en
       FROM documentos_solicitud
       WHERE solicitud_id = ?
       ORDER BY creado_en DESC`,
      [id]
    );

    // Obtener aprobación si existe
    const [aprobaciones] = await pool.query(
      `SELECT id, aprobador_id, decision, comentario, decidido_en
       FROM aprobaciones
       WHERE solicitud_id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      ...solicitudes[0],
      documentos: documentos || [],
      aprobacion: aprobaciones[0] || null
    });
  } catch (err) {
    console.error('GET /api/supervisor/solicitudes/:id error', err);
    return res.status(500).json({ error: 'could not fetch solicitud' });
  }
});

// POST /solicitudes/:id/aprobar - Aprobar una solicitud
router.post('/solicitudes/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body || {};
  const supervisorId = req.auth?.id;
  const empresaId = req.auth?.empresa_id;
  
  if (!supervisorId || !empresaId) {
    return res.status(401).json({ error: 'invalid token' });
  }
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  try {
    // Actualizar estado de solicitud
    await pool.query(
      `UPDATE solicitudes_novedad SET estado = 'aprobado' WHERE id = ? AND empresa_id = ?`,
      [id, empresaId]
    );

    // Registrar aprobación
    const [result] = await pool.query(
      `INSERT INTO aprobaciones (solicitud_id, aprobador_id, decision, comentario, decidido_en)
       VALUES (?, ?, 'aprobado', ?, NOW())`,
      [id, supervisorId, comentario || null]
    );

    return res.json({ 
      message: 'Solicitud aprobada', 
      aprobacion_id: result.insertId 
    });
  } catch (err) {
    console.error('POST /api/supervisor/solicitudes/:id/aprobar error', err);
    return res.status(500).json({ error: 'could not approve solicitud' });
  }
});

// POST /solicitudes/:id/rechazar - Rechazar una solicitud
router.post('/solicitudes/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body || {};
  const supervisorId = req.auth?.id;
  const empresaId = req.auth?.empresa_id;
  
  if (!supervisorId || !empresaId) {
    return res.status(401).json({ error: 'invalid token' });
  }
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  if (!comentario || !comentario.trim()) {
    return res.status(400).json({ error: 'Motivo de rechazo requerido' });
  }

  try {
    // Actualizar estado de solicitud
    await pool.query(
      `UPDATE solicitudes_novedad SET estado = 'rechazado' WHERE id = ? AND empresa_id = ?`,
      [id, empresaId]
    );

    // Registrar rechazo
    const [result] = await pool.query(
      `INSERT INTO aprobaciones (solicitud_id, aprobador_id, decision, comentario, decidido_en)
       VALUES (?, ?, 'rechazado', ?, NOW())`,
      [id, supervisorId, comentario]
    );

    return res.json({ 
      message: 'Solicitud rechazada', 
      aprobacion_id: result.insertId 
    });
  } catch (err) {
    console.error('POST /api/supervisor/solicitudes/:id/rechazar error', err);
    return res.status(500).json({ error: 'could not reject solicitud' });
  }
});

// GET /equipo - Obtener equipo del supervisor
router.get('/equipo', async (req, res) => {
  const empresaId = req.auth?.empresa_id;
  
  if (!empresaId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json([]);

  try {
    const [empleados] = await pool.query(
      `SELECT u.id, 
              CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre,
              u.correo, u.telefono, e.nombre_especialidad AS especialidad, u.activo,
              COUNT(sn.id) AS solicitudes_pendientes
       FROM usuarios u
       LEFT JOIN especialidades e ON u.especialidad_id = e.id
       LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
       LEFT JOIN solicitudes_novedad sn ON u.id = sn.empleado_id AND sn.estado = 'pendiente'
       WHERE u.empresa_id = ? AND ur.rol_id = 5
       GROUP BY u.id
       ORDER BY u.primer_nombre ASC
       LIMIT 100`,
      [empresaId]
    );

    return res.json(empleados || []);
  } catch (err) {
    console.error('GET /api/supervisor/equipo error', err);
    return res.status(500).json({ error: 'could not fetch equipo' });
  }
});

module.exports = router;
