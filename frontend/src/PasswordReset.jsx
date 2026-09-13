import { useEffect, useState } from 'react'

export function ForgotPassword({ onBack }) {
  const [correo, setCorreo] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar la solicitud')
      setMessage(data.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="password-reset-panel">
      <h2>Restablecer contraseña</h2>
      <p className="form-help">Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
      <form onSubmit={submit}>
        <label htmlFor="reset-correo">Correo
          <input id="reset-correo" type="email" autoComplete="email" required value={correo} onChange={(event) => setCorreo(event.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar enlace'}</button>
      </form>
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="link-button" type="button" onClick={onBack}>Volver al login</button>
    </div>
  )
}

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') || ''
  const [status, setStatus] = useState(token ? 'checking' : 'invalid')
  const [error, setError] = useState(token ? '' : 'El enlace de recuperación está incompleto.')
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || !data.valid) throw new Error(data.error || 'El enlace no es válido')
        setStatus('ready')
      })
      .catch((requestError) => {
        setStatus('invalid')
        setError(requestError.message)
      })
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contrasena, confirmarContrasena }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la contraseña')
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'checking') return <div className="password-reset-panel"><p className="form-help">Validando enlace...</p></div>
  if (status === 'invalid') return <div className="password-reset-panel"><h2>Enlace no disponible</h2><p className="form-error">{error}</p><a className="link-button" href="/">Volver al login</a></div>
  if (status === 'success') return <div className="password-reset-panel"><h2>Contraseña actualizada</h2><p className="form-success">Tu contraseña se cambió correctamente.</p><a className="link-button" href="/">Volver al login</a></div>

  return (
    <div className="password-reset-panel">
      <h2>Define tu nueva contraseña</h2>
      <p className="form-help">Confirma que deseas restablecerla y escribe una contraseña nueva de al menos 8 caracteres.</p>
      <form onSubmit={submit}>
        <label htmlFor="new-password">Nueva contraseña
          <input id="new-password" type="password" minLength="8" autoComplete="new-password" required value={contrasena} onChange={(event) => setContrasena(event.target.value)} />
        </label>
        <label htmlFor="confirm-password">Confirmar contraseña
          <input id="confirm-password" type="password" minLength="8" autoComplete="new-password" required value={confirmarContrasena} onChange={(event) => setConfirmarContrasena(event.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Confirmar cambio'}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
