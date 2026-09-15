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

  useEffect(() => {
    // Mock data
    setPerfiles([
      {
        id: 1,
        nombre: 'Vigilante',
        especialidades: ['Seguridad', 'Vigilancia Nocturna'],
        cantidad: 12
      },
      {
        id: 2,
        nombre: 'Operario',
        especialidades: ['Manejo de Máquinas', 'Seguridad Industrial'],
        cantidad: 8
      },
      {
        id: 3,
        nombre: 'Supervisor',
        especialidades: ['Liderazgo', 'Gestión de Personal'],
        cantidad: 3
      }
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAgregar = () => {
    if (!formData.nombre) return alert('Nombre es requerido')
    
    if (editando) {
      setPerfiles(prev => prev.map(p => 
        p.id === editando 
          ? { ...p, ...formData, especialidades: formData.especialidades.split(',').map(e => e.trim()) }
          : p
      ))
      setEditando(null)
    } else {
      const newPerfil = {
        id: Math.max(...perfiles.map(p => p.id), 0) + 1,
        nombre: formData.nombre,
        especialidades: formData.especialidades.split(',').map(e => e.trim()),
        cantidad: parseInt(formData.cantidad) || 0
      }
      setPerfiles([...perfiles, newPerfil])
    }
    
    setFormData({ nombre: '', especialidades: '', cantidad: '' })
    setShowForm(false)
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

      {showForm && (
        <div className="form-container">
          <div className="form-group">
            <label>Nombre del Perfil</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Vigilante, Doctor, Operario"
            />
          </div>
          <div className="form-group">
            <label>Especialidades (separadas por coma)</label>
            <input
              type="text"
              name="especialidades"
              value={formData.especialidades}
              onChange={handleChange}
              placeholder="Ej: Seguridad, Vigilancia Nocturna"
            />
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
                setFormData({ nombre: '', especialidades: '', cantidad: '' })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="perfiles-grid">
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
      </div>
    </div>
  )
}
