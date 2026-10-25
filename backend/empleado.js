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

function requireEmple5(req, res, next) {
  const role = req.auth?.role;
  if (!role) return res.status(401).json({ error: 'invalid token' });
  // accept role 5 (numero) o strings equivalentes
  const roleNum = Number(role);
  const ok = [5, '5', 'Emple5', 'emple5', 'empleado', 'employee'].includes(roleNum) || 
             ['Emple5', 'emple5', 'empleado', 'employee'].includes(String(role));
  if (!ok) return res.status(403).json({ error: 'Emple5 role required' });
  next();
}

// protect all empleado routes
if (authenticateToken) router.use(authenticateToken, requireEmple5);

router.get('/profile', async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario,
        CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) AS nombre,
        correo, id_rol AS Id_rol, telefono, activo, empresa_id
       FROM usuarios WHERE id = ? LIMIT 1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'user not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('GET /api/empleado/profile error', err);
    return res.status(500).json({ error: 'could not fetch profile' });
  }
});

// GET /perfil - Info del empleado logeado
router.get('/perfil', async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({});

  try {
    const [rows] = await pool.query(
      `SELECT u.id AS id_usuario,
              CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre,
              u.correo, u.empresa_id, esp.nombre AS especialidad,
              u.activo, u.creado_en
       FROM usuarios u
       LEFT JOIN empleados e ON e.usuario_id = u.id
       LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
       WHERE u.id = ? LIMIT 1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'empleado not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/empleado/perfil error', err);
    return res.status(500).json({ error: 'could not fetch profile' });
  }
});

// GET /malla-completa - Malla con todos los compañeros
router.get('/malla-completa', async (req, res) => {
  const empresaId = req.auth?.empresa_id;
  if (!empresaId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({ turnos: [] });

  const { fecha_inicio, fecha_fin } = req.query || {};

  try {
    // Configuración(es) de malla publicada(s) de la empresa, con info de empresa
    const [configs] = await pool.query(
      `SELECT cm.*, e.nombre AS empresa_nombre
       FROM configuraciones_malla cm
       JOIN empresas e ON e.id = cm.empresa_id
       WHERE cm.empresa_id = ? AND cm.activo = 1 AND cm.publicada = 1
       ORDER BY cm.fecha_inicio_vigencia DESC
       LIMIT 1`,
      [empresaId]
    );
    const configuracion = configs[0] || null;

    // Turnos vinculados a esa configuración
    let turnosVinculados = [];
    if (configuracion) {
      const [turnosRows] = await pool.query(
        `SELECT cmt.id, cmt.plantilla_id, cmt.orden, cmt.duracion_horas, pt.nombre, pt.hora_inicio, pt.hora_fin
         FROM configuraciones_malla_turnos cmt
         JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
         WHERE cmt.configuracion_id = ?
         ORDER BY cmt.orden ASC`,
        [configuracion.id]
      );
      turnosVinculados = turnosRows;
    }

    const query = `
      SELECT at.id, it.fecha, pt.nombre AS nombre_turno, pt.hora_inicio, pt.hora_fin, cmt.duracion_horas,
             CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS nombre_empleado,
             esp.nombre AS especialidad
      FROM asignaciones_turno at
      JOIN instancias_turno it ON at.instancia_turno_id = it.id
      JOIN plantillas_turno pt ON it.plantilla_id = pt.id
      JOIN configuraciones_malla_turnos cmt ON cmt.plantilla_id = pt.id
      JOIN configuraciones_malla cm ON cm.id = cmt.configuracion_id AND cm.empresa_id = pt.empresa_id
      LEFT JOIN empleados e ON at.empleado_id = e.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
      WHERE pt.empresa_id = ? AND cm.activo = 1 AND cm.publicada = 1
      ${fecha_inicio ? 'AND it.fecha >= ?' : ''}
      ${fecha_fin ? 'AND it.fecha <= ?' : ''}
      ORDER BY it.fecha ASC, pt.hora_inicio ASC
      LIMIT 1000
    `;
    
    const params = [empresaId];
    if (fecha_inicio) params.push(fecha_inicio);
    if (fecha_fin) params.push(fecha_fin);

    const [rows] = await pool.query(query, params);
    return res.json({ turnos: rows || [], configuracion, turnosVinculados });
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.json({ turnos: [] });
    console.error('GET /api/empleado/malla-completa error', err);
    return res.status(500).json({ error: 'could not fetch malla' });
  }
});

// GET /mis-turnos - Solo los turnos del empleado logeado
router.get('/mis-turnos', async (req, res) => {
  const usuarioId = req.auth?.id;
  if (!usuarioId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json([]);

  try {
    const [empleadoRows] = await pool.query(
      `SELECT id FROM empleados WHERE usuario_id = ? LIMIT 1`,
      [usuarioId]
    );
    if (!empleadoRows[0]) return res.json([]);
    const empleadoId = empleadoRows[0].id;

    const [rows] = await pool.query(
      `SELECT at.id, it.fecha, pt.nombre AS nombre_turno, pt.hora_inicio, pt.hora_fin, cmt.duracion_horas,
              esp.nombre AS especialidad
       FROM asignaciones_turno at
       JOIN instancias_turno it ON at.instancia_turno_id = it.id
       JOIN plantillas_turno pt ON it.plantilla_id = pt.id
       JOIN configuraciones_malla_turnos cmt ON cmt.plantilla_id = pt.id
       JOIN configuraciones_malla cm ON cm.id = cmt.configuracion_id AND cm.empresa_id = pt.empresa_id
       LEFT JOIN empleados e ON at.empleado_id = e.id
       LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
       WHERE at.empleado_id = ? AND cm.activo = 1 AND cm.publicada = 1
       ORDER BY it.fecha ASC, pt.hora_inicio ASC
       LIMIT 500`,
      [empleadoId],
    );
    return res.json(rows || []);
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.json([]);
    console.error('GET /api/empleado/mis-turnos error', err);
    return res.status(500).json({ error: 'could not fetch turnos' });
  }
});

router.get('/turnos', async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({ turnos: [] });

  try {
    const [rows] = await pool.query(
      `SELECT id, fecha, inicio, fin, descripcion, origen FROM turnos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 500`,
      [id],
    );
    return res.json({ turnos: rows || [] });
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.json({ turnos: [] });
    console.error('GET /api/empleado/turnos error', err);
    return res.status(500).json({ error: 'could not fetch turnos' });
  }
});

router.get('/novedades', async (req, res) => {
  const usuarioId = req.auth?.id;
  if (!usuarioId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({ novedades: [] });

  try {
    // Obtener el empleado_id desde la tabla empleados usando usuario_id
    const [empleadoRows] = await pool.query(
      `SELECT id FROM empleados WHERE usuario_id = ? LIMIT 1`,
      [usuarioId]
    );
    if (!empleadoRows[0]) {
      return res.json({ novedades: [] });
    }
    const empleadoId = empleadoRows[0].id;

    const [rows] = await pool.query(
      `SELECT sn.id, sn.tipo, sn.motivo AS descripcion, sn.estado, sn.creado_en,
              sn.fecha_inicio, sn.fecha_fin,
              COUNT(ds.id) AS documentos_count
       FROM solicitudes_novedad sn
       LEFT JOIN documentos_solicitud ds ON sn.id = ds.solicitud_id
       WHERE sn.empleado_id = ?
       GROUP BY sn.id
       ORDER BY sn.creado_en DESC
       LIMIT 200`,
      [empleadoId],
    );
    return res.json(rows || []);
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.json({ novedades: [] });
    console.error('GET /api/empleado/novedades error', err);
    return res.status(500).json({ error: 'could not fetch novedades' });
  }
});

router.post('/novedades', async (req, res) => {
  const usuarioId = req.auth?.id;
  const empresaId = req.auth?.empresa_id;
  if (!usuarioId || !empresaId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  const { tipo, descripcion, fecha_inicio, fecha_fin } = req.body || {};
  if (!tipo || !descripcion) return res.status(400).json({ error: 'tipo and descripcion required' });

  try {
    // Obtener el empleado_id desde la tabla empleados usando usuario_id
    const [empleadoRows] = await pool.query(
      `SELECT id FROM empleados WHERE usuario_id = ? LIMIT 1`,
      [usuarioId]
    );
    if (!empleadoRows[0]) {
      return res.status(404).json({ error: 'empleado record not found for this user' });
    }
    const empleadoId = empleadoRows[0].id;

    console.log('POST /novedades - Insertando:', { empleadoId, empresaId, tipo, descripcion, fecha_inicio, fecha_fin });
    const [result] = await pool.query(
      `INSERT INTO solicitudes_novedad (empleado_id, empresa_id, tipo, motivo, fecha_inicio, fecha_fin, estado, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW())`,
      [empleadoId, empresaId, tipo, descripcion, fecha_inicio || null, fecha_fin || null],
    );
    console.log('POST /novedades - Solicitud creada con ID:', result.insertId);
    return res.status(201).json({ id: result.insertId, message: 'solicitud creada' });
  } catch (err) {
    console.error('POST /api/empleado/novedades error:', err.code, err.message);
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.status(501).json({ error: 'solicitudes_novedad table not available' });
    return res.status(500).json({ error: 'could not create solicitud', details: err.message });
  }
});

router.post('/novedades/:solicitudId/documentos', async (req, res) => {
  const { solicitudId } = req.params;
  const id = req.auth?.id;
  const empresaId = req.auth?.empresa_id;
  if (!id || !empresaId) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  const { nombre_archivo, url_almacenamiento } = req.body || {};
  if (!nombre_archivo || !url_almacenamiento) {
    return res.status(400).json({ error: 'nombre_archivo and url_almacenamiento required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO documentos_solicitud (solicitud_id, empresa_id, nombre_archivo, url_almacenamiento, creado_en)
       VALUES (?, ?, ?, ?, NOW())`,
      [solicitudId, empresaId, nombre_archivo, url_almacenamiento],
    );
    return res.status(201).json({ id: result.insertId, message: 'documento guardado' });
  } catch (err) {
    console.error('POST /api/empleado/novedades/:solicitudId/documentos error', err);
    return res.status(500).json({ error: 'could not save document' });
  }
});

router.get('/novedades/:solicitudId/documentos', async (req, res) => {
  const { solicitudId } = req.params;
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json([]);

  try {
    const [rows] = await pool.query(
      `SELECT id, nombre_archivo, url_almacenamiento, creado_en
       FROM documentos_solicitud
       WHERE solicitud_id = ?
       ORDER BY creado_en DESC
       LIMIT 50`,
      [solicitudId],
    );
    return res.json(rows || []);
  } catch (err) {
    console.error('GET /api/empleado/novedades/:solicitudId/documentos error', err);
    return res.status(500).json({ error: 'could not fetch documents' });
  }
});

module.exports = router;
