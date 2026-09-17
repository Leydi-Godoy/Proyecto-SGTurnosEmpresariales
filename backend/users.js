const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();
const SUPER_ADMIN_ROLES = new Set(['super_admin', 'superadmin', 'subad1', 'admin', 'developer', '1', 'super administrador', 'superadministrador']);

function requireSuperAdmin(req, res, next) {
  const role = String(req.auth?.role || '').trim().toLowerCase();
  if (!SUPER_ADMIN_ROLES.has(role)) {
    return res.status(403).json({ error: 'super admin role required' });
  }
  next();
}

router.use(authenticateToken, requireSuperAdmin);

router.get('/', async (req, res) => {
  try {
    // Query the normalized Spanish table but keep API fields compatible
    const [rows] = await pool.query(
      `SELECT u.id, u.empresa_id, e.nombre AS empresa_nombre, u.correo AS email,
        u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
        CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS full_name,
        u.activo AS is_active, u.creado_en AS created_at
       FROM usuarios u
       LEFT JOIN empresas e ON e.id = u.empresa_id
       ORDER BY u.id DESC`,
    );
    res.json(rows);
  } catch (error) {
    console.error('users list error', error);
    res.status(500).json({ error: 'users table is not ready' });
  }
});

router.post('/', async (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password and fullName are required' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);

    // split fullName into first and last heuristically
    const parts = fullName.trim().split(/\s+/);
    const primer_nombre = parts[0] || null;
    const primer_apellido = parts.length > 1 ? parts[parts.length - 1] : null;

    const [result] = await pool.query(
      'INSERT INTO usuarios (correo, contrasena, primer_nombre, primer_apellido, activo, creado_en) VALUES (?, ?, ?, ?, 1, NOW())',
      [email.toLowerCase().trim(), passwordHash, primer_nombre, primer_apellido],
    );
    res.status(201).json({ id: result.insertId, email: email.toLowerCase().trim(), fullName: fullName.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user create error', error);
    res.status(500).json({ error: 'could not create user' });
  }
});

module.exports = router;