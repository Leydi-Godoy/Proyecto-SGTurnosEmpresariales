const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createMailer() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
}

async function sendResetEmail(email, resetUrl) {
  const mailer = createMailer();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`Password reset link for ${email}: ${resetUrl}`);
      return;
    }
    throw new Error('SMTP is not configured');
  }

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Restablece tu contraseña de SGTurnos',
    text: `Solicitaste restablecer tu contraseña. Abre este enlace antes de una hora: ${resetUrl}`,
    html: `<p>Solicitaste restablecer tu contraseña de SGTurnos.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>El enlace expira en una hora y solo puede utilizarse una vez.</p>`,
  });
}

async function findUser(correo) {
  if (!pool) return null;

  const normalizedEmail = correo.trim().toLowerCase();

  // Company users are stored in `usuarios`, where empresa_id is available.
  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario,
              CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) AS nombre,
              correo, contrasena, Id_rol, empresa_id,
              primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, activo,
              'usuarios' AS source
       FROM usuarios
       WHERE LOWER(correo) = ? AND activo = 1
       LIMIT 1`,
      [normalizedEmail],
    );
    if (rows[0]) return rows[0];
  } catch (error) {
    if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code)) throw error;
  }

  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario, full_name AS nombre, email AS correo,
        password_hash AS contrasena, NULL AS Id_rol, 'users' AS source
       FROM users
       WHERE LOWER(email) = ? AND is_active = 1
       LIMIT 1`,
      [normalizedEmail],
    );
    return rows[0] || null;
  } catch (error) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code)) return null;
    throw error;
  }
}

router.post('/forgot-password', async (req, res) => {
  const correo = String(req.body?.correo || '').trim().toLowerCase();
  const genericResponse = { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };

  if (!correo) return res.status(400).json({ error: 'El correo es obligatorio' });

  try {
    const user = await findUser(correo);
    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `DELETE FROM password_reset_tokens
       WHERE used_at IS NULL AND ((user_id IS NOT NULL AND user_id = ?) OR (legacy_user_id IS NOT NULL AND legacy_user_id = ?))`,
      [user.source === 'users' ? user.Id_usuario : null, user.source === 'usuarios' ? user.Id_usuario : null],
    );
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, legacy_user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [user.source === 'users' ? user.Id_usuario : null, user.source === 'usuarios' ? user.Id_usuario : null, tokenHash, expiresAt],
    );

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    await sendResetEmail(user.correo, `${frontendUrl}/restablecer-contrasena?token=${rawToken}`);
    return res.json(genericResponse);
  } catch (err) {
    console.error('password reset request error', err);
    return res.status(503).json({ error: 'No se pudo procesar la solicitud. Intenta nuevamente.' });
  }
});

