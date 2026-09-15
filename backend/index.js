const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// debug route: find user in `usuarios` by email (temporary, local use)
try {
	const { pool } = require('./db');
	app.get('/api/debug/finduser', async (req, res) => {
		const email = String(req.query.email || '').trim().toLowerCase();
		if (!email) return res.status(400).json({ error: 'email required' });
		try {
			const [rows] = await pool.query('SELECT id, correo, primer_nombre, primer_apellido, activo, CHAR_LENGTH(contrasena) AS len FROM usuarios WHERE LOWER(correo) = ? LIMIT 1', [email]);
			return res.json({ found: Boolean(rows[0]), row: rows[0] || null });
		} catch (err) {
			return res.status(500).json({ error: err.code || err.message });
		}
	});
	app.get('/api/debug/checkpass', async (req, res) => {
		const email = String(req.query.email || '').trim().toLowerCase();
		const pass = String(req.query.pass || '');
		if (!email || !pass) return res.status(400).json({ error: 'email and pass required' });
		try {
			const bcrypt = require('bcryptjs');
			const [rows] = await pool.query('SELECT contrasena FROM usuarios WHERE LOWER(correo) = ? LIMIT 1', [email]);
			if (!rows[0]) return res.json({ found: false });
			const ok = await bcrypt.compare(pass, rows[0].contrasena || '');
			return res.json({ found: true, match: ok });
		} catch (err) {
			return res.status(500).json({ error: err.code || err.message });
		}
	});

	// debug routes kept minimal; temporary login-check removed
} catch (e) {
	// ignore if db not available
}

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// auth routes
try {
	const authRouter = require('./auth');
	app.use('/api/auth', authRouter);
	app.use('/api/users', require('./users'));
} catch (e) {
	console.warn('Auth router not available:', e && e.message);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
