import { useState, useEffect } from 'react'

export default function GestionUsuariosGlobal() {
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    documento: '',
    empresa_id: '',
    rol: '5',
    activo: true
  })

  useEffect(() => {
    // Mock data - Empresas
    setEmpresas([
      { id: 1, nombre: 'TechCorp Solutions' },
      { id: 2, nombre: 'Global Services Inc' },
      { id: 3, nombre: 'Empresa Antigua S.A.' }
    ])

    // Mock data - Usuarios
    setUsuarios([
      {
        id: 1,
        nombre: 'Miguel Camilo Ruiz Treller',
        email: 'miguel@techcorp.com',
        documento: '1023456789',
        empresa_id: 1,
        empresa_nombre: 'TechCorp Solutions',
        rol: '2',
        rol_nombre: 'Admin Empresa',
        activo: true,
        fecha_creacion: '2025-01-10'
      },
      {
        id: 2,
        nombre: 'Victor Pablo Guerrero',
        email: 'victor@techcorp.com',
        documento: '9876543210',
        empresa_id: 1,
        empresa_nombre: 'TechCorp Solutions',
        rol: '3',
        rol_nombre: 'Planificador',
        activo: true,
        fecha_creacion: '2025-02-15'
      },
      {
        id: 3,
        nombre: 'Leydi Cecilia Godoy',
        email: 'leydigodoy@sgturnos.com',
        documento: '1123456789',
        empresa_id: 1,
        empresa_nombre: 'TechCorp Solutions',
        rol: '1',
        rol_nombre: 'Super Administrador',
        activo: true,
        fecha_creacion: '2024-12-01'
      },
      {
        id: 4,
        nombre: 'Ana García',
        email: 'ana@globalservices.com',
        documento: '2234567890',
        empresa_id: 2,
        empresa_nombre: 'Global Services Inc',
        rol: '2',
        rol_nombre: 'Admin Empresa',
        activo: true,
        fecha_creacion: '2025-03-20'
      },
      {
        id: 5,
        nombre: 'María López',
        email: 'marialopez@sgturnos.com',
        documento: '3345678901',
        empresa_id: 1,
        empresa_nombre: 'TechCorp Solutions',
        rol: '5',
        rol_nombre: 'Empleado',
        activo: true,
        fecha_creacion: '2025-04-05'
      }
    ])
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
    if (!formData.nombre) return 'Nombre es requerido'
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

  const handleGuardar = () => {
    const error = validarForm()
    if (error) return alert(error)

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
      const nuevoUsuario = {
        id: Math.max(...usuarios.map(u => u.id), 0) + 1,
        ...formData,
        empresa_id: parseInt(formData.empresa_id),
        empresa_nombre: empresaSeleccionada.nombre,
        rol_nombre: getRolNombre(formData.rol),
        fecha_creacion: new Date().toISOString().split('T')[0]
      }
      setUsuarios([...usuarios, nuevoUsuario])
      setMensaje('✅ Usuario creado correctamente')
    }

    setFormData({
      nombre: '',
      email: '',
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
      nombre: usuario.nombre,
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
              nombre: '',
              email: '',
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
              Nombre Completo
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
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
