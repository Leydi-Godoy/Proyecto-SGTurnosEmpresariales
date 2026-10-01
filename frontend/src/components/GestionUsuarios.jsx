import { useEffect, useState } from 'react'

const initialForm = {
  documento: '',
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  email: '',
  password: '',
  especialidad_id: '',
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
  const [usuarioEditando, setUsuarioEditando] = useState(null)
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
    const defaultPassword = `${String(formData.primer_apellido || '').replace(/\s+/g, '')}123`
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'primer_apellido' && (!prev.password || prev.password === defaultPassword)
        ? { password: `${value.replace(/\s+/g, '')}123` }
        : {})
    }))
  }

  const validarForm = () => {
    if (!formData.documento.trim()) return 'Documento es requerido'
    if (!formData.primer_nombre.trim()) return 'Primer nombre es requerido'
    if (!formData.segundo_nombre.trim()) return 'Segundo nombre es requerido'
    if (!formData.primer_apellido.trim()) return 'Primer apellido es requerido'
    if (!formData.segundo_apellido.trim()) return 'Segundo apellido es requerido'
    if (!formData.email.trim()) return 'Email es requerido'
    if (!formData.especialidad_id) return 'Selecciona una profesión o especialidad'
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
        fullName: [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido].filter(Boolean).join(' '),
        primer_nombre: formData.primer_nombre.trim(),
        segundo_nombre: formData.segundo_nombre.trim(),
        primer_apellido: formData.primer_apellido.trim(),
        segundo_apellido: formData.segundo_apellido.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        documento: formData.documento.trim(),
        especialidad_id: Number(formData.especialidad_id),
        activo: formData.activo
      })
    })
    const data = await response.json()
    if (!response.ok) return setError(data.error || 'No se pudo crear el usuario')

    const especialidadSeleccionada = especialidades.find(item => String(item.id) === formData.especialidad_id)
    setUsuarios(prev => [...prev, {
      ...data,
      nombre: data.fullName,
      activo: data.activo,
      rol: '5',
      rol_nombre: 'Empleado',
      especialidad_nombre: especialidadSeleccionada?.nombre || '',
      especialidades_nombres: especialidadSeleccionada?.nombre || '',
      fecha_creacion: new Date().toISOString().split('T')[0]
    }])
    setFormData(initialForm)
    setShowForm(false)
    setMensaje('Usuario empleado creado correctamente')
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEditarEspecialidad = usuario => {
    setUsuarioEditando(usuario)
    setFormData({ ...initialForm, especialidad_id: String(usuario.especialidad_id || '') })
    setError('')
    setShowForm(true)
  }

  const handleGuardarEspecialidad = async () => {
    if (!formData.especialidad_id) return setError('Selecciona una profesión o especialidad')

    setError('')
    try {
      const response = await fetch(`/api/users/${usuarioEditando.id}/especialidad`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ especialidad_id: Number(formData.especialidad_id) })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo asignar la profesión')

      setUsuarios(prev => prev.map(usuario => usuario.id === usuarioEditando.id
        ? {
            ...usuario,
            especialidad_id: data.especialidad_id,
            especialidad_nombre: data.especialidad_nombre,
            especialidades_nombres: data.especialidad_nombre
          }
        : usuario
      ))
      setShowForm(false)
      setUsuarioEditando(null)
      setFormData(initialForm)
      setMensaje('Profesión asignada correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (requestError) {
      setError(requestError.message)
    }
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
        <button className="btn-agregar" onClick={() => { setUsuarioEditando(null); setFormData(initialForm); setShowForm(true) }}>
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
          <h3>{usuarioEditando ? `Asignar profesión a ${usuarioEditando.nombre}` : '➕ Crear Nuevo Usuario'}</h3>
          {!usuarioEditando && (
          <div className="form-grid">
            <label>
              Primer Nombre
              <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} placeholder="Primer nombre" required />
            </label>
            <label>
              Segundo Nombre
              <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} placeholder="Segundo nombre" required />
            </label>
            <label>
              Primer Apellido
              <input type="text" name="primer_apellido" value={formData.primer_apellido} onChange={handleChange} placeholder="Primer apellido" required />
            </label>
            <label>
              Segundo Apellido
              <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} placeholder="Segundo apellido" required />
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
          </div>
          )}
          <div className="form-grid">
            <label>
              Profesión o especialidad
              <select name="especialidad_id" value={formData.especialidad_id} onChange={handleChange} required>
                <option value="">Selecciona una profesión o especialidad</option>
                {especialidades.map(especialidad => (
                  <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
                ))}
              </select>
              {especialidades.length === 0 && <small>No hay especialidades disponibles para esta empresa.</small>}
              <small>Selecciona una especialidad para vincularla al empleado.</small>
            </label>
          </div>
          {!usuarioEditando && <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
              Usuario Activo
            </label>
          </div>}
          <div className="form-actions">
            <button className="btn btn-success" onClick={usuarioEditando ? handleGuardarEspecialidad : handleCrear}>💾 Guardar</button>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setUsuarioEditando(null); setFormData(initialForm); setError('') }}>✕ Cancelar</button>
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
                <th>Acciones</th>
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
                  <td>{usuario.rol === '5' && <button className="btn-editar" onClick={() => handleEditarEspecialidad(usuario)}>{usuario.especialidad_id ? 'Cambiar profesión' : 'Asignar profesión'}</button>}</td>
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
