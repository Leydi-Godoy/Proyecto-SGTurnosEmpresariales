const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// auth routes
try {
	const authRouter = require('./auth');
	app.use('/api/auth', authRouter);
} catch (e) {
	console.warn('Auth router not available:', e && e.message);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));
