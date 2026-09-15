import { useState, useEffect } from 'react'

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    email: '',
    rol: '5',
    activo: true
  })

  useEffect(() => {
    // Mock data
    setUsuarios([
      {
        id: 1,
        documento: '1104774847',
        nombre: 'Leydi Cecilia Godoy',
        email: 'leydigodoy@sgturnos.com',
        rol: '1',
        rol_nombre: 'Super Administrador',
        activo: true,
        fecha_creacion: '2026-01-15'
      },
      {
        id: 2,
        documento: '12233445',
        nombre: 'Victor Pablo Guerrero',
        email: 'victorguerrero@sgturnos.com',
        rol: '3',
        rol_nombre: 'Planificador',
        activo: true,
        fecha_creacion: '2026-02-10'
      },
      {
        id: 3,
        documento: '87654321',
        nombre: 'Maria Lopez',
        email: 'marialopez@sgturnos.com',
        rol: '5',
        rol_nombre: 'Empleado',
        activo: true,
        fecha_creacion: '2026-03-05'
      }
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validarForm = () => {
    if (!formData.documento) return 'Documento es requerido'
    if (!formData.nombre) return 'Nombre es requerido'
    if (!formData.email) return 'Email es requerido'

    // Validar documento unico
    if (!editando) {
      const docExiste = usuarios.some(u => u.documento === formData.documento)
      if (docExiste) return 'Este documento ya existe en el sistema'
    }

    // Validar email unico
    if (!editando) {
      const emailExiste = usuarios.some(u => u.email === formData.email)
      if (emailExiste) return 'Este email ya existe en el sistema'
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email invalido'

    return null
  }

  const getRolNombre = (id) => {
    const roles = {
      '1': 'Super Administrador',
      '2': 'Admin Empresa',
      '3': 'Planificador',
      '4': 'Supervisor',
      '5': 'Empleado'
    }
    return roles[id] || 'Desconocido'
  }

  const handleAgregar = () => {
    const error = validarForm()
    if (error) return alert(error)

    if (editando) {
      setUsuarios(prev => prev.map(u =>
        u.id === editando
          ? { ...u, ...formData, rol_nombre: getRolNombre(formData.rol) }
          : u
      ))
      setEditando(null)
    } else {
      const newUsuario = {
        id: Math.max(...usuarios.map(u => u.id), 0) + 1,
        ...formData,
        rol_nombre: getRolNombre(formData.rol),
        fecha_creacion: new Date().toISOString().split('T')[0]
      }
      setUsuarios([...usuarios, newUsuario])
    }

    setMensaje(editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')
    setTimeout(() => setMensaje(''), 3000)

    setFormData({
      documento: '',
      nombre: '',
      email: '',
      rol: '5',
      activo: true
    })
    setShowForm(false)
  }

  const handleEditar = (usuario) => {
    setFormData({
      documento: usuario.documento,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    })
    setEditando(usuario.id)
    setShowForm(true)
  }

  const handleDesactivar = (id) => {
    setUsuarios(prev => prev.map(u =>
      u.id === id ? { ...u, activo: !u.activo } : u
    ))
    setMensaje('Estado del usuario actualizado')
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEliminar = (id) => {
    if (confirm('Eliminar usuario? Esta accion no se puede deshacer')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      setMensaje('Usuario eliminado')
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.documento.includes(searchTerm)
  )

  return (
    <div className="gestion-usuarios-panel">
      <div className="panel-header">
        <h2>Gestion de Usuarios</h2>
        <p className="subtitle">Crear, editar y administrar usuarios de tu empresa</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Crear Nuevo Usuario
        </button>
      </div>

      {mensaje && <div className="success-message">{mensaje}</div>}

      <div className="usuarios-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="usuarios-stats">
          <span className="stat">Total: {usuarios.length}</span>
          <span className="stat">Activos: {usuarios.filter(u => u.activo).length}</span>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
          
          <div className="form-group">
            <label>Numero de Documento</label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              placeholder="Cedula, Pasaporte, etc."
              disabled={editando}
              className={editando ? 'disabled' : ''}
            />
            <p className="help-text">Documento unico en el sistema</p>
          </div>

          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo del usuario"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@empresa.com"
            />
            <p className="help-text">Email unico en el sistema</p>
          </div>

          <div className="form-group">
            <label>Rol/Perfil</label>
            <select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="2">Admin Empresa</option>
              <option value="3">Planificador</option>
              <option value="4">Supervisor</option>
              <option value="5">Empleado</option>
            </select>
          </div>

          <div className="form-group">
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

          <div className="action-buttons">
            <button className="btn-guardar" onClick={handleAgregar}>
              {editando ? 'Actualizar' : 'Crear'} Usuario
            </button>
            <button
              className="btn-cancelar"
              onClick={() => {
                setShowForm(false)
                setEditando(null)
                setFormData({
                  documento: '',
                  nombre: '',
                  email: '',
                  rol: '5',
                  activo: true
                })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Email</th>
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
                <td>
                  <span className={`rol-badge rol-${usuario.rol}`}>
                    {usuario.rol_nombre}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{usuario.fecha_creacion}</td>
                <td className="acciones-cell">
                  <button
                    className="btn-sm btn-edit"
                    onClick={() => handleEditar(usuario)}
                    title="Editar usuario"
                  >
                    Editar
                  </button>
                  <button
                    className={`btn-sm ${usuario.activo ? 'btn-desactivar' : 'btn-activar'}`}
                    onClick={() => handleDesactivar(usuario.id)}
                    title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {usuario.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="btn-sm btn-delete"
                    onClick={() => handleEliminar(usuario.id)}
                    title="Eliminar usuario"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuariosFiltrados.length === 0 && (
        <div className="empty-state">
          <p>No hay usuarios que coincidan con la busqueda</p>
        </div>
      )}

      <div className="info-section">
        <h3>Importante:</h3>
        <ul>
          <li>El documento y email deben ser unicos en el sistema</li>
          <li>Los usuarios desactivados no podran acceder al sistema</li>
          <li>Los super administradores ven todos los usuarios de todas las empresas</li>
          <li>Los admin empresa solo ven usuarios de su empresa</li>
          <li>Las contrasenas se generan automaticamente y se envian por email</li>
        </ul>
      </div>
    </div>
  )
}
