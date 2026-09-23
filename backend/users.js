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
  const contrasena = String(password || '').trim() || `${String(apellido || '').replace(/\s+/g, '')}123`;

  if (!correo || !contrasena || (!nombreCompleto && !nombres) || !empresaIdNumero || !apellido) {
    return res.status(400).json({ error: 'email, primer apellido, nombre y empresa_id son requeridos' });
  }
  if (!Number.isInteger(rolNumero) || rolNumero < 1 || rolNumero > 5) {
    return res.status(400).json({ error: 'rol debe estar entre 1 y 5' });
  }
  try {
    const passwordHash = await bcrypt.hash(contrasena, 12);

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

router.put('/:id', async (req, res) => {
  const usuarioId = Number(req.params.id);
  const {
    email,
    password,
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
  const nombres = String(primerNombre || '').trim();
  const apellido = String(primerApellido || '').trim();

  if (!usuarioId || !correo || !nombres || !apellido || !empresaIdNumero) {
    return res.status(400).json({ error: 'id, email, nombre, primer apellido y empresa_id son requeridos' });
  }
  if (!Number.isInteger(rolNumero) || rolNumero < 1 || rolNumero > 5) {
    return res.status(400).json({ error: 'rol debe estar entre 1 y 5' });
  }

  try {
    const [duplicateRows] = await pool.query(
      'SELECT id FROM usuarios WHERE empresa_id = ? AND correo = ? AND id <> ? LIMIT 1',
      [empresaIdNumero, correo, usuarioId],
    );
    if (duplicateRows[0]) return res.status(409).json({ error: 'email already exists' });

    const values = [
      empresaIdNumero,
      correo,
      nombres,
      String(segundoNombre || '').trim() || null,
      apellido,
      String(segundoApellido || '').trim() || null,
      documento ? String(documento).trim() : null,
      Number(Boolean(activo)),
      Number(Boolean(activo)),
      rolNumero,
      usuarioId,
    ];
    let query = `UPDATE usuarios
      SET empresa_id = ?, correo = ?, primer_nombre = ?, segundo_nombre = ?,
          primer_apellido = ?, segundo_apellido = ?, documento = ?, activo = ?,
          esta_activo = ?, actualizado_en = CURRENT_TIMESTAMP, id_rol = ?
      WHERE id = ?`;

    if (String(password || '').trim()) {
      query = `UPDATE usuarios
        SET empresa_id = ?, correo = ?, primer_nombre = ?, segundo_nombre = ?,
            primer_apellido = ?, segundo_apellido = ?, documento = ?, activo = ?,
            esta_activo = ?, actualizado_en = CURRENT_TIMESTAMP, id_rol = ?, contrasena = ?
        WHERE id = ?`;
      values.splice(values.length - 1, 0, await bcrypt.hash(String(password).trim(), 12));
    }

    const [result] = await pool.query(query, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'user not found' });

    res.json({
      id: usuarioId,
      empresa_id: empresaIdNumero,
      email: correo,
      primer_nombre: nombres,
      segundo_nombre: String(segundoNombre || '').trim() || null,
      primer_apellido: apellido,
      segundo_apellido: String(segundoApellido || '').trim() || null,
      documento: documento ? String(documento).trim() : null,
      rol: rolNumero,
      activo: Boolean(activo),
      fullName: [nombres, segundoNombre, apellido, segundoApellido].filter(Boolean).join(' '),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user update error', error);
    res.status(500).json({ error: 'could not update user' });
  }
});

module.exports = router;