import { useState, useEffect } from 'react'

export default function GestionUsuariosGlobal() {
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas')
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    password: '',
    documento: '',
    empresa_id: '',
    rol: '5',
    activo: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('/api/empresas', { headers }).then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las empresas')
        return data
      }),
      fetch('/api/users', { headers }).then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los usuarios')
        return data
      })
    ]).then(([empresasData, usuariosData]) => {
      setEmpresas(empresasData)
      setUsuarios(usuariosData.map(usuario => ({
        ...usuario,
        nombre: usuario.full_name,
        activo: Boolean(usuario.is_active),
        fecha_creacion: usuario.created_at,
        rol: String(usuario.rol || '5'),
        rol_nombre: getRolNombre(usuario.rol || '5')
      })))
    }).catch(error => setMensaje(`⚠️ ${error.message}`))
  }, [])

  const getRolNombre = (id) => {
    const roles = {
      '1': 'Super Administrador',
      '2': 'Admin Empresa',
      '3': 'Planificador',
      '4': 'Supervisor',
      '5': 'Empleado'
    }
    return roles[String(id)] || 'Desconocido'
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validarForm = () => {
    if (!formData.primer_nombre) return 'Primer nombre es requerido'
    if (!formData.segundo_nombre) return 'Segundo nombre es requerido'
    if (!formData.primer_apellido) return 'Primer apellido es requerido'
    if (!formData.segundo_apellido) return 'Segundo apellido es requerido'
    if (!formData.email) return 'Email es requerido'
    if (!formData.documento) return 'Documento es requerido'
    if (!formData.empresa_id) return 'Empresa es requerida'
    if (!formData.rol) return 'Rol es requerido'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email inválido'

    if (!editando) {
      const docExiste = usuarios.some(u => u.documento === formData.documento)
      const emailExiste = usuarios.some(u => u.email === formData.email)
      if (docExiste) return 'Este documento ya existe'
      if (emailExiste) return 'Este email ya existe'
    }

    return null
  }

  const handleGuardar = async () => {
    const error = validarForm()
    if (error) return alert(error)

    if (!editando && !formData.password) return alert('Contraseña es requerida')

    const empresaSeleccionada = empresas.find(e => e.id === parseInt(formData.empresa_id))

    if (editando) {
      setUsuarios(prev => prev.map(u =>
        u.id === editando
          ? {
              ...u,
              ...formData,
              empresa_id: parseInt(formData.empresa_id),
              empresa_nombre: empresaSeleccionada.nombre,
              rol_nombre: getRolNombre(formData.rol)
            }
          : u
      ))
      setMensaje('✅ Usuario actualizado correctamente')
      setEditando(null)
    } else {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido].filter(Boolean).join(' '),
          primer_nombre: formData.primer_nombre,
          segundo_nombre: formData.segundo_nombre,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido,
          documento: formData.documento,
          empresa_id: Number(formData.empresa_id),
          rol: Number(formData.rol),
          activo: formData.activo
        })
      })
      const data = await response.json()
      if (!response.ok) return setMensaje(`⚠️ ${data.error || 'No se pudo crear el usuario'}`)

      setUsuarios(prev => [...prev, {
        ...data,
        nombre: data.fullName,
        empresa_nombre: empresaSeleccionada.nombre,
        rol_nombre: getRolNombre(data.rol),
        fecha_creacion: new Date().toISOString().split('T')[0]
      }])
      setMensaje('✅ Usuario creado correctamente')
    }

    setFormData({
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      email: '',
      password: '',
      documento: '',
      empresa_id: '',
      rol: '5',
      activo: true
    })
    setShowForm(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEditar = (usuario) => {
    setFormData({
      primer_nombre: usuario.primer_nombre || '',
      segundo_nombre: usuario.segundo_nombre || '',
      primer_apellido: usuario.primer_apellido || '',
      segundo_apellido: usuario.segundo_apellido || '',
      email: usuario.email,
      documento: usuario.documento,
      empresa_id: usuario.empresa_id.toString(),
      rol: usuario.rol,
      activo: usuario.activo
    })
    setEditando(usuario.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar este usuario?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id))
      setMensaje('✅ Usuario eliminado')
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const handleToggleActivo = (id) => {
    setUsuarios(prev => prev.map(u =>
      u.id === id ? { ...u, activo: !u.activo } : u
    ))
  }

  const usuariosFiltrados = filtroEmpresa === 'todas'
    ? usuarios
    : usuarios.filter(u => u.empresa_id === parseInt(filtroEmpresa))

  return (
    <div className="gestion-usuarios-global-panel">
      <div className="panel-header">
        <h2>👥 Gestión Global de Usuarios</h2>
        <p className="subtitle">Gestionar usuarios de todas las empresas del sistema</p>
      </div>

      {mensaje && (
        <div className="success-message">{mensaje}</div>
      )}

      <div className="toolbar">
        <div className="filtro-container">
          <label>Filtrar por Empresa:</label>
          <select
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
          >
            <option value="todas">Todas las Empresas</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditando(null)
            setFormData({
              primer_nombre: '',
              segundo_nombre: '',
              primer_apellido: '',
              segundo_apellido: '',
              email: '',
              password: '',
              documento: '',
              empresa_id: '',
              rol: '5',
              activo: true
            })
          }}
        >
          {showForm ? '✕ Cancelar' : '➕ Nuevo Usuario'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editando ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}</h3>
          <div className="form-grid">
            <label>
              Primer Nombre
              <input
                type="text"
                name="primer_nombre"
                value={formData.primer_nombre}
                onChange={handleChange}
                placeholder="Primer nombre"
                required
              />
            </label>
            <label>
              Segundo Nombre
              <input
                type="text"
                name="segundo_nombre"
                value={formData.segundo_nombre}
                onChange={handleChange}
                placeholder="Segundo nombre"
                required
              />
            </label>
            <label>
              Primer Apellido
              <input
                type="text"
                name="primer_apellido"
                value={formData.primer_apellido}
                onChange={handleChange}
                placeholder="Primer apellido"
                required
              />
            </label>
            <label>
              Segundo Apellido
              <input
                type="text"
                name="segundo_apellido"
                value={formData.segundo_apellido}
                onChange={handleChange}
                placeholder="Segundo apellido"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@empresa.com"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña del usuario"
                required={!editando}
              />
            </label>
            <label>
              Documento
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="Número de documento"
              />
            </label>
            <label>
              Empresa
              <select
                name="empresa_id"
                value={formData.empresa_id}
                onChange={handleChange}
              >
                <option value="">Selecciona una empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rol
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="1">Super Administrador</option>
                <option value="2">Admin Empresa</option>
                <option value="3">Planificador</option>
                <option value="4">Supervisor</option>
                <option value="5">Empleado</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              Usuario Activo
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleGuardar}>
              💾 Guardar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false)
                setEditando(null)
              }}
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="usuarios-tabla">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Documento</th>
              <th>Empresa</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id} className={!usuario.activo ? 'inactivo' : ''}>
                <td><strong>{usuario.nombre}</strong></td>
                <td>{usuario.email}</td>
                <td>{usuario.documento}</td>
                <td>{usuario.empresa_nombre}</td>
                <td>
                  <span className={`badge-rol rol-${usuario.rol}`}>
                    {usuario.rol_nombre}
                  </span>
                </td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={usuario.activo}
                      onChange={() => handleToggleActivo(usuario.id)}
                    />
                    <span className={`toggle ${usuario.activo ? 'activo' : 'inactivo'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </label>
                </td>
                <td>
                  <div className="acciones">
                    <button
                      className="btn-sm btn-edit"
                      onClick={() => handleEditar(usuario)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-sm btn-delete"
                      onClick={() => handleEliminar(usuario.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tabla-footer">Total: {usuariosFiltrados.length} usuarios</p>
      </div>
    </div>
  )
}
