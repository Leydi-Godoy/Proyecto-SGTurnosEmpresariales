import { useState, useEffect } from 'react'

async function leerCatalogo(response, nombre) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`No se pudieron cargar ${nombre} (HTTP ${response.status}).`)
  }

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `No se pudieron cargar ${nombre}`)
  return data
}

export default function PlantillasCobertura() {
  const [plantillas, setPlantillas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [sedes, setSedes] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [requerimientos, setRequerimientos] = useState([])
  const [requerimientoActual, setRequerimientoActual] = useState({ especialidad_id: '', cantidad: '' })
  const [formData, setFormData] = useState({
    sede_id: '',
    turno: ''
  })
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    let activo = true
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

    Promise.allSettled([
      fetch('/api/sedes', { headers }).then(response => leerCatalogo(response, 'las sedes')),
      fetch('/api/perfiles', { headers }).then(response => leerCatalogo(response, 'las especialidades')),
      fetch('/api/plantillas-cobertura', { headers }).then(response => leerCatalogo(response, 'las plantillas de cobertura'))
    ])
      .then(([sedesResult, especialidadesResult, plantillasResult]) => {
        if (!activo) return
        if (sedesResult.status === 'fulfilled') setSedes(sedesResult.value)
        if (especialidadesResult.status === 'fulfilled') setEspecialidades(especialidadesResult.value)
        if (plantillasResult.status === 'fulfilled') setPlantillas(plantillasResult.value)

        const failedResult = [sedesResult, especialidadesResult, plantillasResult]
          .find(result => result.status === 'rejected')
        if (failedResult) setError(failedResult.reason.message)
      })
      .finally(() => {
        if (activo) setLoadingCatalogos(false)
      })

    return () => { activo = false }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const agregarRequerimiento = () => {
    const cantidad = Number(requerimientoActual.cantidad)
    if (!requerimientoActual.especialidad_id || !Number.isInteger(cantidad) || cantidad < 1) {
      setError('Selecciona una especialidad e indica una cantidad de usuarios válida.')
      return
    }

    const especialidad = especialidades.find(item => Number(item.id) === Number(requerimientoActual.especialidad_id))
    if (!especialidad) {
      setError('La especialidad seleccionada no está disponible para esta empresa.')
      return
    }
    if (requerimientos.some(item => Number(item.especialidad_id) === Number(especialidad.id))) {
      setError('Esa especialidad ya está agregada a los requerimientos.')
      return
    }

    setError('')
    setRequerimientos(prev => [...prev, {
      especialidad_id: especialidad.id,
      perfil: especialidad.nombre,
      cantidad
    }])
    setRequerimientoActual({ especialidad_id: '', cantidad: '' })
  }

  const handleAgregar = async () => {
    if (!formData.sede_id || !formData.turno) {
      return setError('Selecciona una sede, un turno y agrega al menos un requerimiento.')
    }

    let requerimientosFinales = requerimientos
    if (requerimientoActual.especialidad_id || requerimientoActual.cantidad) {
      const cantidad = Number(requerimientoActual.cantidad)
      if (!requerimientoActual.especialidad_id || !Number.isInteger(cantidad) || cantidad < 1) {
        return setError('Completa la especialidad y una cantidad válida antes de guardar.')
      }

      const especialidad = especialidades.find(item => Number(item.id) === Number(requerimientoActual.especialidad_id))
      if (!especialidad) return setError('La especialidad seleccionada no está disponible para esta empresa.')
      if (requerimientos.some(item => Number(item.especialidad_id) === Number(especialidad.id))) {
        return setError('Esa especialidad ya está agregada a los requerimientos.')
      }
      requerimientosFinales = [...requerimientos, {
        especialidad_id: especialidad.id,
        perfil: especialidad.nombre,
        cantidad
      }]
    }

    if (requerimientosFinales.length === 0) {
      return setError('Selecciona una sede, un turno y agrega al menos un requerimiento.')
    }

    setGuardando(true)
    setError('')
    try {
      const response = await fetch(`/api/plantillas-cobertura${editando ? `/${editando}` : ''}`, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sede_id: Number(formData.sede_id),
          turno: formData.turno,
          requerimientos: requerimientosFinales.map(item => ({
            especialidad_id: Number(item.especialidad_id),
            cantidad: Number(item.cantidad)
          }))
        })
      })
      const plantillaGuardada = await leerCatalogo(response, 'guardar la plantilla de cobertura')
      setPlantillas(prev => editando
        ? prev.map(plantilla => plantilla.id === editando ? plantillaGuardada : plantilla)
        : [plantillaGuardada, ...prev])
      setEditando(null)
      setFormData({ sede_id: '', turno: '' })
      setRequerimientos([])
      setRequerimientoActual({ especialidad_id: '', cantidad: '' })
      setShowForm(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (plantilla) => {
    setFormData({
      sede_id: plantilla.sede_id || '',
      turno: plantilla.turno
    })
    setRequerimientos(plantilla.requerimientos || [])
    setRequerimientoActual({ especialidad_id: '', cantidad: '' })
    setEditando(plantilla.id)
    setShowForm(true)
  }

  const handleEliminar = async (id) => {
    if (confirm('Eliminar plantilla?')) {
      setError('')
      try {
        const response = await fetch(`/api/plantillas-cobertura/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (!response.ok) {
          await leerCatalogo(response, 'eliminar la plantilla de cobertura')
        }
        setPlantillas(prev => prev.filter(plantilla => plantilla.id !== id))
      } catch (requestError) {
        setError(requestError.message)
      }
    }
  }

  return (
    <div className="plantillas-cobertura-panel">
      <div className="panel-header">
        <h2>Plantillas de Cobertura</h2>
        <p className="subtitle">Define la cantidad mínima de usuarios por especialidad, sede y turno</p>
        <button className="btn-agregar" onClick={() => setShowForm(true)}>
          + Agregar Plantilla
        </button>
      </div>

      <div className="info-banner">
        <p>Las plantillas definen cuantos empleados de cada perfil se necesitan en cada turno</p>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      {showForm && (
        <div className="form-container">
          <div className="form-group">
            <label>Sede</label>
            <select name="sede_id" value={formData.sede_id} onChange={handleChange} disabled={loadingCatalogos || sedes.length === 0}>
              <option value="">Seleccionar sede</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            {!loadingCatalogos && !error && sedes.length === 0 && <p>No hay sedes registradas para esta empresa.</p>}
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
            <label>Especialidad</label>
            <select
              value={requerimientoActual.especialidad_id}
              onChange={event => setRequerimientoActual(prev => ({ ...prev, especialidad_id: event.target.value }))}
              disabled={loadingCatalogos || especialidades.length === 0}
            >
              <option value="">Seleccionar especialidad</option>
              {especialidades.map(especialidad => (
                <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
              ))}
            </select>
            {!loadingCatalogos && !error && especialidades.length === 0 && <p>Esta empresa no tiene especialidades registradas.</p>}
            <label htmlFor="cantidad-usuarios">Cantidad de usuarios</label>
            <input
              id="cantidad-usuarios"
              type="number"
              min="1"
              step="1"
              value={requerimientoActual.cantidad}
              onChange={event => setRequerimientoActual(prev => ({ ...prev, cantidad: event.target.value }))}
              placeholder="Ej: 3"
            />
            <button
              className="btn-agregar"
              type="button"
              onClick={agregarRequerimiento}
              disabled={loadingCatalogos || especialidades.length === 0}
            >
              + Agregar especialidad
            </button>
            {requerimientos.length > 0 && (
              <div className="req-items">
                {requerimientos.map(item => (
                  <div className="req-item" key={item.especialidad_id || item.perfil}>
                    <span className="req-perfil">{item.perfil}</span>
                    <span className="req-cantidad">{item.cantidad} usuarios</span>
                    <button
                      type="button"
                      className="btn-delete"
                      aria-label={`Quitar ${item.perfil}`}
                      onClick={() => setRequerimientos(prev => prev.filter(requirement => requirement !== item))}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="action-buttons">
            <button className="btn-guardar" onClick={handleAgregar} disabled={guardando || loadingCatalogos}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              className="btn-cancelar"
              onClick={() => {
                setShowForm(false)
                setEditando(null)
                setFormData({
                  sede_id: '',
                  turno: ''
                })
                setRequerimientos([])
                setRequerimientoActual({ especialidad_id: '', cantidad: '' })
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
              <h3>{plantilla.sede}</h3>
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
