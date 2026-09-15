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
}

export default function NovedadesAprobacion() {
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [novedadSeleccionada, setNovedadSeleccionada] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  useEffect(() => {
    const loadNovedades = () => {
      setLoading(true)
      const mockNovedades = [
        {
          id: 1,
          empleado_id: 1,
          empleado_nombre: 'Juan Pérez',
          tipo: 'cambio_turno',
          descripcion: 'Necesito cambiar turno del 20 de septiembre',
          fecha_solicitada: '2026-09-20',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
          detalles_adicionales: 'Tengo una cita médica',
        },
        {
          id: 2,
          empleado_id: 2,
          empleado_nombre: 'María López',
          tipo: 'permiso',
          descripcion: 'Permiso por razones personales',
          fecha_solicitada: '2026-09-22',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
          detalles_adicionales: '',
        },
        {
          id: 3,
          empleado_id: 3,
          empleado_nombre: 'Carlos García',
          tipo: 'incapacidad',
          descripcion: 'Reporto incapacidad médica',
          fecha_solicitada: '2026-09-15',
          estado: 'aprobado',
          created_at: new Date().toISOString(),
          detalles_adicionales: 'Incapacidad por 3 días',
        },
      ]
      setNovedades(mockNovedades)
      setLoading(false)
    }
    loadNovedades()
  }, [])

  const getTipoLabel = (tipo) => {
    const t = TIPOS_NOVEDADES.find((o) => o.value === tipo)
    return t ? t.label : tipo
  }

  const novedadesFiltradas = novedades.filter((n) => {
    const estadoOk = filtroEstado === 'todos' || n.estado === filtroEstado
    const tipoOk = filtroTipo === 'todos' || n.tipo === filtroTipo
    return estadoOk && tipoOk
  })

  async function handleAprobar(novedadId) {
    setError('')
    setSuccess('')

    try {
      setNovedades(
        novedades.map((n) =>
          n.id === novedadId ? { ...n, estado: 'aprobado' } : n
        )
      )
      setSuccess('Solicitud aprobada exitosamente')
      setNovedadSeleccionada(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al aprobar solicitud')
    }
  }

  async function handleRechazar(novedadId) {
    if (!motivoRechazo.trim()) {
      setError('Debes proporcionar un motivo de rechazo')
      return
    }

    setError('')
    setSuccess('')

    try {
      setNovedades(
        novedades.map((n) =>
          n.id === novedadId
            ? { ...n, estado: 'rechazado', motivo_rechazo: motivoRechazo }
            : n
        )
      )
      setSuccess('Solicitud rechazada')
      setMotivoRechazo('')
      setNovedadSeleccionada(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al rechazar solicitud')
    }
  }

  return (
    <section className="panel novedades-aprobacion-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Aprobaciones</span>
          <h2>Novedades y Solicitudes</h2>
        </div>
        <div className="header-stats">
          <span className="stat-badge">
            Pendientes: {novedades.filter((n) => n.estado === 'pendiente').length}
          </span>
        </div>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      <div className="filtros-aprobacion">
        <div className="form-group">
          <label htmlFor="filtro-estado">Estado</label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobadas</option>
            <option value="rechazado">Rechazadas</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filtro-tipo">Tipo</label>
          <select
            id="filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            {TIPOS_NOVEDADES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="novedades-contenido">
        {loading ? (
          <p className="loading-message">Cargando solicitudes…</p>
        ) : novedadesFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>No hay solicitudes que mostrar.</p>
          </div>
        ) : (
          <div className="novedades-grid">
            {novedadesFiltradas.map((novedad) => (
              <div
                key={novedad.id}
                className={`novedad-aprobacion-card novedad-${novedad.estado}`}
                onClick={() => setNovedadSeleccionada(novedad.id)}
              >
                <div className="novedad-header">
                  <div>
                    <h4>{novedad.empleado_nombre}</h4>
                    <p className="novedad-tipo">{getTipoLabel(novedad.tipo)}</p>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: ESTADO_COLORES[novedad.estado] || '#6b7280',
                    }}
                  >
                    {novedad.estado}
                  </span>
                </div>

                <p className="novedad-description">{novedad.descripcion}</p>

                {novedad.fecha_solicitada && (
                  <p className="novedad-info">
                    📅{' '}
                    {new Intl.DateTimeFormat('es-CO').format(
                      new Date(novedad.fecha_solicitada)
                    )}
                  </p>
                )}

                {novedadSeleccionada === novedad.id && novedad.estado === 'pendiente' && (
                  <div className="novedad-detalles">
                    <p>
                      <strong>Detalles:</strong>
                    </p>
                    <p>{novedad.detalles_adicionales || 'Sin detalles adicionales'}</p>

                    <div className="form-group">
                      <label htmlFor={`motivo-${novedad.id}`}>
                        Motivo de rechazo (si aplica)
                      </label>
                      <textarea
                        id={`motivo-${novedad.id}`}
                        placeholder="Proporciona un motivo si vas a rechazar..."
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        rows="2"
                      />
                    </div>

                    <div className="acciones-aprobacion">
                      <button
                        className="btn-aprobar"
                        onClick={() => handleAprobar(novedad.id)}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => handleRechazar(novedad.id)}
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
