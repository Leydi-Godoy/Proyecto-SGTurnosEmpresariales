import { useEffect, useState } from 'react'

const initialForm = {
  documento: '',
  nombre: '',
  email: '',
  password: '',
  especialidad_ids: [],
  activo: true
}

function getRolNombre(id) {
  return String(id) === '5' ? 'Empleado' : 'Desconocido'
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState(initialForm)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    Promise.all([
      fetch('/api/users', { headers }),
      fetch('/api/users/company', { headers }),
      fetch('/api/perfiles', { headers })
    ])
      .then(async responses => Promise.all(responses.map(async response => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'No se pudo cargar la información')
        return body
      })))
      .then(([usersData, companyData, specialtiesData]) => {
        setUsuarios(usersData.map(usuario => ({
          ...usuario,
          nombre: usuario.full_name,
          activo: Boolean(usuario.is_active),
          fecha_creacion: usuario.created_at,
          rol: String(usuario.rol || '5'),
          rol_nombre: getRolNombre(usuario.rol)
        })))
        setEmpresa(companyData)
        setEspecialidades(specialtiesData)
      })
      .catch(requestError => setError(requestError.message))
      .finally(() => setCargando(false))
  }, [])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validarForm = () => {
    if (!formData.documento.trim()) return 'Documento es requerido'
    if (!formData.nombre.trim()) return 'Nombre completo es requerido'
    if (!formData.email.trim()) return 'Email es requerido'
    if (!formData.especialidad_ids.length) return 'Selecciona al menos una profesión o especialidad'
    if (usuarios.some(usuario => usuario.documento === formData.documento.trim())) return 'Este documento ya existe'
    if (usuarios.some(usuario => usuario.email.toLowerCase() === formData.email.trim().toLowerCase())) return 'Este email ya existe'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email invalido'
    return null
  }

  const handleCrear = async () => {
    const validationError = validarForm()
    if (validationError) return setError(validationError)

    setError('')
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        fullName: formData.nombre.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        documento: formData.documento.trim(),
        especialidad_ids: formData.especialidad_ids.map(Number),
        activo: formData.activo
      })
    })
    const data = await response.json()
    if (!response.ok) return setError(data.error || 'No se pudo crear el usuario')

    const especialidadesSeleccionadas = especialidades.filter(item => formData.especialidad_ids.includes(String(item.id)))
    setUsuarios(prev => [...prev, {
      ...data,
      nombre: data.fullName,
      activo: data.activo,
      rol: '5',
      rol_nombre: 'Empleado',
      especialidad_nombre: especialidadesSeleccionadas.map(item => item.nombre).join(', '),
      especialidades_nombres: especialidadesSeleccionadas.map(item => item.nombre).join(', '),
      fecha_creacion: new Date().toISOString().split('T')[0]
    }])
    setFormData(initialForm)
    setShowForm(false)
    setMensaje('Usuario empleado creado correctamente')
    setTimeout(() => setMensaje(''), 3000)
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    const search = searchTerm.toLowerCase()
    return usuario.nombre.toLowerCase().includes(search) ||
      usuario.email.toLowerCase().includes(search) ||
      String(usuario.documento || '').includes(search)
  })

  return (
    <div className="gestion-usuarios-panel">
      <div className="panel-header">
        <h2>Gestion de Usuarios</h2>
        <p className="subtitle">Crea empleados de tu empresa y asigna su profesión o especialidad</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Crear Nuevo Usuario
        </button>
      </div>

      {mensaje && <div className="success-message">{mensaje}</div>}
      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="usuarios-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="search-input"
          />
        </div>
        <div className="usuarios-stats">
          <span className="stat">Total: {usuarios.length}</span>
          <span className="stat">Activos: {usuarios.filter(usuario => usuario.activo).length}</span>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>➕ Crear Nuevo Usuario</h3>
          <div className="form-grid">
            <label>
              Nombre Completo
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre completo del usuario" required />
            </label>
            <label>
              Documento
              <input type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="Número de documento" required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@empresa.com" required />
            </label>
            <label>
              Contraseña
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Opcional, se genera automáticamente" />
              <small>Si la dejas vacía se genera una contraseña inicial.</small>
            </label>
            <label className="readonly-field">
              Empresa
              <input type="text" value={empresa?.nombre || 'Empresa autenticada'} disabled />
              <small>Asignada automáticamente por la empresa del administrador.</small>
            </label>
            <label className="readonly-field">
              Rol
              <input type="text" value="Empleado" disabled />
              <small>Todos los usuarios creados aquí serán empleados.</small>
            </label>
            <div className="specialty-field">
              Profesiones o especialidades
              <span className="especialidades-checkboxes">
                {especialidades.length === 0 && <small>No hay especialidades disponibles para esta empresa.</small>}
                {especialidades.map(especialidad => {
                  const especialidadId = String(especialidad.id)
                  return (
                    <label key={especialidad.id} className="especialidad-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.especialidad_ids.includes(especialidadId)}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          especialidad_ids: prev.especialidad_ids.includes(especialidadId)
                            ? prev.especialidad_ids.filter(id => id !== especialidadId)
                            : [...prev.especialidad_ids, especialidadId]
                        }))}
                      />
                      <span>{especialidad.nombre}</span>
                    </label>
                  )
                })}
              </span>
              <small>Selecciona una o varias especialidades para vincularlas al empleado.</small>
              </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
              Usuario Activo
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleCrear}>💾 Guardar</button>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setFormData(initialForm); setError('') }}>✕ Cancelar</button>
          </div>
        </div>
      )}

      {cargando ? <p>Cargando usuarios...</p> : (
        <div className="usuarios-table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Profesión/Especialidad</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creacion</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className={usuario.activo ? 'activo' : 'inactivo'}>
                  <td><strong>{usuario.documento}</strong></td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.especialidades_nombres || usuario.especialidad_nombre || 'Sin asignar'}</td>
                  <td><span className={`rol-badge rol-${usuario.rol}`}>{usuario.rol_nombre}</span></td>
                  <td><span className={`status-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>{usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>{usuario.fecha_creacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && usuariosFiltrados.length === 0 && <div className="empty-state"><p>No hay usuarios que coincidan con la busqueda</p></div>}
    </div>
  )
}
