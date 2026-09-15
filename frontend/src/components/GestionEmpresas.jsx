import { useState, useEffect } from 'react'

export default function GestionEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    pais: '',
    ciudad: '',
    contacto: '',
    email: '',
    telefono: '',
    activo: true
  })

  useEffect(() => {
    // Mock data
    setEmpresas([
      {
        id: 1,
        nombre: 'TechCorp Solutions',
        nit: '900123456-1',
        pais: 'Colombia',
        ciudad: 'Bogotá',
        contacto: 'Carlos Mendoza',
        email: 'admin@techcorp.com',
        telefono: '+57 1 234 5678',
        activo: true,
        usuarios: 45,
        fecha_creacion: '2025-01-15'
      },
      {
        id: 2,
        nombre: 'Global Services Inc',
        nit: '800987654-2',
        pais: 'Colombia',
        ciudad: 'Medellín',
        contacto: 'Ana García',
        email: 'contact@globalservices.com',
        telefono: '+57 4 567 8901',
        activo: true,
        usuarios: 32,
        fecha_creacion: '2025-02-20'
      },
      {
        id: 3,
        nombre: 'Empresa Antigua S.A.',
        nit: '700654321-3',
        pais: 'Colombia',
        ciudad: 'Cali',
        contacto: 'Juan Pérez',
        email: 'info@empresaantigua.com',
        telefono: '+57 2 345 6789',
        activo: false,
        usuarios: 0,
        fecha_creacion: '2024-06-10'
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
    if (!formData.nombre) return 'Nombre es requerido'
    if (!formData.nit) return 'NIT es requerido'
    if (!formData.pais) return 'País es requerido'
    if (!formData.ciudad) return 'Ciudad es requerido'
    if (!formData.contacto) return 'Contacto es requerido'
    if (!formData.email) return 'Email es requerido'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email inválido'

    if (!editando) {
      const nitExiste = empresas.some(e => e.nit === formData.nit)
      if (nitExiste) return 'Este NIT ya está registrado'
    }

    return null
  }

  const handleGuardar = () => {
    const error = validarForm()
    if (error) return alert(error)

    if (editando) {
      setEmpresas(prev => prev.map(e =>
        e.id === editando
          ? { ...e, ...formData }
          : e
      ))
      setMensaje('✅ Empresa actualizada correctamente')
      setEditando(null)
    } else {
      const nuevaEmpresa = {
        id: Math.max(...empresas.map(e => e.id), 0) + 1,
        ...formData,
        usuarios: 0,
        fecha_creacion: new Date().toISOString().split('T')[0]
      }
      setEmpresas([...empresas, nuevaEmpresa])
      setMensaje('✅ Empresa creada correctamente')
    }

    setFormData({
      nombre: '',
      nit: '',
      pais: '',
      ciudad: '',
      contacto: '',
      email: '',
      telefono: '',
      activo: true
    })
    setShowForm(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEditar = (empresa) => {
    setFormData({
      nombre: empresa.nombre,
      nit: empresa.nit,
      pais: empresa.pais,
      ciudad: empresa.ciudad,
      contacto: empresa.contacto,
      email: empresa.email,
      telefono: empresa.telefono,
      activo: empresa.activo
    })
    setEditando(empresa.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar esta empresa?')) {
      setEmpresas(prev => prev.filter(e => e.id !== id))
      setMensaje('✅ Empresa eliminada')
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const handleToggleActivo = (id) => {
    setEmpresas(prev => prev.map(e =>
      e.id === id ? { ...e, activo: !e.activo } : e
    ))
  }

  return (
    <div className="gestion-empresas-panel">
      <div className="panel-header">
        <h2>🏢 Gestión de Empresas</h2>
        <p className="subtitle">Crear, editar y gestionar todas las empresas del sistema</p>
      </div>

      {mensaje && (
        <div className="success-message">{mensaje}</div>
      )}

      <div className="toolbar">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditando(null)
            setFormData({
              nombre: '',
              nit: '',
              pais: '',
              ciudad: '',
              contacto: '',
              email: '',
              telefono: '',
              activo: true
            })
          }}
        >
          {showForm ? '✕ Cancelar' : '➕ Nueva Empresa'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editando ? '✏️ Editar Empresa' : '➕ Crear Nueva Empresa'}</h3>
          <div className="form-grid">
            <label>
              Nombre de Empresa
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </label>
            <label>
              NIT
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                placeholder="Ej: 900123456-1"
              />
            </label>
            <label>
              País
              <input
                type="text"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                placeholder="Colombia"
              />
            </label>
            <label>
              Ciudad
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Bogotá"
              />
            </label>
            <label>
              Contacto Principal
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
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
                placeholder="contacto@empresa.com"
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 1 234 5678"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              Empresa Activa
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

      <div className="empresas-tabla">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Ciudad</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Usuarios</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(empresa => (
              <tr key={empresa.id} className={!empresa.activo ? 'inactivo' : ''}>
                <td><strong>{empresa.nombre}</strong></td>
                <td>{empresa.nit}</td>
                <td>{empresa.ciudad}</td>
                <td>{empresa.contacto}</td>
                <td>{empresa.email}</td>
                <td><span className="badge">{empresa.usuarios}</span></td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={empresa.activo}
                      onChange={() => handleToggleActivo(empresa.id)}
                    />
                    <span className={`toggle ${empresa.activo ? 'activo' : 'inactivo'}`}>
                      {empresa.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </label>
                </td>
                <td>
                  <div className="acciones">
                    <button
                      className="btn-sm btn-edit"
                      onClick={() => handleEditar(empresa)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-sm btn-delete"
                      onClick={() => handleEliminar(empresa.id)}
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
      </div>
    </div>
  )
}
