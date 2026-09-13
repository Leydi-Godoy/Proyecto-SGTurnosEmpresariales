const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

let pool;
try {
  // try to load the DB pool if mysql2 is installed and configured
  pool = require('./db').pool;
} catch (e) {
  pool = null;
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'token required' });

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

async function findUser(correo) {
  if (!pool) return null;

  const normalizedEmail = correo.trim().toLowerCase();

  // Prefer the normalized schema, but continue with the legacy schema when
  // the database contains both tables and the user exists only in `usuario`.
  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario, full_name AS nombre, email AS correo,
              password_hash AS contrasena, NULL AS Id_rol
       FROM users
       WHERE LOWER(email) = ? AND is_active = 1
       LIMIT 1`,
      [normalizedEmail],
    );
    if (rows[0]) return rows[0];
  } catch (error) {
    if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code)) throw error;
  }

  try {
    const [rows] = await pool.query(
      `SELECT Id_usuario,
              CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) AS nombre,
              correo, contrasena, Id_rol
       FROM usuario
       WHERE LOWER(correo) = ? AND activo = 1
       LIMIT 1`,
      [normalizedEmail],
    );
    return rows[0] || null;
  } catch (error) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code)) return null;
    throw error;
  }
}

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body || {};
  if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena required' });

  try {
    const user = await findUser(correo);

    // Development-only fallback. Production login must use MySQL.
    if (!user) {
      if (correo.trim().toLowerCase() === (process.env.DEV_ADMIN_EMAIL || 'admin@local').toLowerCase()) {
        const demoHash = process.env.DEV_ADMIN_HASH || bcrypt.hashSync('admin', 8);
        if (!bcrypt.compareSync(contrasena, demoHash)) return res.status(401).json({ error: 'invalid credentials' });
        const demo = { Id_usuario: 1, nombre: 'Admin', correo: correo, Id_rol: 'super_admin' };
        const token = jwt.sign({ id: demo.Id_usuario, role: demo.Id_rol }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });
        return res.json({ token, user: demo });
      }
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const role = user.Id_rol || (user.correo.toLowerCase() === 'superadmin@sgturnos.com' ? 'super_admin' : 'user');
    const payload = { id: user.Id_usuario, role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });

    res.json({ token, user: { Id_usuario: user.Id_usuario, nombre: user.nombre, correo: user.correo, Id_rol: role } });
  } catch (err) {
    console.error('auth error', err);
    res.status(503).json({ error: 'database unavailable' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ authenticated: true, auth: req.auth });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
