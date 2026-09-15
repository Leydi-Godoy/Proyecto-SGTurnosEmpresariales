import { useEffect, useState } from 'react'

export default function AsignacionTurnos() {
  const [mallas, setMallas] = useState([])
  const [mallaSeleccionada, setMallaSeleccionada] = useState(null)
  const [empleados, setEmpleados] = useState([])
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtroEmpleado, setFiltroEmpleado] = useState('')
  const [cobertura, setCobertura] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setLoading(true)
    
    // Mock data - Mallas
    const mockMallas = [
      { id: 1, nombre: 'Malla Agosto 2026', fecha_inicio: '2026-08-01', fecha_fin: '2026-08-31' },
      { id: 2, nombre: 'Malla Septiembre 2026', fecha_inicio: '2026-09-01', fecha_fin: '2026-09-30' },
    ]
    
    // Mock data - Empleados
    const mockEmpleados = [
      { id: 1, nombre: 'Juan Pérez', especialidad: 'Administrativo', disponible: true },
      { id: 2, nombre: 'María López', especialidad: 'Atención al cliente', disponible: true },
      { id: 3, nombre: 'Carlos García', especialidad: 'Técnico', disponible: false },
      { id: 4, nombre: 'Ana Martínez', especialidad: 'Administrativo', disponible: true },
    ]

    // Mock data - Turnos
    const mockTurnos = [
      { id: 1, malla_id: 1, fecha: '2026-08-01', turno: 'Matutino', empleado_id: 1, estado: 'asignado' },
      { id: 2, malla_id: 1, fecha: '2026-08-01', turno: 'Vespertino', empleado_id: 2, estado: 'asignado' },
      { id: 3, malla_id: 1, fecha: '2026-08-02', turno: 'Matutino', empleado_id: null, estado: 'vacante' },
    ]

    setMallas(mockMallas)
    setEmpleados(mockEmpleados)
    setTurnos(mockTurnos)
    setCobertura(67)
    setLoading(false)
  }

  function handleSelectMalla(mallaId) {
    const malla = mallas.find((m) => m.id === mallaId)
    setMallaSeleccionada(malla)
  }

  function handleAsignar(turnoId, empleadoId) {
    setTurnos(
      turnos.map((t) =>
        t.id === turnoId ? { ...t, empleado_id: empleadoId, estado: 'asignado' } : t
      )
    )
    setSuccess('Turno asignado exitosamente')
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleDesasignar(turnoId) {
    setTurnos(
      turnos.map((t) =>
        t.id === turnoId ? { ...t, empleado_id: null, estado: 'vacante' } : t
      )
    )
    setSuccess('Turno desasignado')
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleAutoAsignar() {
    alert('La asignación automática se ejecutará en la versión con backend.')
    // TODO: Implementar lógica de auto-asignación
  }

  const empleadosFiltrados = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(filtroEmpleado.toLowerCase())
  )

  const turnosPorFecha = mallaSeleccionada
    ? turnos
        .filter((t) => t.malla_id === mallaSeleccionada.id)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    : []

  const turnosPorGrupo = {}
  turnosPorFecha.forEach((t) => {
    if (!turnosPorGrupo[t.fecha]) turnosPorGrupo[t.fecha] = []
    turnosPorGrupo[t.fecha].push(t)
  })

  if (loading) return <section className="panel"><p className="loading-message">Cargando…</p></section>

  return (
    <section className="panel asignacion-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Operacional</span>
          <h2>Asignación de Turnos</h2>
        </div>
        <button className="button-primary" onClick={handleAutoAsignar}>
          ⚡ Auto-Asignación
        </button>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      <div className="asignacion-header">
        <div className="form-group">
          <label htmlFor="malla-select">Seleccionar malla</label>
          <select
            id="malla-select"
            value={mallaSeleccionada?.id || ''}
            onChange={(e) => handleSelectMalla(Number(e.target.value))}
          >
            <option value="">-- Seleccionar --</option>
            {mallas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="cobertura-info">
          <span>Cobertura: {cobertura}%</span>
          <div className="cobertura-bar">
            <div className="cobertura-fill" style={{ width: `${cobertura}%` }} />
          </div>
        </div>
      </div>

      {mallaSeleccionada ? (
        <div className="asignacion-content">
          <div className="turnos-seccion">
            <h3>📅 Turnos por Asignar</h3>
            <div className="turnos-list">
              {Object.keys(turnosPorGrupo).length === 0 ? (
                <p className="empty-message">Cargando turnos…</p>
              ) : (
                Object.entries(turnosPorGrupo).map(([fecha, grupoTurnos]) => (
                  <div key={fecha} className="fecha-grupo">
                    <h4 className="fecha-label">
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(
                        new Date(fecha)
                      )}
                    </h4>
                    <div className="turnos-flex">
                      {grupoTurnos.map((turno) => (
                        <div
                          key={turno.id}
                          className={`turno-card turno-${turno.estado}`}
                        >
                          <div className="turno-tipo">{turno.turno}</div>
                          <div className="turno-assignee">
                            {turno.empleado_id ? (
                              <>
                                <p>{empleados.find((e) => e.id === turno.empleado_id)?.nombre}</p>
                                <button
                                  className="btn-small"
                                  onClick={() => handleDesasignar(turno.id)}
                                >
                                  ✕ Remover
                                </button>
                              </>
                            ) : (
                              <p className="vacante">Sin asignar</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="empleados-seccion">
            <h3>👥 Empleados Disponibles</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar empleado…"
              value={filtroEmpleado}
              onChange={(e) => setFiltroEmpleado(e.target.value)}
            />
            <div className="empleados-list">
              {empleadosFiltrados.length === 0 ? (
                <p className="empty-message">No hay empleados que coincidan</p>
              ) : (
                empleadosFiltrados.map((emp) => (
                  <div
                    key={emp.id}
                    className={`empleado-item ${!emp.disponible ? 'no-disponible' : ''}`}
                  >
                    <div className="empleado-info">
                      <p className="empleado-nombre">{emp.nombre}</p>
                      <p className="empleado-especialidad">{emp.especialidad}</p>
                      <p className={`disponibilidad ${emp.disponible ? 'disponible' : 'no-disponible'}`}>
                        {emp.disponible ? '✓ Disponible' : '✗ No disponible'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>Selecciona una malla para comenzar a asignar turnos.</p>
        </div>
      )}
    </section>
  )
}
