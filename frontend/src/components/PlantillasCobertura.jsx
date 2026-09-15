import { useState, useEffect } from 'react'

export default function PlantillasCobertura() {
  const [plantillas, setPlantillas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [sedes, setSedes] = useState([])
  const [areas, setAreas] = useState([])
  const [formData, setFormData] = useState({
    sede_id: '',
    area_id: '',
    turno: '',
    requerimientos: ''
  })
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    // Mock data
    setSedes([
      { id: 1, nombre: 'Sede Norte' },
      { id: 2, nombre: 'Sede Sur' }
    ])

    setAreas([
      { id: 1, nombre: 'Piso de Ventas', sede_id: 1 },
      { id: 2, nombre: 'Almacen', sede_id: 1 },
      { id: 3, nombre: 'Caja', sede_id: 1 }
    ])

    setPlantillas([
      {
        id: 1,
        sede: 'Sede Norte',
        area: 'Piso de Ventas',
        turno: 'Mañana',
        requerimientos: [
          { perfil: 'Vendedor', cantidad: 3 },
          { perfil: 'Cajero', cantidad: 1 },
          { perfil: 'Supervisor', cantidad: 1 }
        ]
      },
      {
        id: 2,
        sede: 'Sede Norte',
        area: 'Almacen',
        turno: 'Tarde',
        requerimientos: [
          { perfil: 'Operario', cantidad: 2 },
          { perfil: 'Supervisor', cantidad: 1 }
        ]
      }
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAgregar = () => {
    if (!formData.sede_id || !formData.area_id || !formData.turno || !formData.requerimientos) {
      return alert('Todos los campos son requeridos')
    }

    const sedeFounded = sedes.find(s => s.id == formData.sede_id)
    const areaFounded = areas.find(a => a.id == formData.area_id)
    const sedeNombre = sedeFounded ? sedeFounded.nombre : ''
    const areaNombre = areaFounded ? areaFounded.nombre : ''

    // Parse requerimientos: "Vendedor:3, Cajero:1, Supervisor:1"
    const requerimientos = formData.requerimientos
      .split(',')
      .map(r => {
        const [perfil, cantidad] = r.trim().split(':')
        return { perfil: perfil.trim(), cantidad: parseInt(cantidad) }
      })
      .filter(r => r.perfil && r.cantidad)

    if (editando) {
      setPlantillas(prev => prev.map(p =>
        p.id === editando
          ? {
              id: editando,
              sede: sedeNombre,
              area: areaNombre,
              turno: formData.turno,
              requerimientos
            }
          : p
      ))
      setEditando(null)
    } else {
      setPlantillas([...plantillas, {
        id: Math.max(...plantillas.map(p => p.id), 0) + 1,
        sede: sedeNombre,
        area: areaNombre,
        turno: formData.turno,
        requerimientos
      }])
    }

    setFormData({
      sede_id: '',
      area_id: '',
      turno: '',
      requerimientos: ''
    })
    setShowForm(false)
  }

  const handleEditar = (plantilla) => {
    const req = plantilla.requerimientos
      .map(r => `${r.perfil}:${r.cantidad}`)
      .join(', ')

    setFormData({
      sede_id: '',
      area_id: '',
      turno: plantilla.turno,
      requerimientos: req
    })
    setEditando(plantilla.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('Eliminar plantilla?')) {
      setPlantillas(plantillas.filter(p => p.id !== id))
    }
  }

  return (
    <div className="plantillas-cobertura-panel">
      <div className="panel-header">
        <h2>Plantillas de Cobertura</h2>
        <p className="subtitle">Define la cantidad minima de personal por turno y area</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Agregar Plantilla
        </button>
      </div>

      <div className="info-banner">
        <p>Las plantillas definen cuantos empleados de cada perfil se necesitan en cada turno</p>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-group">
            <label>Sede</label>
            <select name="sede_id" value={formData.sede_id} onChange={handleChange}>
              <option value="">Seleccionar sede</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Area</label>
            <select name="area_id" value={formData.area_id} onChange={handleChange}>
              <option value="">Seleccionar area</option>
              {areas.filter(a => !formData.sede_id || a.sede_id == formData.sede_id).map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Turno</label>
            <select name="turno" value={formData.turno} onChange={handleChange}>
              <option value="">Seleccionar turno</option>
              <option value="Mañana">Mañana (6-14)</option>
              <option value="Tarde">Tarde (14-22)</option>
              <option value="Noche">Noche (22-6)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Requerimientos (Formato: Perfil:Cantidad, Perfil:Cantidad)</label>
            <textarea
              name="requerimientos"
              value={formData.requerimientos}
              onChange={handleChange}
              placeholder="Ej: Vendedor:3, Cajero:1, Supervisor:1"
              rows="3"
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
                setFormData({
                  sede_id: '',
                  area_id: '',
                  turno: '',
                  requerimientos: ''
                })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="plantillas-list">
        {plantillas.map(plantilla => (
          <div key={plantilla.id} className="plantilla-card">
            <div className="plantilla-header">
              <h3>{plantilla.sede} - {plantilla.area}</h3>
              <span className="turno-badge">{plantilla.turno}</span>
            </div>
            <div className="requerimientos">
              <p className="label-small">Requerimientos:</p>
              <div className="req-items">
                {plantilla.requerimientos.map((req, idx) => (
                  <div key={idx} className="req-item">
                    <span className="req-perfil">{req.perfil}</span>
                    <span className="req-cantidad">{req.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="plantilla-actions">
              <button className="btn-edit" onClick={() => handleEditar(plantilla)}>
                Editar
              </button>
              <button className="btn-delete" onClick={() => handleEliminar(plantilla.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {plantillas.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No hay plantillas de cobertura creadas</p>
          <p className="subtitle-small">Crea una plantilla para definir los requerimientos de personal</p>
        </div>
      )}
    </div>
  )
}
