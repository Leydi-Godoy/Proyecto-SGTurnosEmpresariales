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
