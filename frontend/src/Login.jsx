import { useState } from 'react'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      localStorage.setItem('token', data.token)
      if (onLogin) onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-grid">
        <div className="login-left">
          <img src="/logo.png" alt="SGTurnos" className="login-logo" />
          <h2>Iniciar sesión</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Accede a tu cuenta para gestionar turnos</p>
        </div>
        <div className="login-right">
          <form onSubmit={submit}>
            <label>
              Correo
              <input value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </label>
            <label>
              Contraseña
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            </div>
            {error && <div style={{ color: 'var(--accent)', marginTop: 8 }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
