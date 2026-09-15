import { useEffect, useState } from 'react'

export default function CalendarTurns() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos') // todos, proximos, pasados

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/empleado/turnos', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
    })
      .then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar los turnos')
        return r.json()
      })
      .then((data) => setTurnos(data.turnos || data || []))
      .catch((err) => {
        setError(err.message)
        setTurnos([])
      })
      .finally(() => setLoading(false))
  }, [])

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const turnosFiltrados = turnos.filter(t => {
    if (!t.fecha) return true
    const turnoDate = new Date(t.fecha)
    turnoDate.setHours(0, 0, 0, 0)
    
    switch(filtro) {
      case 'proximos':
        return turnoDate >= hoy
      case 'pasados':
        return turnoDate < hoy
      default:
        return true
    }
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Fecha no especificada'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date)
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    return timeStr.slice(0, 5)
  }

  return (
    <section className="panel calendar-turns-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Gestión de Turnos</span>
          <h2>Calendario y Turnos</h2>
        </div>
      </div>

      {error && <div className="feedback error">{error}</div>}

      {!error && (
        <>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos ({turnos.length})
            </button>
            <button 
              className={`filter-btn ${filtro === 'proximos' ? 'active' : ''}`}
              onClick={() => setFiltro('proximos')}
            >
              Próximos
            </button>
            <button 
              className={`filter-btn ${filtro === 'pasados' ? 'active' : ''}`}
              onClick={() => setFiltro('pasados')}
            >
              Pasados
            </button>
          </div>

          {loading ? (
            <p className="loading-message">Cargando turnos…</p>
          ) : (
            <>
              {turnosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <p>No hay turnos en esta categoría.</p>
                </div>
              ) : (
                <ul className="turnos-list">
                  {turnosFiltrados.map((t) => (
                    <li key={t.id} className="turno-item">
                      <div className="turno-date">
                        <span className="day">{new Date(t.fecha).getDate()}</span>
                        <span className="month">{new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(t.fecha))}</span>
                      </div>
                      <div className="turno-details">
                        <h4>{formatDate(t.fecha)}</h4>
                        <div className="turno-time">
                          <span className="time-badge">
                            {t.inicio ? `${formatTime(t.inicio)} - ${formatTime(t.fin)}` : 'Horario no especificado'}
                          </span>
                        </div>
                        {t.descripcion && <p className="turno-description">{t.descripcion}</p>}
                        {t.origen && <p className="turno-origen">Origen: {t.origen}</p>}
                      </div>
                      <div className="turno-status">
                        <span className="status-badge">{t.estado || 'Activo'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
