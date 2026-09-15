import { useState, useEffect } from 'react'

export default function CatalogoDeTurnos() {
  const [turnos, setTurnos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    hora_inicio: '',
    hora_fin: '',
    duracion: '',
    es_nocturno: false
  })
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    // Mock data
    setTurnos([
      {
        id: 1,
        nombre: 'Mañana',
        hora_inicio: '06:00',
        hora_fin: '14:00',
        duracion: 8,
        es_nocturno: false,
        color: '#22c55e'
      },
      {
        id: 2,
        nombre: 'Tarde',
        hora_inicio: '14:00',
        hora_fin: '22:00',
        duracion: 8,
        es_nocturno: false,
        color: '#f59e0b'
      },
      {
        id: 3,
        nombre: 'Noche',
        hora_inicio: '22:00',
        hora_fin: '06:00',
        duracion: 8,
        es_nocturno: true,
        color: '#6366f1'
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

  const calcularDuracion = (inicio, fin) => {
    if (!inicio || !fin) return 0
    const [h1, m1] = inicio.split(':').map(Number)
    const [h2, m2] = fin.split(':').map(Number)
    
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (diff < 0) diff += 24 * 60
    
    return Math.round(diff / 60 * 10) / 10
  }

  const handleAgregar = () => {
    if (!formData.nombre || !formData.hora_inicio || !formData.hora_fin) {
      return alert('Nombre y horarios son requeridos')
    }

    const duracion = calcularDuracion(formData.hora_inicio, formData.hora_fin)

    if (editando) {
      setTurnos(prev => prev.map(t =>
        t.id === editando
          ? { ...t, ...formData, duracion }
          : t
      ))
      setEditando(null)
    } else {
      const newTurno = {
        id: Math.max(...turnos.map(t => t.id), 0) + 1,
        ...formData,
        duracion,
        color: formData.es_nocturno ? '#6366f1' : '#f59e0b'
      }
      setTurnos([...turnos, newTurno])
    }

    setFormData({
      nombre: '',
      hora_inicio: '',
      hora_fin: '',
      duracion: '',
      es_nocturno: false
    })
    setShowForm(false)
  }

  const handleEditar = (turno) => {
    setFormData({
      nombre: turno.nombre,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      duracion: turno.duracion,
      es_nocturno: turno.es_nocturno
    })
    setEditando(turno.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('Eliminar este turno?')) {
      setTurnos(turnos.filter(t => t.id !== id))
    }
  }

  return (
    <div className="catalogo-turnos-panel">
      <div className="panel-header">
        <h2>Catalogo de Turnos</h2>
        <p className="subtitle">Define los turnos estandar de tu empresa</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Agregar Turno
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-group">
            <label>Nombre del Turno</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Mañana, Tarde, Noche"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hora Inicio</label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Hora Fin</label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="es_nocturno"
                checked={formData.es_nocturno}
                onChange={handleChange}
              />
              Es Turno Nocturno
            </label>
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
                  nombre: '',
                  hora_inicio: '',
                  hora_fin: '',
                  duracion: '',
                  es_nocturno: false
                })
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="turnos-grid">
        {turnos.map(turno => (
          <div key={turno.id} className="turno-card" style={{ borderLeftColor: turno.color }}>
            <div className="turno-header">
              <h3>{turno.nombre}</h3>
              {turno.es_nocturno && <span className="badge-nocturno">Nocturno</span>}
            </div>
            <div className="turno-horario">
              <p className="horario-display">
                {turno.hora_inicio} - {turno.hora_fin}
              </p>
              <p className="duracion">{turno.duracion}h</p>
            </div>
            <div className="turno-actions">
              <button className="btn-edit" onClick={() => handleEditar(turno)}>
                Editar
              </button>
              <button className="btn-delete" onClick={() => handleEliminar(turno.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h3>Turnos Estandar Predeterminados</h3>
        <p>Estos son los turnos tipicos que vienen configurados. Puedes editar o crear nuevos turnos personalizados.</p>
      </div>
    </div>
  )
}
