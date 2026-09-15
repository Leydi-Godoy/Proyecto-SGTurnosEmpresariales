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
  // accept a few possible role names used in the project
  const ok = ['Emple5', 'emple5', 'empleado', 'employee'].includes(String(role));
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
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.json({ novedades: [] });

  try {
    const [rows] = await pool.query(
      `SELECT id, tipo, descripcion, estado, creado_en FROM novedades WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 200`,
      [id],
    );
    return res.json({ novedades: rows || [] });
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.json({ novedades: [] });
    console.error('GET /api/empleado/novedades error', err);
    return res.status(500).json({ error: 'could not fetch novedades' });
  }
});

router.post('/novedades', async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  const { tipo, descripcion, fecha_solicitada } = req.body || {};
  if (!tipo || !descripcion) return res.status(400).json({ error: 'tipo and descripcion required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO novedades (usuario_id, tipo, descripcion, fecha_solicitada, estado, creado_en)
       VALUES (?, ?, ?, ?, 'pendiente', NOW())`,
      [id, tipo, descripcion, fecha_solicitada || null],
    );
    return res.status(201).json({ id: result.insertId, message: 'novedad creada' });
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return res.status(501).json({ error: 'novedades table not available' });
    console.error('POST /api/empleado/novedades error', err);
    return res.status(500).json({ error: 'could not create novedad' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { pool } = require('./db');
const { authenticateToken } = require('./auth');

function requireEmpleadoRole(req, res, next) {
  const role = req.auth?.role;
  if (role === 'emple5' || String(role).toLowerCase() === 'emple5' || Number(role) === 5) return next();
  return res.status(403).json({ error: 'Empleado role required' });
}

router.use(authenticateToken, requireEmpleadoRole);

// Helper: find empleado by usuario_id
async function findEmpleadoByUsuario(usuarioId) {
  if (!pool) return null;
  const [rows] = await pool.query('SELECT id, empresa_id FROM empleados WHERE usuario_id = ? LIMIT 1', [usuarioId]);
  return rows[0] || null;
}

// GET /api/empleado/turnos - lista de turnos asignados al empleado
router.get('/turnos', async (req, res) => {
  try {
    const userId = req.auth?.id;
    const empleado = await findEmpleadoByUsuario(userId);
    if (!empleado) return res.status(404).json({ error: 'empleado not found' });

    const [rows] = await pool.query(
      `SELECT at.id AS asignacion_id, it.id AS instancia_id, it.fecha, it.inicio_fecha_hora, it.fin_fecha_hora,
              it.sede_id, p.nombre AS plantilla_nombre, at.estado
       FROM asignaciones_turno at
       JOIN instancias_turno it ON it.id = at.instancia_turno_id
       LEFT JOIN plantillas_turno p ON p.id = it.plantilla_id
       WHERE at.empleado_id = ?
       ORDER BY it.fecha DESC
       LIMIT 500`,
      [empleado.id],
    );
    return res.json({ turnos: rows });
  } catch (err) {
    console.error('GET /api/empleado/turnos error', err);
    return res.status(503).json({ error: 'could not fetch turns' });
  }
});

// GET /api/empleado/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/calendar', async (req, res) => {
  try {
    const userId = req.auth?.id;
    const empleado = await findEmpleadoByUsuario(userId);
    if (!empleado) return res.status(404).json({ error: 'empleado not found' });

    const start = req.query.start ? String(req.query.start) : null;
    const end = req.query.end ? String(req.query.end) : null;

    let sql = `SELECT at.id AS asignacion_id, it.id AS instancia_id, it.fecha, it.inicio_fecha_hora, it.fin_fecha_hora, p.nombre AS plantilla_nombre
               FROM asignaciones_turno at
               JOIN instancias_turno it ON it.id = at.instancia_turno_id
               LEFT JOIN plantillas_turno p ON p.id = it.plantilla_id
               WHERE at.empleado_id = ?`;
    const params = [empleado.id];
    if (start && end) {
      sql += ' AND it.fecha BETWEEN ? AND ?';
      params.push(start, end);
    }
    sql += ' ORDER BY it.fecha ASC LIMIT 1000';

    const [rows] = await pool.query(sql, params);
    return res.json({ events: rows });
  } catch (err) {
    console.error('GET /api/empleado/calendar error', err);
    return res.status(503).json({ error: 'could not fetch calendar' });
  }
});

// POST /api/empleado/solicitudes - crear una solicitud de novedad (permiso, incapacidad, cambio de turno, licencia)
router.post('/solicitudes', async (req, res) => {
  try {
    const userId = req.auth?.id;
    const empleado = await findEmpleadoByUsuario(userId);
    if (!empleado) return res.status(404).json({ error: 'empleado not found' });

    const { tipo, fecha_inicio, fecha_fin, motivo } = req.body || {};
    if (!tipo || !fecha_inicio) return res.status(400).json({ error: 'tipo y fecha_inicio son obligatorios' });

    const [result] = await pool.query(
      `INSERT INTO solicitudes_novedad (empleado_id, empresa_id, tipo, fecha_inicio, fecha_fin, motivo, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
      [empleado.id, empleado.empresa_id, tipo, fecha_inicio, fecha_fin || null, motivo || null],
    );

    return res.status(201).json({ id: result.insertId, message: 'solicitud creada' });
  } catch (err) {
    console.error('POST /api/empleado/solicitudes error', err);
    return res.status(503).json({ error: 'could not create solicitud' });
  }
});

module.exports = router;
