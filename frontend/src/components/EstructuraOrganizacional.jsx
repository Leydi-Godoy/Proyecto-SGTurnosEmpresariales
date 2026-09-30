import { useState, useEffect } from 'react'

async function leerRespuestaSedes(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('El backend no tiene disponible /api/sedes. Reinicia el servidor backend y vuelve a intentar.')
    }
    throw new Error(`El servidor devolvió una respuesta inesperada (HTTP ${response.status}).`)
  }

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Error del servidor (HTTP ${response.status}).`)
  return data
}

export default function EstructuraOrganizacional() {
  const [sedes, setSedes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loadingSedes, setLoadingSedes] = useState(true)
  const [savingSede, setSavingSede] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    zona_horaria: ''
  })

  useEffect(() => {
    let activo = true
    const token = localStorage.getItem('token')

    fetch('/api/sedes', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => leerRespuestaSedes(response))
      .then(data => {
        if (activo) setSedes(data)
      })
      .catch(requestError => {
        if (activo) setError(requestError.message)
      })
      .finally(() => {
        if (activo) setLoadingSedes(false)
      })

    return () => { activo = false }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAgregar = async () => {
    if (!formData.nombre.trim()) return setError('Nombre es requerido')

    try {
      setSavingSede(true)
      setError('')
      setMensaje('')
      const response = await fetch('/api/sedes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      const data = await leerRespuestaSedes(response)

      setSedes(prev => [...prev, data])
      setMensaje('Sede creada correctamente')
      setFormData({ nombre: '', direccion: '', zona_horaria: '' })
      setShowForm(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingSede(false)
    }
  }

  return (
    <div className="estructura-org-panel">
      <div className="panel-header">
        <h2>Estructura Organizacional</h2>
        <p className="subtitle">Define las sedes de tu empresa</p>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      {mensaje && <div className="success-message" role="status">{mensaje}</div>}

      <div className="section-content">
        <div className="section-sede">
            <div className="section-header">
              <h3>Sedes</h3>
              <button className="btn-agregar" onClick={() => setShowForm(true)} disabled={loadingSedes}>
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
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    maxLength={512}
                    placeholder="Dirección de la sede"
                  />
                </div>
                <div className="form-group">
                  <label>Zona horaria</label>
                  <input
                    type="text"
                    name="zona_horaria"
                    value={formData.zona_horaria}
                    onChange={handleChange}
                    maxLength={64}
                    placeholder="Ej: America/Bogota"
                  />
                </div>
                <div className="action-buttons">
                  <button className="btn-guardar" onClick={handleAgregar} disabled={savingSede}>
                    {savingSede ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({ nombre: '', direccion: '', zona_horaria: '' })
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="items-list">
              {loadingSedes && <p>Cargando sedes...</p>}
              {!loadingSedes && !sedes.length && !error && <p>No hay sedes registradas.</p>}
              {sedes.map(sede => (
                <div key={sede.id} className="item-card">
                  <div className="item-info">
                    <h4>{sede.nombre}</h4>
                    <p>{sede.direccion || 'Sin dirección'}{sede.zona_horaria ? ` | ${sede.zona_horaria}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}
