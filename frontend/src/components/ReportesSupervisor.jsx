import { useState } from 'react'

export default function ReportesSupervisor() {
  const [tipoReporte, setTipoReporte] = useState('cobertura')
  const [fechaInicio, setFechaInicio] = useState('2026-09-01')
  const [fechaFin, setFechaFin] = useState('2026-09-30')
  const [loading, setLoading] = useState(false)
  const [reporteGenerado, setReporteGenerado] = useState(false)

  const TIPOS_REPORTES = [
    { value: 'cobertura', label: 'Cobertura de Turnos' },
    { value: 'disponibilidad', label: 'Disponibilidad de Empleados' },
    { value: 'ausencias', label: 'Ausencias y Faltas' },
    { value: 'cambios', label: 'Cambios de Turno' },
    { value: 'desempen', label: 'Desempeño del Equipo' },
  ]

  const mockReportes = {
    cobertura: [
      {
        fecha: '2026-09-20',
        total_turnos: 12,
        asignados: 10,
        porcentaje: 83,
        estado: 'Aceptable',
      },
      {
        fecha: '2026-09-21',
        total_turnos: 12,
        asignados: 12,
        porcentaje: 100,
        estado: 'Óptimo',
      },
      {
        fecha: '2026-09-22',
        total_turnos: 12,
        asignados: 9,
        porcentaje: 75,
        estado: 'Bajo',
      },
    ],
    disponibilidad: [
      { empleado: 'Juan Pérez', disponible: 8, no_disponible: 2, porcentaje_disponibilidad: 80 },
      { empleado: 'María López', disponible: 10, no_disponible: 0, porcentaje_disponibilidad: 100 },
      { empleado: 'Carlos García', disponible: 6, no_disponible: 4, porcentaje_disponibilidad: 60 },
      { empleado: 'Ana Rodríguez', disponible: 0, no_disponible: 10, porcentaje_disponibilidad: 0 },
    ],
    ausencias: [
      {
        empleado: 'Juan Pérez',
        faltas: 1,
        permisos: 2,
        incapacidades: 1,
        total_ausencias: 4,
      },
      {
        empleado: 'María López',
        faltas: 0,
        permisos: 1,
        incapacidades: 0,
        total_ausencias: 1,
      },
      {
        empleado: 'Carlos García',
        faltas: 2,
        permisos: 1,
        incapacidades: 2,
        total_ausencias: 5,
      },
    ],
    cambios: [
      {
        fecha: '2026-09-18',
        desde_empleado: 'Juan Pérez',
        hacia_empleado: 'María López',
        turno: 'Mañana',
        motivo: 'Cambio solicitado',
        estado: 'Aprobado',
      },
      {
        fecha: '2026-09-19',
        desde_empleado: 'Carlos García',
        hacia_empleado: 'Juan Pérez',
        turno: 'Tarde',
        motivo: 'Cita médica',
        estado: 'Aprobado',
      },
    ],
    desempen: [
      {
        empleado: 'Juan Pérez',
        puntualidad: 95,
        asistencia: 95,
        cumplimiento: 90,
        promedio: 93,
      },
      {
        empleado: 'María López',
        puntualidad: 100,
        asistencia: 98,
        cumplimiento: 95,
        promedio: 98,
      },
      {
        empleado: 'Carlos García',
        puntualidad: 85,
        asistencia: 92,
        cumplimiento: 88,
        promedio: 88,
      },
    ],
  }

  const generarReporte = () => {
    setLoading(true)
    setTimeout(() => {
      setReporteGenerado(true)
      setLoading(false)
    }, 800)
  }

  const descargarReporte = (formato) => {
    console.log(`Descargando reporte en ${formato}...`)
  }

  const renderTablaReporte = () => {
    const datos = mockReportes[tipoReporte]

    switch (tipoReporte) {
      case 'cobertura':
        return (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total Turnos</th>
                <th>Asignados</th>
                <th>Cobertura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.fecha}</td>
                  <td>{row.total_turnos}</td>
                  <td>{row.asignados}</td>
                  <td>
                    <div className="porcentaje-bar">
                      <div
                        className="porcentaje-fill"
                        style={{ width: `${row.porcentaje}%`, backgroundColor: '#0fc1f9' }}
                      />
                    </div>
                    {row.porcentaje}%
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: row.porcentaje === 100 ? '#22c55e' : row.porcentaje >= 80 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'disponibilidad':
        return (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Disponible</th>
                <th>No Disponible</th>
                <th>% Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.empleado}</td>
                  <td>{row.disponible}</td>
                  <td>{row.no_disponible}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: row.porcentaje_disponibilidad >= 80 ? '#22c55e' : row.porcentaje_disponibilidad >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {row.porcentaje_disponibilidad}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'ausencias':
        return (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Faltas</th>
                <th>Permisos</th>
                <th>Incapacidades</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.empleado}</td>
                  <td>{row.faltas}</td>
                  <td>{row.permisos}</td>
                  <td>{row.incapacidades}</td>
                  <td>
                    <strong style={{ color: row.total_ausencias > 3 ? '#ef4444' : '#22c55e' }}>
                      {row.total_ausencias}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'cambios':
        return (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Desde</th>
                <th>Hacia</th>
                <th>Turno</th>
                <th>Motivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.fecha}</td>
                  <td>{row.desde_empleado}</td>
                  <td>{row.hacia_empleado}</td>
                  <td>{row.turno}</td>
                  <td>{row.motivo}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#22c55e' }}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'desempen':
        return (
          <table className="reporte-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Puntualidad</th>
                <th>Asistencia</th>
                <th>Cumplimiento</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.empleado}</td>
                  <td>
                    <span className="score-badge" style={{ color: row.puntualidad >= 90 ? '#22c55e' : '#f59e0b' }}>
                      {row.puntualidad}%
                    </span>
                  </td>
                  <td>
                    <span className="score-badge" style={{ color: row.asistencia >= 90 ? '#22c55e' : '#f59e0b' }}>
                      {row.asistencia}%
                    </span>
                  </td>
                  <td>
                    <span className="score-badge" style={{ color: row.cumplimiento >= 90 ? '#22c55e' : '#f59e0b' }}>
                      {row.cumplimiento}%
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: row.promedio >= 90 ? '#22c55e' : row.promedio >= 80 ? '#f59e0b' : '#ef4444' }}>
                      {row.promedio}%
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      default:
        return null
    }
  }

  return (
    <section className="panel reportes-supervisor-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Análisis</span>
          <h2>Reportes</h2>
        </div>
      </div>

      <div className="reportes-filtros">
        <div className="form-group">
          <label htmlFor="tipo-reporte">Tipo de Reporte</label>
          <select
            id="tipo-reporte"
            value={tipoReporte}
            onChange={(e) => {
              setTipoReporte(e.target.value)
              setReporteGenerado(false)
            }}
          >
            {TIPOS_REPORTES.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fecha-inicio">Desde</label>
          <input
            id="fecha-inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha-fin">Hasta</label>
          <input
            id="fecha-fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={generarReporte}
          disabled={loading}
        >
          {loading ? '⏳ Generando...' : '🔄 Generar'}
        </button>
      </div>

      {reporteGenerado && (
        <div className="reporte-generado">
          <div className="reporte-acciones">
            <button
              className="btn btn-secondary"
              onClick={() => descargarReporte('pdf')}
            >
              📄 PDF
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => descargarReporte('excel')}
            >
              📊 Excel
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => descargarReporte('csv')}
            >
              📋 CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              🖨️ Imprimir
            </button>
          </div>

          <div className="reporte-contenido">
            {renderTablaReporte()}
          </div>
        </div>
      )}
    </section>
  )
}
