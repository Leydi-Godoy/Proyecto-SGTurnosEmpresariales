import { useState } from 'react'

export default function ReportesPlanificador() {
  const [tipoReporte, setTipoReporte] = useState('cobertura')
  const [generando, setGenerando] = useState(false)
  const [reporteData, setReporteData] = useState(null)
  const [filtroFecha, setFiltroFecha] = useState({
    fecha_inicio: '2026-09-01',
    fecha_fin: '2026-09-30',
  })

  const TIPOS_REPORTES = [
    { value: 'cobertura', label: '📊 Cobertura por Día', icon: '📈' },
    { value: 'empleados', label: '👥 Turnos por Empleado', icon: '📋' },
    { value: 'sin-asignar', label: '⏳ Turnos Sin Asignar', icon: '❓' },
    { value: 'horas', label: '⏱️ Horas Totales', icon: '🕐' },
    { value: 'cambios', label: '🔄 Historial de Cambios', icon: '📝' },
  ]

  function handleGenerarReporte() {
    setGenerando(true)
    
    // Simular carga de reporte
    setTimeout(() => {
      const mockData = {
        cobertura: [
          { fecha: '2026-09-01', cobertura: 95, turnos: 12, asignados: 11 },
          { fecha: '2026-09-02', cobertura: 88, turnos: 12, asignados: 10 },
          { fecha: '2026-09-03', cobertura: 92, turnos: 12, asignados: 11 },
          { fecha: '2026-09-04', cobertura: 85, turnos: 12, asignados: 10 },
          { fecha: '2026-09-05', cobertura: 100, turnos: 12, asignados: 12 },
        ],
        empleados: [
          { nombre: 'Juan Pérez', turnos: 15, horas: 120, estado: 'Activo' },
          { nombre: 'María López', turnos: 14, horas: 112, estado: 'Activo' },
          { nombre: 'Carlos García', turnos: 10, horas: 80, estado: 'Permiso' },
          { nombre: 'Ana Martínez', turnos: 16, horas: 128, estado: 'Activo' },
        ],
        'sin-asignar': [
          { fecha: '2026-09-05', turno: 'Vespertino', razon: 'Empleado indisponible' },
          { fecha: '2026-09-07', turno: 'Nocturno', razon: 'Sin personal especializado' },
          { fecha: '2026-09-10', turno: 'Matutino', razon: 'Capacidad limitada' },
        ],
        horas: [
          { empleado: 'Juan Pérez', horas_ordinarias: 120, horas_extras: 5, total: 125 },
          { empleado: 'María López', horas_ordinarias: 112, horas_extras: 0, total: 112 },
          { empleado: 'Carlos García', horas_ordinarias: 80, horas_extras: 8, total: 88 },
        ],
        cambios: [
          { fecha: '2026-09-15', usuario: 'Admin', accion: 'Creó malla Septiembre', detalles: 'Malla 1' },
          { fecha: '2026-09-14', usuario: 'Planificador', accion: 'Asignó turno', detalles: 'Juan - 2026-09-15' },
          { fecha: '2026-09-13', usuario: 'Planificador', accion: 'Desasignó turno', detalles: 'María - 2026-09-14' },
        ],
      }

      setReporteData(mockData[tipoReporte] || [])
      setGenerando(false)
    }, 800)
  }

  function handleExportar() {
    alert('Exportación a CSV disponible en versión con backend')
    // TODO: Implementar exportación real
  }

  function handleImprimir() {
    window.print()
  }

  const tipoReporteObj = TIPOS_REPORTES.find((t) => t.value === tipoReporte)

  return (
    <section className="panel reportes-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Análisis</span>
          <h2>Reportes Operativos</h2>
        </div>
        <div className="header-actions">
          <button className="button-secondary" onClick={handleImprimir}>
            🖨️ Imprimir
          </button>
          <button className="button-secondary" onClick={handleExportar}>
            💾 Exportar
          </button>
        </div>
      </div>

      <div className="reportes-filtros">
        <div className="filtros-row">
          <div className="form-group">
            <label htmlFor="tipo-reporte">Tipo de Reporte</label>
            <select
              id="tipo-reporte"
              value={tipoReporte}
              onChange={(e) => {
                setTipoReporte(e.target.value)
                setReporteData(null)
              }}
            >
              {TIPOS_REPORTES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha-inicio">Desde</label>
            <input
              id="fecha-inicio"
              type="date"
              value={filtroFecha.fecha_inicio}
              onChange={(e) =>
                setFiltroFecha({ ...filtroFecha, fecha_inicio: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha-fin">Hasta</label>
            <input
              id="fecha-fin"
              type="date"
              value={filtroFecha.fecha_fin}
              onChange={(e) =>
                setFiltroFecha({ ...filtroFecha, fecha_fin: e.target.value })
              }
            />
          </div>

          <button
            className="button-primary"
            onClick={handleGenerarReporte}
            disabled={generando}
          >
            {generando ? 'Generando…' : '🔄 Generar'}
          </button>
        </div>
      </div>

      <div className="reporte-contenido">
        {!reporteData ? (
          <div className="empty-state">
            <p>Selecciona filtros y haz clic en "Generar" para ver el reporte.</p>
          </div>
        ) : (
          <>
            <h3 className="reporte-titulo">
              {tipoReporteObj?.icon} {tipoReporteObj?.label}
            </h3>

            {tipoReporte === 'cobertura' && (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cobertura</th>
                    <th>Asignados</th>
                    <th>Total Turnos</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Intl.DateTimeFormat('es-CO').format(new Date(row.fecha))}</td>
                      <td>
                        <span className={`badge ${row.cobertura >= 90 ? 'success' : 'warning'}`}>
                          {row.cobertura}%
                        </span>
                      </td>
                      <td>{row.asignados}</td>
                      <td>{row.turnos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'empleados' && (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Turnos</th>
                    <th>Horas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.nombre}</td>
                      <td>{row.turnos}</td>
                      <td>{row.horas}h</td>
                      <td>
                        <span className="badge info">{row.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'sin-asignar' && (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Razón</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Intl.DateTimeFormat('es-CO').format(new Date(row.fecha))}</td>
                      <td>
                        <span className="badge warning">{row.turno}</span>
                      </td>
                      <td>{row.razon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'horas' && (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Ordinarias</th>
                    <th>Extras</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.empleado}</td>
                      <td>{row.horas_ordinarias}h</td>
                      <td className="text-warning">{row.horas_extras}h</td>
                      <td>
                        <strong>{row.total}h</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'cambios' && (
              <table className="reporte-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.fecha))}</td>
                      <td>{row.usuario}</td>
                      <td>{row.accion}</td>
                      <td className="text-muted">{row.detalles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="reporte-footer">
              <p className="text-muted">
                Reportes generados el {new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
