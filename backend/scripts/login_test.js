require('dotenv').config();
(async () => {
  try {
    const fetch = global.fetch || (await import('node-fetch')).default;
    const url = process.env.BACKEND_URL || 'http://localhost:3001/api/auth/login';
    const body = { correo: 'leydigodoy@sgturnos.com', contrasena: 'godoy123' };
    console.log('POST', url, 'body=', body);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    console.log('Body:\n', text);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
