import { useState, useEffect } from 'react'

export default function EstructuraOrganizacional() {
  const [sedes, setSedes] = useState([])
  const [areas, setAreas] = useState([])
  const [activeSection, setActiveSection] = useState('sedes')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    contacto: ''
  })
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    // Mock data
    setSedes([
      {
        id: 1,
        nombre: 'Sede Norte',
        ciudad: 'Bogota',
        contacto: 'Juan Perez',
        activo: true
      },
      {
        id: 2,
        nombre: 'Sede Sur',
        ciudad: 'Cali',
        contacto: 'Maria Garcia',
        activo: true
      }
    ])

    setAreas([
      {
        id: 1,
        nombre: 'Piso de Ventas',
        sede_id: 1,
        supervisor: 'Carlos Lopez',
        activo: true
      },
      {
        id: 2,
        nombre: 'Almacen',
        sede_id: 1,
        supervisor: 'Pedro Ruiz',
        activo: true
      },
      {
        id: 3,
        nombre: 'Caja',
        sede_id: 1,
        supervisor: 'Ana Martinez',
        activo: true
      }
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAgregar = () => {
    if (!formData.nombre) return alert('Nombre es requerido')

    if (activeSection === 'sedes') {
      if (editando) {
        setSedes(prev => prev.map(s =>
          s.id === editando ? { ...s, ...formData } : s
        ))
        setEditando(null)
      } else {
        setSedes([...sedes, {
          id: Math.max(...sedes.map(s => s.id), 0) + 1,
          ...formData,
          activo: true
        }])
      }
    } else {
      if (editando) {
        setAreas(prev => prev.map(a =>
          a.id === editando ? { ...a, ...formData } : a
        ))
        setEditando(null)
      } else {
        setAreas([...areas, {
          id: Math.max(...areas.map(a => a.id), 0) + 1,
          ...formData,
          activo: true
        }])
      }
    }

    setFormData({ nombre: '', ciudad: '', contacto: '' })
    setShowForm(false)
  }

  const handleEditar = (item) => {
    setFormData({
      nombre: item.nombre,
      ciudad: item.ciudad || '',
      contacto: item.contacto || item.supervisor || ''
    })
    setEditando(item.id)
    setShowForm(true)
  }

  const handleEliminar = (id, type) => {
    if (confirm('Eliminar?')) {
      if (type === 'sede') {
        setSedes(sedes.filter(s => s.id !== id))
      } else {
        setAreas(areas.filter(a => a.id !== id))
      }
    }
  }

  return (
    <div className="estructura-org-panel">
      <div className="panel-header">
        <h2>Estructura Organizacional</h2>
        <p className="subtitle">Define sedes y areas de tu empresa</p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab-btn ${activeSection === 'sedes' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('sedes')
            setShowForm(false)
            setEditando(null)
          }}
        >
          Sedes
        </button>
        <button
          className={`tab-btn ${activeSection === 'areas' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('areas')
            setShowForm(false)
            setEditando(null)
          }}
        >
          Areas
        </button>
      </div>

      <div className="section-content">
        {activeSection === 'sedes' && (
          <div className="section-sede">
            <div className="section-header">
              <h3>Sedes</h3>
              <button className="btn-agregar" onClick={() => setShowForm(true)}>
                + Agregar Sede
              </button>
            </div>

            {showForm && (
              <div className="form-container">
                <div className="form-group">
                  <label>Nombre Sede</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Sede Norte, Sede Principal"
                  />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    placeholder="Nombre del contacto"
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
                      setFormData({ nombre: '', ciudad: '', contacto: '' })
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="items-list">
              {sedes.map(sede => (
                <div key={sede.id} className="item-card">
                  <div className="item-info">
                    <h4>{sede.nombre}</h4>
                    <p>{sede.ciudad} | {sede.contacto}</p>
                  </div>
                  <div className="item-actions">
                    <button className="btn-edit" onClick={() => handleEditar(sede)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleEliminar(sede.id, 'sede')}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'areas' && (
          <div className="section-area">
            <div className="section-header">
              <h3>Areas</h3>
              <button className="btn-agregar" onClick={() => setShowForm(true)}>
                + Agregar Area
              </button>
            </div>

            {showForm && (
              <div className="form-container">
                <div className="form-group">
                  <label>Nombre Area</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Piso de Ventas, Almacen"
                  />
                </div>
                <div className="form-group">
                  <label>Supervisor/Responsable</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    placeholder="Nombre del supervisor"
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
                      setFormData({ nombre: '', ciudad: '', contacto: '' })
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="items-list">
              {areas.map(area => {
                const sede = sedes.find(s => s.id === area.sede_id)
                return (
                  <div key={area.id} className="item-card">
                    <div className="item-info">
                      <h4>{area.nombre}</h4>
                      <p>{sede?.nombre} | Supervisor: {area.supervisor}</p>
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => handleEditar(area)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleEliminar(area.id, 'area')}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
