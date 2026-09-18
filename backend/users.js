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
        u.documento, u.id_rol AS rol,
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
  const {
    email,
    password,
    fullName,
    empresa_id: empresaId,
    primer_nombre: primerNombre,
    segundo_nombre: segundoNombre,
    primer_apellido: primerApellido,
    segundo_apellido: segundoApellido,
    documento,
    rol = 5,
    activo = true,
  } = req.body || {};

  const correo = String(email || '').trim().toLowerCase();
  const empresaIdNumero = Number(empresaId);
  const rolNumero = Number(rol);
  const nombreCompleto = String(fullName || '').trim();
  const nombres = primerNombre || nombreCompleto.split(/\s+/)[0] || null;
  const apellido = primerApellido || (nombreCompleto.split(/\s+/).length > 1 ? nombreCompleto.split(/\s+/).at(-1) : null);

  if (!correo || !password || (!nombreCompleto && !nombres) || !empresaIdNumero) {
    return res.status(400).json({ error: 'email, password, nombre y empresa_id son requeridos' });
  }
  if (!Number.isInteger(rolNumero) || rolNumero < 1 || rolNumero > 5) {
    return res.status(400).json({ error: 'rol debe estar entre 1 y 5' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO usuarios
        (empresa_id, correo, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         documento, contrasena, activo, esta_activo, creado_en, id_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [empresaIdNumero, correo, nombres, segundoNombre || null, apellido, segundoApellido || null,
        documento ? String(documento).trim() : null, passwordHash, Number(Boolean(activo)), Number(Boolean(activo)), rolNumero],
    );

    await pool.query(
      `INSERT INTO usuario_roles (usuario_id, rol_id, alcance)
       VALUES (?, ?, 'empresa')
       ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id)`,
      [result.insertId, rolNumero],
    );

    res.status(201).json({
      id: result.insertId,
      empresa_id: empresaIdNumero,
      email: correo,
      fullName: [nombres, segundoNombre, apellido, segundoApellido].filter(Boolean).join(' '),
      documento: documento ? String(documento).trim() : null,
      rol: rolNumero,
      activo: Boolean(activo),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user create error', error);
    res.status(500).json({ error: 'could not create user' });
  }
});

module.exports = router;