import { useState } from 'react'

export default function PerfilSuperAdmin() {
  const [usuario, setUsuario] = useState(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : {}
  })
  const [mensaje, setMensaje] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGuardar = async () => {
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email
        })
      })

      if (!response.ok) throw new Error('Error al actualizar el perfil')

      const userActualizado = { ...usuario, ...formData }
      localStorage.setItem('user', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setEditando(false)
      setMensaje('✅ Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (error) {
      setMensaje(`❌ ${error.message}`)
    }
  }

  if (!usuario) {
    return <div className="perfil-panel">Cargando...</div>
  }

  return (
    <div className="perfil-panel">
      <div className="panel-header">
        <h2>👤 Mi Perfil - Super Administrador</h2>
        <p className="subtitle">Información personal y datos de acceso</p>
      </div>

      {mensaje && (
        <div className={`message ${mensaje.includes('✅') ? 'success' : 'error'}`}>
          {mensaje}
        </div>
      )}

      {!editando ? (
        <div className="perfil-view">
          <div className="perfil-section">
            <h3>Información Personal</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre</label>
                <p>{usuario.nombre || 'No registrado'}</p>
              </div>
              <div className="info-item">
                <label>Apellidos</label>
                <p>{usuario.apellidos || 'No registrado'}</p>
              </div>
              <div className="info-item">
                <label>Correo Electrónico</label>
                <p>{usuario.email || 'No registrado'}</p>
              </div>
              <div className="info-item">
                <label>Rol</label>
                <p>
                  <span className="badge badge-super-admin">Super Administrador</span>
                </p>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <p>
                  <span className={`badge ${usuario.activo ? 'badge-active' : 'badge-inactive'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Fecha de Registro</label>
                <p>{usuario.fecha_creacion ? new Date(usuario.fecha_creacion).toLocaleDateString('es-ES') : 'No disponible'}</p>
              </div>
              <div className="info-item">
                <label>Última Actualización</label>
                <p>{usuario.fecha_actualizacion ? new Date(usuario.fecha_actualizacion).toLocaleDateString('es-ES') : 'No disponible'}</p>
              </div>
            </div>
          </div>

          <div className="perfil-actions">
            <button className="btn btn-primary" onClick={() => setEditando(true)}>
              ✏️ Editar Perfil
            </button>
          </div>
        </div>
      ) : (
        <div className="perfil-edit">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              placeholder="Nombre"
            />
          </div>
          <div className="form-group">
            <label>Apellidos</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos || ''}
              onChange={handleChange}
              placeholder="Apellidos"
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleGuardar}>
              💾 Guardar Cambios
            </button>
            <button className="btn btn-secondary" onClick={() => setEditando(false)}>
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
