import { useEffect, useState } from 'react'

const TIPOS_SOLICITUDES = [
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

export default function SolicitudesGestionSupervisor() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    loadSolicitudes()
  }, [])

  const loadSolicitudes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/supervisor/solicitudes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al cargar solicitudes')
      const data = await res.json()
      setSolicitudes(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipo) => {
    const t = TIPOS_SOLICITUDES.find(o => o.value === tipo)
    return t ? t.label : tipo
  }

  const solicitudesFiltradas = filtroEstado === 'todos'
    ? solicitudes
    : solicitudes.filter(s => s.estado === filtroEstado)

  const handleAprobar = async (solicitudId) => {
    setProcesando(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/supervisor/solicitudes/${solicitudId}/aprobar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comentario: '' })
      })

      if (!res.ok) throw new Error('Error al aprobar solicitud')

      setSuccess('✓ Solicitud aprobada')
      setSolicitudSeleccionada(null)
      loadSolicitudes()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`❌ ${err.message}`)
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async (solicitudId) => {
    if (!motivoRechazo.trim()) {
      setError('Ingresa motivo del rechazo')
      return
    }

    setProcesando(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/supervisor/solicitudes/${solicitudId}/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comentario: motivoRechazo })
      })

      if (!res.ok) throw new Error('Error al rechazar solicitud')

      setSuccess('✗ Solicitud rechazada')
      setSolicitudSeleccionada(null)
      setMotivoRechazo('')
      loadSolicitudes()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`❌ ${err.message}`)
    } finally {
      setProcesando(false)
    }
  }

  const handleVerDetalles = async (solicitud) => {
    try {
      const res = await fetch(`/api/supervisor/solicitudes/${solicitud.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al cargar detalles')
      const detalles = await res.json()
      setSolicitudSeleccionada(detalles)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="panel solicitudes-gestion-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Supervisión</span>
          <h2>Gestión de Solicitudes</h2>
        </div>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      <div className="solicitudes-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendiente')}
          >
            ⏳ Pendientes ({solicitudes.filter(s => s.estado === 'pendiente').length})
          </button>
          <button
            className={`filter-btn ${filtroEstado === 'aprobado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('aprobado')}
          >
            ✓ Aprobadas ({solicitudes.filter(s => s.estado === 'aprobado').length})
          </button>
          <button
            className={`filter-btn ${filtroEstado === 'rechazado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('rechazado')}
          >
            ✗ Rechazadas ({solicitudes.filter(s => s.estado === 'rechazado').length})
          </button>
          <button
            className={`filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            📋 Todas ({solicitudes.length})
          </button>
        </div>

        <div className="solicitudes-list">
          {loading ? (
            <p className="loading-message">Cargando solicitudes...</p>
          ) : (
            <>
              {solicitudesFiltradas.length === 0 ? (
                <div className="empty-state">
                  <p>No hay solicitudes {filtroEstado !== 'todos' ? filtroEstado : ''}.</p>
                </div>
              ) : (
                <div className="solicitudes-grid">
                  {solicitudesFiltradas.map(s => (
                    <div key={s.id} className="solicitud-card">
                      <div className="solicitud-header">
                        <div>
                          <h4>{getTipoLabel(s.tipo)}</h4>
                          <p className="empleado-name">👤 {s.empleado_nombre}</p>
                        </div>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: ESTADO_COLORES[s.estado] || '#6b7280' }}
                        >
                          {s.estado}
                        </span>
                      </div>

                      <p className="solicitud-description">{s.motivo}</p>

                      {s.fecha_inicio && (
                        <p className="solicitud-dates">
                          📅 {s.fecha_inicio}
                          {s.fecha_fin ? ` a ${s.fecha_fin}` : ''}
                        </p>
                      )}

                      {s.documentos_count > 0 && (
                        <p className="docs-count">📎 {s.documentos_count} documento(s)</p>
                      )}

                      <p className="solicitud-timestamp">
                        {new Intl.DateTimeFormat('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        }).format(new Date(s.creado_en))}
                      </p>

                      {s.estado === 'pendiente' && (
                        <button
                          className="btn-detalles"
                          onClick={() => handleVerDetalles(s)}
                        >
                          Ver detalles y decidir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {solicitudSeleccionada && (
        <div className="modal-overlay" onClick={() => setSolicitudSeleccionada(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getTipoLabel(solicitudSeleccionada.tipo)}</h3>
              <button className="close-btn" onClick={() => setSolicitudSeleccionada(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h4>Empleado</h4>
                <p><strong>{solicitudSeleccionada.empleado_nombre}</strong></p>
                <p>{solicitudSeleccionada.correo}</p>
              </div>

              <div className="info-section">
                <h4>Solicitud</h4>
                <p><strong>Tipo:</strong> {getTipoLabel(solicitudSeleccionada.tipo)}</p>
                <p><strong>Motivo:</strong> {solicitudSeleccionada.motivo}</p>
                <p><strong>Fecha inicio:</strong> {solicitudSeleccionada.fecha_inicio}</p>
                {solicitudSeleccionada.fecha_fin && (
                  <p><strong>Fecha fin:</strong> {solicitudSeleccionada.fecha_fin}</p>
                )}
              </div>

              {solicitudSeleccionada.documentos && solicitudSeleccionada.documentos.length > 0 && (
                <div className="info-section">
                  <h4>Documentos adjuntos</h4>
                  <ul className="docs-list">
                    {solicitudSeleccionada.documentos.map(doc => (
                      <li key={doc.id}>
                        <a href={doc.url_almacenamiento} target="_blank" rel="noopener noreferrer">
                          📄 {doc.nombre_archivo}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="decision-section">
                <h4>Decisión</h4>

                {solicitudSeleccionada.estado === 'pendiente' ? (
                  <>
                    <div className="form-group">
                      <label>Motivo de rechazo (si aplica)</label>
                      <textarea
                        value={motivoRechazo}
                        onChange={e => setMotivoRechazo(e.target.value)}
                        placeholder="Ingresa el motivo del rechazo..."
                        rows="3"
                      />
                    </div>

                    <div className="decision-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleAprobar(solicitudSeleccionada.id)}
                        disabled={procesando}
                      >
                        {procesando ? 'Procesando...' : '✓ Aprobar'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRechazar(solicitudSeleccionada.id)}
                        disabled={procesando || !motivoRechazo.trim()}
                      >
                        {procesando ? 'Procesando...' : '✗ Rechazar'}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setSolicitudSeleccionada(null)}
                        disabled={procesando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="decision-result">
                    <p>
                      <strong>Estado:</strong>{' '}
                      <span style={{ color: ESTADO_COLORES[solicitudSeleccionada.estado] }}>
                        {solicitudSeleccionada.estado}
                      </span>
                    </p>
                    {solicitudSeleccionada.aprobacion && (
                      <>
                        <p><strong>Decidido en:</strong> {new Intl.DateTimeFormat('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        }).format(new Date(solicitudSeleccionada.aprobacion.decidido_en))}</p>
                        {solicitudSeleccionada.aprobacion.comentario && (
                          <p><strong>Comentario:</strong> {solicitudSeleccionada.aprobacion.comentario}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .solicitudes-gestion-panel {
          padding: 2rem;
          background: linear-gradient(135deg, #0a0e27 0%, #1a2847 100%);
          border-radius: 12px;
          color: #f1f5f9;
        }

        .panel-heading {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(147, 197, 253, 0.2);
        }

        .panel-heading h2 {
          font-size: 2rem;
          color: #93c5fd;
          margin: 0.5rem 0 0 0;
        }

        .filter-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(147, 197, 253, 0.3);
          background: transparent;
          color: #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .filter-btn:hover {
          border-color: #93c5fd;
          color: #93c5fd;
        }

        .filter-btn.active {
          background: #93c5fd;
          color: #0a0e27;
          border-color: #93c5fd;
        }

        .solicitudes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .solicitud-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .solicitud-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 0 20px rgba(147, 197, 253, 0.2);
          transform: translateY(-2px);
        }

        .solicitud-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .solicitud-header h4 {
          margin: 0 0 0.5rem 0;
          color: #93c5fd;
          font-size: 1.1rem;
        }

        .empleado-name {
          margin: 0;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .solicitud-description {
          color: #cbd5e1;
          margin: 1rem 0;
          line-height: 1.5;
        }

        .solicitud-dates {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .docs-count {
          color: #22c55e;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .solicitud-timestamp {
          color: #64748b;
          font-size: 0.8rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .btn-detalles {
          width: 100%;
          padding: 0.75rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .btn-detalles:hover {
          background: #2563eb;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(147, 197, 253, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(147, 197, 253, 0.2);
        }

        .modal-header h3 {
          margin: 0;
          color: #93c5fd;
        }

        .close-btn {
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #f1f5f9;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .info-section {
          margin-bottom: 1.5rem;
        }

        .info-section h4 {
          color: #93c5fd;
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-section p {
          margin: 0.5rem 0;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .docs-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .docs-list li {
          margin: 0.5rem 0;
        }

        .docs-list a {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.3s;
        }

        .docs-list a:hover {
          color: #60a5fa;
          text-decoration: underline;
        }

        .decision-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(147, 197, 253, 0.2);
        }

        .decision-section h4 {
          color: #93c5fd;
          margin: 0 0 1rem 0;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #f1f5f9;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.1);
        }

        .decision-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn-approve,
        .btn-reject,
        .btn-cancel {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-approve {
          background: #22c55e;
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          background: #16a34a;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: #6b7280;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #4b5563;
        }

        .btn-approve:disabled,
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .decision-result {
          background: rgba(15, 23, 42, 0.6);
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid #93c5fd;
        }

        .decision-result p {
          margin: 0.5rem 0;
          color: #cbd5e1;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
        }

        .feedback {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          animation: slideDown 0.3s ease-out;
        }

        .feedback.error {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .feedback.success {
          background: rgba(34, 197, 94, 0.1);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
