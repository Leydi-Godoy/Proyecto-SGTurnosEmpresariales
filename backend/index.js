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

	// debug: direct login check (bypasses auth router)
	app.post('/api/debug/login-check', async (req, res) => {
		const correo = String(req.body?.correo || '').trim().toLowerCase();
		const contrasena = String(req.body?.contrasena || '');
		if (!correo || !contrasena) return res.status(400).json({ error: 'correo and contrasena required' });
		try {
			const bcrypt = require('bcryptjs');
			const [rows] = await pool.query('SELECT contrasena FROM usuarios WHERE LOWER(correo) = ? LIMIT 1', [correo]);
			if (!rows[0]) return res.status(404).json({ error: 'user not found' });
			const ok = await bcrypt.compare(contrasena, rows[0].contrasena || '');
			return res.json({ ok });
		} catch (err) {
			console.error('debug login-check error', err);
			return res.status(500).json({ error: 'internal' });
		}
	});
} catch (e) {
	// ignore if db not available
}

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// auth routes
try {
	const authRouter = require('./auth');
	app.use('/api/auth', authRouter);
	app.use('/api/users', require('./users'));
	app.use('/api/empresas', require('./empresas'));
	app.use('/api/planes', require('./planes'));
	app.use('/api/empleado', require('./empleado'));
	app.use('/api/turnos', require('./routes/turnos'));
	app.use('/api/plantillas-turno', require('./routes/plantillas'));
	app.use('/api/configuraciones-malla', require('./routes/configuraciones-malla'));
	app.use('/api/planificador', require('./routes/planificador'));
} catch (e) {
	console.warn('Auth router not available:', e && e.message);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
