const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();
const SUPER_ADMIN_ROLES = new Set(['super_admin', 'subad1']);

function requireSuperAdmin(req, res, next) {
  if (!SUPER_ADMIN_ROLES.has(req.auth?.role)) {
    return res.status(403).json({ error: 'super admin role required' });
  }
  next();
}

router.use(authenticateToken, requireSuperAdmin);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, is_active, created_at FROM users ORDER BY id DESC',
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
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, is_active) VALUES (?, ?, ?, 1)',
      [email.toLowerCase().trim(), passwordHash, fullName.trim()],
    );
    res.status(201).json({ id: result.insertId, email: email.toLowerCase().trim(), fullName: fullName.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user create error', error);
    res.status(500).json({ error: 'could not create user' });
  }
});

module.exports = router;