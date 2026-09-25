import { useState, useEffect } from 'react'

export default function PerfilesYProfesiones() {
  const [perfiles, setPerfiles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    especialidades: '',
    cantidad: ''
  })
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [crearNuevoPerfil, setCrearNuevoPerfil] = useState(false)

  useEffect(() => {
    fetch('/api/perfiles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los perfiles')
        return data
      })
      .then(data => setPerfiles(data.map(perfil => ({
        ...perfil,
        especialidades: perfil.nombre ? [perfil.nombre] : [],
        cantidad: 0
      }))))
      .catch(requestError => setError(requestError.message))
      .finally(() => setCargando(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const seleccionarPerfil = (e) => {
    const value = e.target.value
    setCrearNuevoPerfil(value === '__nuevo__')
    setFormData(prev => ({ ...prev, nombre: value === '__nuevo__' ? '' : value }))
  }

  const handleAgregar = () => {
    if (!formData.nombre) return alert('Nombre es requerido')

    const nombreNormalizado = formData.nombre.trim().toLocaleLowerCase()
    const duplicado = perfiles.some(perfil => perfil.nombre.trim().toLocaleLowerCase() === nombreNormalizado && perfil.id !== editando)
    if (duplicado) return alert('Ese perfil ya existe en la base de datos para esta empresa')
    
    if (editando) {
      setPerfiles(prev => prev.map(p => 
        p.id === editando 
          ? { ...p, ...formData, especialidades: formData.especialidades.split(',').map(e => e.trim()) }
          : p
      ))
      setEditando(null)
    } else {
      fetch('/api/perfiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nombre: formData.nombre, descripcion: formData.especialidades })
      })
        .then(async response => {
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'No se pudo crear el perfil')
          return data
        })
        .then(data => setPerfiles(prev => [...prev, { ...data, especialidades: data.nombre ? [data.nombre] : [], cantidad: 0 }]))
        .catch(requestError => setError(requestError.message))
    }
    
    setFormData({ nombre: '', especialidades: '', cantidad: '' })
    setShowForm(false)
    setCrearNuevoPerfil(false)
  }

  const handleEditar = (perfil) => {
    setFormData({
      nombre: perfil.nombre,
      especialidades: perfil.especialidades.join(', '),
      cantidad: perfil.cantidad
    })
    setEditando(perfil.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar este perfil?')) {
      setPerfiles(perfiles.filter(p => p.id !== id))
    }
  }

  return (
    <div className="perfiles-profesiones-panel">
      <div className="panel-header">
        <h2>👥 Perfiles y Profesiones</h2>
        <p className="subtitle">Define los roles de tu empresa</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Agregar Perfil
        </button>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {showForm && (
        <div className="form-container">
          <div className="form-group">
            <label>Cargo</label>
              <select value={crearNuevoPerfil ? '__nuevo__' : formData.nombre} onChange={seleccionarPerfil}>
                <option value="">Selecciona un cargo existente</option>
                {perfiles.map(perfil => <option key={perfil.id} value={perfil.nombre}>{perfil.nombre}</option>)}
                <option value="__nuevo__">+ Crear un cargo nuevo</option>
              </select>
              {crearNuevoPerfil && (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del cargo nuevo"
                />
              )}
          </div>
          <div className="form-group">
            <label>Cantidad Estimada en Empresa</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="action-buttons">
            <button className="btn-guardar" onClick={handleAgregar}>
              Guardar
            </button>
            <button 
              className="btn-cancelar" 
              onClick={() => {
                setShowForm(false)
                setEditando(null)
                setCrearNuevoPerfil(false)
                setFormData({ nombre: '', especialidades: '', cantidad: '' })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {cargando && <p className="catalogo-estado">Cargando perfiles y profesiones...</p>}
      {!cargando && !error && perfiles.length === 0 && (
        <p className="catalogo-estado">Esta empresa todavía no tiene perfiles o profesiones registrados.</p>
      )}
      {!cargando && perfiles.length > 0 && <div className="perfiles-grid">
        {perfiles.map(perfil => (
          <div key={perfil.id} className="perfil-card">
            <div className="perfil-header">
              <h3>{perfil.nombre}</h3>
              <span className="cantidad-badge">{perfil.cantidad} empleados</span>
            </div>
            <div className="especialidades">
              <p className="label-small">Especialidades:</p>
              <div className="especialidad-tags">
                {perfil.especialidades.map((esp, idx) => (
                  <span key={idx} className="tag">{esp}</span>
                ))}
              </div>
            </div>
            <div className="perfil-actions">
              <button className="btn-edit" onClick={() => handleEditar(perfil)}>
                Editar
              </button>
              <button className="btn-delete" onClick={() => handleEliminar(perfil.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}
