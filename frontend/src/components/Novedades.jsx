import { useEffect, useState } from 'react'

const TIPOS_NOVEDADES = [
  { value: 'cambio_turno', label: 'Cambio de turno' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'incapacidad', label: 'Incapacidad' },
  { value: 'licencia', label: 'Licencia' },
]

const ESTADO_COLORES = {
  pendiente: '#f59e0b',
  aprobado: '#22c55e',
  rechazado: '#ef4444',
  en_proceso: '#06b6d4',
}

export default function Novedades() {
  const [novedades, setNovedades] = useState([])
  const [form, setForm] = useState({ 
    tipo: '', 
    descripcion: '', 
    fecha_solicitada: '',
    detalles_adicionales: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  function loadNovedades() {
    setLoading(true)
    fetch('/api/empleado/novedades', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
    })
      .then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar las novedades')
        return r.json()
      })
      .then((d) => setNovedades(d.novedades || d || []))
      .catch(() => setNovedades([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { 
    loadNovedades() 
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!form.tipo || !form.descripcion) {
      setError('Tipo y descripción son obligatorios')
      return
    }

    setEnviando(true)
    try {
      const res = await fetch('/api/empleado/novedades', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }, 
        body: JSON.stringify(form) 
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo crear la solicitud')
      
      setSuccess('Solicitud enviada exitosamente')
      setForm({ tipo: '', descripcion: '', fecha_solicitada: '', detalles_adicionales: '' })
      setShowForm(false)
      loadNovedades()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const novedadesFiltradas = filtroEstado === 'todos' 
    ? novedades 
    : novedades.filter(n => n.estado === filtroEstado)

  const getTipoLabel = (tipo) => {
    const t = TIPOS_NOVEDADES.find(o => o.value === tipo)
    return t ? t.label : tipo
  }

  return (
    <section className="panel novedades-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Solicitudes</span>
          <h2>Novedades y Solicitudes</h2>
        </div>
        <button 
          className={`button-primary ${showForm ? 'active' : ''}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nueva solicitud'}
        </button>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      {showForm && (
        <form className="novedad-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tipo">Tipo de solicitud</label>
            <select 
              id="tipo"
              required 
              value={form.tipo} 
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="">Seleccionar tipo</option>
              {TIPOS_NOVEDADES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha_solicitada">Fecha solicitada</label>
            <input 
              id="fecha_solicitada"
              type="date" 
              value={form.fecha_solicitada} 
              onChange={(e) => setForm({ ...form, fecha_solicitada: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea 
              id="descripcion"
              required 
              placeholder="Describe tu solicitud con detalle..."
              value={form.descripcion} 
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="detalles">Detalles adicionales</label>
            <textarea 
              id="detalles"
              placeholder="Información adicional (opcional)"
              value={form.detalles_adicionales} 
              onChange={(e) => setForm({ ...form, detalles_adicionales: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              className="button-primary" 
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
            <button 
              className="button-secondary" 
              type="button"
              onClick={() => {
                setShowForm(false)
                setForm({ tipo: '', descripcion: '', fecha_solicitada: '', detalles_adicionales: '' })
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="novedades-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todas ({novedades.length})
          </button>
          <button 
            className={`filter-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendiente')}
          >
            Pendientes
          </button>
          <button 
            className={`filter-btn ${filtroEstado === 'aprobado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('aprobado')}
          >
            Aprobadas
          </button>
          <button 
            className={`filter-btn ${filtroEstado === 'rechazado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('rechazado')}
          >
            Rechazadas
          </button>
        </div>

        <div className="novedades-list">
          {loading ? (
            <p className="loading-message">Cargando novedades…</p>
          ) : (
            <>
              {novedadesFiltradas.length === 0 ? (
                <div className="empty-state">
                  <p>No hay solicitudes {filtroEstado !== 'todos' ? `${filtroEstado}` : ''}.</p>
                </div>
              ) : (
                <ul>
                  {novedadesFiltradas.map(n => (
                    <li key={n.id} className="novedad-item">
                      <div className="novedad-header">
                        <h4>{getTipoLabel(n.tipo)}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: ESTADO_COLORES[n.estado] || '#6b7280' }}
                        >
                          {n.estado}
                        </span>
                      </div>
                      <p className="novedad-description">{n.descripcion}</p>
                      {n.fecha_solicitada && (
                        <p className="novedad-date">
                          Fecha solicitada: {new Intl.DateTimeFormat('es-CO').format(new Date(n.fecha_solicitada))}
                        </p>
                      )}
                      {n.detalles_adicionales && (
                        <p className="novedad-details">{n.detalles_adicionales}</p>
                      )}
                      <p className="novedad-timestamp">
                        Enviado: {new Intl.DateTimeFormat('es-CO', { 
                          dateStyle: 'short', 
                          timeStyle: 'short' 
                        }).format(new Date(n.created_at || n.fecha_creacion))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
