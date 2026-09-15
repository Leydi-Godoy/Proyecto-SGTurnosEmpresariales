import { useEffect, useState } from 'react'

export default function EditProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState({ 
    primer_nombre: '', 
    segundo_nombre: '', 
    primer_apellido: '', 
    segundo_apellido: '', 
    email: '',
    telefono: '' 
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((d) => { 
        const user = d.user || d
        setProfile(user)
        setEdit({ 
          primer_nombre: user.primer_nombre || '', 
          segundo_nombre: user.segundo_nombre || '', 
          primer_apellido: user.primer_apellido || '', 
          segundo_apellido: user.segundo_apellido || '', 
          email: user.email || '',
          telefono: user.telefono || '' 
        })
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setMsg('')
    setEnviando(true)
    
    try {
      const res = await fetch('/api/auth/me', { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }, 
        body: JSON.stringify(edit) 
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'No se pudo actualizar el perfil')
      
      setMsg('Perfil actualizado exitosamente')
      setMsgType('success')
      setTimeout(() => {
        setMsg('')
        setMsgType('')
      }, 4000)
    } catch (err) { 
      setMsg(err.message)
      setMsgType('error')
    } finally {
      setEnviando(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    setMsg('')
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg('Las nuevas contraseñas no coinciden')
      setMsgType('error')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMsg('La nueva contraseña debe tener al menos 8 caracteres')
      setMsgType('error')
      return
    }

    setEnviando(true)
    
    try {
      const res = await fetch('/api/auth/me/change-password', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }, 
        body: JSON.stringify(passwordForm) 
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'No se pudo cambiar la contraseña')
      
      setMsg('Contraseña cambiada exitosamente')
      setMsgType('success')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      
      setTimeout(() => {
        setMsg('')
        setMsgType('')
      }, 4000)
    } catch (err) { 
      setMsg(err.message)
      setMsgType('error')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <section className="panel"><p>Cargando perfil...</p></section>

  return (
    <section className="panel edit-profile-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Configuración Personal</span>
          <h2>Editar mis datos</h2>
        </div>
      </div>

      {msg && (
        <div className={`feedback ${msgType}`}>
          {msg}
        </div>
      )}

      <form onSubmit={saveProfile} className="edit-profile-form">
        <div className="form-section">
          <h3>Información personal</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primer_nombre">Primer nombre</label>
              <input 
                id="primer_nombre"
                type="text"
                placeholder="Primer nombre" 
                value={edit.primer_nombre} 
                onChange={(e) => setEdit({ ...edit, primer_nombre: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="segundo_nombre">Segundo nombre</label>
              <input 
                id="segundo_nombre"
                type="text"
                placeholder="Segundo nombre" 
                value={edit.segundo_nombre} 
                onChange={(e) => setEdit({ ...edit, segundo_nombre: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primer_apellido">Primer apellido</label>
              <input 
                id="primer_apellido"
                type="text"
                placeholder="Primer apellido" 
                value={edit.primer_apellido} 
                onChange={(e) => setEdit({ ...edit, primer_apellido: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="segundo_apellido">Segundo apellido</label>
              <input 
                id="segundo_apellido"
                type="text"
                placeholder="Segundo apellido" 
                value={edit.segundo_apellido} 
                onChange={(e) => setEdit({ ...edit, segundo_apellido: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input 
              id="email"
              type="email"
              placeholder="Correo electrónico" 
              value={edit.email} 
              onChange={(e) => setEdit({ ...edit, email: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input 
              id="telefono"
              type="tel"
              placeholder="Teléfono" 
              value={edit.telefono} 
              onChange={(e) => setEdit({ ...edit, telefono: e.target.value })} 
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="button-primary" 
            type="submit"
            disabled={enviando}
          >
            {enviando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <div className="form-section password-section">
        <div className="section-header">
          <h3>Seguridad</h3>
          <button 
            type="button"
            className={`button-secondary ${showPasswordForm ? 'active' : ''}`}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={changePassword} className="change-password-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Contraseña actual</label>
              <input 
                id="oldPassword"
                type="password" 
                placeholder="Ingresa tu contraseña actual" 
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input 
                id="newPassword"
                type="password" 
                placeholder="Nueva contraseña (mínimo 8 caracteres)" 
                minLength="8" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required 
              />
              <small>Mínimo 8 caracteres</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input 
                id="confirmPassword"
                type="password" 
                placeholder="Confirma tu nueva contraseña" 
                minLength="8" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required 
              />
            </div>

            <div className="form-actions">
              <button 
                className="button-primary" 
                type="submit"
                disabled={enviando}
              >
                {enviando ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              <button 
                className="button-secondary" 
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
