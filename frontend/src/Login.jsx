import { useState } from 'react'
import { ForgotPassword } from './PasswordReset'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
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
        </div>
        <div className="login-right">
          {showForgotPassword ? <ForgotPassword onBack={() => setShowForgotPassword(false)} /> : <form onSubmit={submit}>
            <div className="login-heading">
              <h2>Iniciar sesión</h2>
              <p>Accede a tu cuenta para gestionar turnos</p>
            </div>
            <label htmlFor="correo">
              Usuario
              <input id="correo" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </label>
            <label htmlFor="contrasena">
              Contraseña
              <span className="password-field">
                <input id="contrasena" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                <button
                  className="password-visibility"
                  type="button"
                  aria-label="Mantener presionado para ver la contraseña"
                  onPointerDown={() => setShowPassword(true)}
                  onPointerUp={() => setShowPassword(false)}
                  onPointerLeave={() => setShowPassword(false)}
                  onPointerCancel={() => setShowPassword(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setShowPassword(true)
                  }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setShowPassword(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M2.2 12s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6-9.8-6Z" />
                    <circle cx="12" cy="12" r="2.7" />
                  </svg>
                </button>
              </span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            </div>
            <button className="link-button login-forgot" type="button" onClick={() => { setError(null); setShowForgotPassword(true) }}>¿Olvidaste tu contraseña?</button>
            {error && <div style={{ color: 'var(--accent)', marginTop: 8 }}>{error}</div>}
          </form>}
        </div>
      </div>
    </div>
  )
}