router.get('/reset-password/validate', async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) return res.status(400).json({ valid: false, error: 'Enlace inválido' });

  try {
    const [rows] = await pool.query(
      `SELECT id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1`,
      [hashResetToken(token)],
    );
    const resetToken = rows[0];
    const valid = Boolean(resetToken && !resetToken.used_at && new Date(resetToken.expires_at).getTime() > Date.now());
    return res.json(valid ? { valid: true } : { valid: false, error: 'El enlace es inválido o ya expiró.' });
  } catch (err) {
    console.error('password reset validation error', err);
    return res.status(503).json({ valid: false, error: 'No se pudo validar el enlace.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const token = String(req.body?.token || '');
  const contrasena = String(req.body?.contrasena || '');
  const confirmarContrasena = String(req.body?.confirmarContrasena || '');

  if (!token || contrasena.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  if (contrasena !== confirmarContrasena) return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  if (!pool) return res.status(503).json({ error: 'Base de datos no disponible.' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT id, user_id, legacy_user_id, expires_at, used_at
       FROM password_reset_tokens WHERE token_hash = ? LIMIT 1 FOR UPDATE`,
      [hashResetToken(token)],
    );
    const resetToken = rows[0];
    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      return res.status(400).json({ error: 'El enlace es inválido o ya expiró.' });
    }

    const passwordHash = await bcrypt.hash(contrasena, 12);
    const [result] = resetToken.user_id
      ? await connection.query('UPDATE users SET password_hash = ? WHERE id = ? AND is_active = 1', [passwordHash, resetToken.user_id])
      : await connection.query('UPDATE usuarios SET contrasena = ? WHERE id = ? AND activo = 1', [passwordHash, resetToken.legacy_user_id]);
    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(400).json({ error: 'La cuenta ya no está disponible.' });
    }

    await connection.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [resetToken.id]);
    await connection.commit();
    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    await connection.rollback();
    console.error('password reset update error', err);
    return res.status(503).json({ error: 'No se pudo actualizar la contraseña.' });
  } finally {
    connection.release();
  }
});

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

async function getUserById(id) {
  if (!pool) return null;
  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario,
              CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) AS nombre,
              correo, contrasena, Id_rol, empresa_id,
              primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, activo,
              'usuarios' AS source
       FROM usuarios WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows[0]) return rows[0];
  } catch (err) {
    if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) throw err;
  }

  try {
    const [rows] = await pool.query(
      `SELECT id AS Id_usuario, full_name AS nombre, email AS correo,
        password_hash AS contrasena, NULL AS Id_rol, 'users' AS source
       FROM users WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows[0]) return rows[0];
    return null;
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return null;
    throw err;
  }
}

async function getCompanyById(empresaId) {
  if (!pool || !empresaId) return null;
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, nit, pais, ciudad, contacto, correo, telefono,
              activo, zona_horaria, plan_id
       FROM empresas WHERE id = ? LIMIT 1`,
      [empresaId],
    );
    return rows[0] || null;
  } catch (err) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) return null;
    throw err;
  }
}

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const id = req.auth?.id;
    if (!id) return res.status(401).json({ error: 'invalid token' });
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const company = user.empresa_id ? await getCompanyById(user.empresa_id) : null;
    return res.json({ user: {
      Id_usuario: user.Id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      Id_rol: user.Id_rol,
      primer_nombre: user.primer_nombre,
      segundo_nombre: user.segundo_nombre,
      primer_apellido: user.primer_apellido,
      segundo_apellido: user.segundo_apellido,
      telefono: user.telefono,
      activo: user.activo,
      source: user.source || 'usuarios',
    }, company });
  } catch (err) {
    console.error('GET /me error', err);
    res.status(503).json({ error: 'could not fetch profile' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono } = req.body || {};
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  try {
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    if (user.source === 'users') {
      // For normalized users we only allow changing full name and phone via full_name
      const fullName = [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido].filter(Boolean).join(' ').trim();
      if (!fullName) return res.status(400).json({ error: 'at least one name field required' });
      await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [fullName, telefono || null, id]);
      return res.json({ message: 'profile updated' });
    }

    await pool.query(
      'UPDATE usuarios SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, telefono = ? WHERE id = ?',
      [primer_nombre || null, segundo_nombre || null, primer_apellido || null, segundo_apellido || null, telefono || null, id],
    );
    return res.json({ message: 'profile updated' });
  } catch (err) {
    console.error('PUT /me error', err);
    res.status(503).json({ error: 'could not update profile' });
  }
});

router.post('/me/change-password', authenticateToken, async (req, res) => {
  const id = req.auth?.id;
  if (!id) return res.status(401).json({ error: 'invalid token' });
  const { oldPassword, newPassword, confirmPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'oldPassword and newPassword required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'newPassword must be at least 8 characters' });
  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'passwords do not match' });
  if (!pool) return res.status(503).json({ error: 'database unavailable' });

  try {
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'user not found' });

    const match = await bcrypt.compare(oldPassword, user.contrasena);
    if (!match) return res.status(401).json({ error: 'invalid current password' });

    const newHash = await bcrypt.hash(newPassword, 12);
    if (user.source === 'users') {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, id]);
    } else {
      await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [newHash, id]);
    }
    return res.json({ message: 'password changed' });
  } catch (err) {
    console.error('POST /me/change-password error', err);
    res.status(503).json({ error: 'could not change password' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
