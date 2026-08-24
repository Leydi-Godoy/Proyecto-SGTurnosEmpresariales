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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body || {};
  if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena required' });

  try {
    let user;
    if (pool) {
      const [rows] = await pool.query('SELECT Id_usuario, primer_nombre, primer_apellido, correo, contrasena, Id_rol FROM usuario WHERE correo = ? LIMIT 1', [correo]);
      user = rows[0];
    }

    // fallback demo user if DB not available
    if (!user) {
      // demo credentials for development: admin@local / admin
      if (correo === process.env.DEV_ADMIN_EMAIL || correo === 'admin@local') {
        const demoHash = process.env.DEV_ADMIN_HASH || bcrypt.hashSync('admin', 8);
        if (!bcrypt.compareSync(contrasena, demoHash)) return res.status(401).json({ error: 'invalid credentials' });
        const demo = { Id_usuario: 1, primer_nombre: 'Admin', primer_apellido: '', correo: correo, Id_rol: 'supad1' };
        const token = jwt.sign({ id: demo.Id_usuario, role: demo.Id_rol }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });
        return res.json({ token, user: demo });
      }
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const payload = { id: user.Id_usuario, role: user.Id_rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });

    res.json({ token, user: { Id_usuario: user.Id_usuario, primer_nombre: user.primer_nombre, correo: user.correo, Id_rol: user.Id_rol } });
  } catch (err) {
    console.error('auth error', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
