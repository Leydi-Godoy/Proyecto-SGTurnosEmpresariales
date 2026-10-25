import { useState, useEffect, useCallback } from 'react'
import '../styles/DashboardEmpleado.css'

export default function DashboardEmpleado() {
  const [activeTab, setActiveTab] = useState('malla-completa')
  const [malla, setMalla] = useState(null)
  const [misTurnos, setMisTurnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [empleadoInfo, setEmpleadoInfo] = useState(null)

  const token = localStorage.getItem('token')

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      
      // Obtener info del empleado
      const resEmpleado = await fetch('/api/empleado/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resEmpleado.ok) {
        const empleado = await resEmpleado.json()
        setEmpleadoInfo(empleado)
      }

      // Obtener malla completa publicada (sin forzar un rango fijo de fechas,
      // ya que la vigencia de la malla la define el Planificador al generarla
      // y puede no coincidir con "los próximos 30 días" desde hoy).
      const resMalla = await fetch(
        '/api/empleado/malla-completa',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (resMalla.ok) {
        const data = await resMalla.json()
        setMalla(data)
      }

      // Obtener solo mis turnos
      const resMisTurnos = await fetch('/api/empleado/mis-turnos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resMisTurnos.ok) {
        const turnos = await resMisTurnos.json()
        setMisTurnos(turnos || [])
      }

      setMensaje('')
    } catch (error) {
      setMensaje(`❌ Error al cargar datos: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const descargarExcel = async () => {
    if (!malla || !malla.turnos) {
      alert('No hay datos para descargar')
      return
    }

    const datos = activeTab === 'malla-completa' 
      ? malla.turnos 
      : misTurnos

    const ws_data = [['Fecha', 'Turno', 'Empleado', 'Especialidad']]
    
    datos.forEach(turno => {
      ws_data.push([
        turno.fecha || '',
        turno.nombre_turno || turno.turno || '',
        turno.nombre_empleado || 'Sin asignar',
        turno.especialidad || ''
      ])
    })

    // Crear workbook con XLSX
    const { default: XLSX } = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Turnos')
    XLSX.writeFile(wb, `turnos_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const descargarPDF = async () => {
    if (!malla || !malla.turnos) {
      alert('No hay datos para descargar')
      return
    }

    const datos = activeTab === 'malla-completa' 
      ? malla.turnos 
      : misTurnos

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 10

    // Título
    doc.setFontSize(16)
    doc.text(`Malla de Turnos - ${activeTab === 'malla-completa' ? 'Completa' : 'Mis Turnos'}`, 10, yPosition)
    yPosition += 10

    // Información del empleado
    if (empleadoInfo) {
      doc.setFontSize(10)
      doc.text(`Empleado: ${empleadoInfo.nombre}`, 10, yPosition)
      yPosition += 5
      doc.text(`Especialidad: ${empleadoInfo.especialidad}`, 10, yPosition)
      yPosition += 10
    }

    // Tabla de datos
    doc.setFontSize(9)
    const columnWidths = [30, 35, 50, 40]
    const headers = ['Fecha', 'Turno', 'Empleado', 'Especialidad']

    // Headers
    headers.forEach((header, i) => {
      doc.text(header, 10 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), yPosition)
    })
    yPosition += 6

    // Data rows
    datos.forEach(turno => {
      if (yPosition > pageHeight - 15) {
        doc.addPage()
        yPosition = 10
      }

      const row = [
        turno.fecha || '',
        turno.nombre_turno || turno.turno || '',
        turno.nombre_empleado || 'Sin asignar',
        turno.especialidad || ''
      ]

      row.forEach((cell, i) => {
        doc.text(String(cell).substring(0, 15), 10 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), yPosition)
      })
      yPosition += 6
    })

    doc.save(`turnos_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (cargando) {
    return (
      <div className="empleado-dashboard">
        <div className="loading">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="empleado-dashboard">
      <div className="dashboard-header">
        <h1>📅 Mis Turnos</h1>
        {empleadoInfo && (
          <div className="empleado-info-header">
            <span>👤 {empleadoInfo.nombre}</span>
            <span>🏢 {empleadoInfo.especialidad}</span>
          </div>
        )}
      </div>

      {mensaje && (
        <div className={`message ${mensaje.includes('❌') ? 'error' : 'success'}`}>
          {mensaje}
        </div>
      )}

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'malla-completa' ? 'active' : ''}`}
          onClick={() => setActiveTab('malla-completa')}
        >
          📊 Malla Completa
        </button>
        <button
          className={`tab-btn ${activeTab === 'mis-turnos' ? 'active' : ''}`}
          onClick={() => setActiveTab('mis-turnos')}
        >
          ✅ Mis Turnos
        </button>
      </div>

      <div className="download-buttons">
        <button className="btn btn-excel" onClick={descargarExcel}>
          📥 Descargar Excel
        </button>
        <button className="btn btn-pdf" onClick={descargarPDF}>
          📥 Descargar PDF
        </button>
      </div>

      {activeTab === 'malla-completa' && (
        <div className="malla-section">
          <h2>Malla Completa</h2>

          {malla?.configuracion && (
            <div className="detail-modal-section">
              <h3>Configuración</h3>
              <div className="detail-modal-grid">
                <div className="detail-modal-item">
                  <label>Nombre:</label>
                  <p>{malla.configuracion.nombre}</p>
                </div>
                <div className="detail-modal-item">
                  <label>Empresa:</label>
                  <p>{malla.configuracion.empresa_nombre}</p>
                </div>
                <div className="detail-modal-item">
                  <label>Empleados:</label>
                  <p>{malla.configuracion.cantidad_empleados}</p>
                </div>
                <div className="detail-modal-item">
                  <label>Horas/Semana:</label>
                  <p>{malla.configuracion.horas_por_semana}h</p>
                </div>
                <div className="detail-modal-item">
                  <label>Horas/Mes:</label>
                  <p>{malla.configuracion.horas_por_mes}h</p>
                </div>
                <div className="detail-modal-item">
                  <label>Distribución:</label>
                  <p>{malla.configuracion.tipo_distribucion === 'equilibrada' ? '⚖️ Equilibrada' : '⚙️ Personalizada'}</p>
                </div>
              </div>
            </div>
          )}

          {malla?.turnosVinculados?.length > 0 && (
            <div className="detail-modal-section">
              <h3>Turnos Vinculados ({malla.turnosVinculados.length})</h3>
              <table className="detail-modal-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Duración (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {malla.turnosVinculados.map((turno) => (
                    <tr key={turno.id}>
                      <td>{turno.nombre}</td>
                      <td>{turno.hora_inicio}</td>
                      <td>{turno.hora_fin}</td>
                      <td>{turno.duracion_horas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="detail-modal-section">
            <h3>Malla de Turnos por Empleado ({malla?.turnos?.length || 0})</h3>
            {malla && malla.turnos && malla.turnos.length > 0 ? (
            <div className="detail-calendar-container">
              {(() => {
                // Normaliza una fecha (Date, ISO string, etc.) a 'YYYY-MM-DD'
                const normalizarFecha = (valor) => {
                  if (!valor) return null
                  if (valor instanceof Date) {
                    if (isNaN(valor.getTime())) return null
                    return valor.toISOString().slice(0, 10)
                  }
                  const texto = String(valor)
                  const match = texto.match(/^(\d{4}-\d{2}-\d{2})/)
                  return match ? match[1] : null
                }

                // Agrupar turnos por empleado y fecha
                const porEmpleado = {}
                const todasLasFechas = new Set()

                malla.turnos.forEach((turno) => {
                  const fechaNormalizada = normalizarFecha(turno.fecha)
                  if (!fechaNormalizada) return
                  const nombreEmpleado = turno.nombre_empleado || 'Sin asignar'
                  if (!porEmpleado[nombreEmpleado]) {
                    porEmpleado[nombreEmpleado] = { nombre: nombreEmpleado, asignaciones: {} }
                  }
                  porEmpleado[nombreEmpleado].asignaciones[fechaNormalizada] = {
                    turno: turno.nombre_turno || turno.turno,
                    duracion: turno.duracion_horas
                  }
                  todasLasFechas.add(fechaNormalizada)
                })

                const fechasOrdenadas = Array.from(todasLasFechas).sort()
                const empleadosOrdenados = Object.values(porEmpleado).sort((a, b) => a.nombre.localeCompare(b.nombre))
                const miNombre = empleadoInfo?.nombre

                return (
                  <table className="detail-roster-table">
                    <thead>
                      <tr>
                        <th className="detail-employee-col">Empleado</th>
                        {fechasOrdenadas.map((fecha) => (
                          <th key={fecha} className="detail-date-col" title={fecha}>
                            {new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${fecha}T00:00:00Z`))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosOrdenados.map((emp, idx) => (
                        <tr key={idx} className={emp.nombre === miNombre ? 'mi-turno' : ''}>
                          <td className="detail-employee-name">{emp.nombre}</td>
                          {fechasOrdenadas.map((fecha) => {
                            const asig = emp.asignaciones[fecha]
                            const abreviatura = asig
                              ? `${asig.duracion ?? '8'}${String(asig.turno || '').toLowerCase().includes('noche') ? 'N' : 'D'}`
                              : 'DES'
                            const clase = asig ? 'detail-assigned' : 'detail-rest'

                            return (
                              <td
                                key={`${idx}-${fecha}`}
                                className={`detail-roster-cell ${clase}`}
                                title={asig ? asig.turno : 'Descanso'}
                              >
                                {abreviatura}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
            </div>
            ) : (
              <div className="empty-state">No hay turnos disponibles</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mis-turnos' && (
        <div className="mis-turnos-section">
          {misTurnos.length > 0 ? (
            (() => {
              const normalizarFecha = (valor) => {
                if (!valor) return null
                if (valor instanceof Date) {
                  if (isNaN(valor.getTime())) return null
                  return valor.toISOString().slice(0, 10)
                }
                const texto = String(valor)
                const match = texto.match(/^(\d{4}-\d{2}-\d{2})/)
                return match ? match[1] : null
              }

              // Agrupar turnos por fecha normalizada
              const turnosPorFecha = {}
              misTurnos.forEach((turno) => {
                const fecha = normalizarFecha(turno.fecha)
                if (!fecha) return
                turnosPorFecha[fecha] = turno
              })

              // Agrupar las fechas por mes (clave 'YYYY-MM')
              const mesesMap = {}
              Object.keys(turnosPorFecha).forEach((fecha) => {
                const clave = fecha.slice(0, 7)
                if (!mesesMap[clave]) mesesMap[clave] = []
                mesesMap[clave].push(fecha)
              })
              const clavesMeses = Object.keys(mesesMap).sort()

              const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

              return clavesMeses.map((claveMes) => {
                const [anio, mes] = claveMes.split('-').map(Number)
                const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' })
                  .format(new Date(Date.UTC(anio, mes - 1, 1)))
                const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)

                // Primer y último día del mes
                const primerDia = new Date(Date.UTC(anio, mes - 1, 1))
                const ultimoDia = new Date(Date.UTC(anio, mes, 0))
                const totalDias = ultimoDia.getUTCDate()

                // Lunes = 0 ... Domingo = 6
                const diaSemanaInicio = (primerDia.getUTCDay() + 6) % 7

                // Construir celdas: espacios vacíos iniciales + días del mes
                const celdas = []
                for (let i = 0; i < diaSemanaInicio; i++) celdas.push(null)
                for (let dia = 1; dia <= totalDias; dia++) {
                  const fechaStr = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                  celdas.push({ dia, fecha: fechaStr, turno: turnosPorFecha[fechaStr] || null })
                }
                while (celdas.length % 7 !== 0) celdas.push(null)

                // Dividir en semanas
                const semanas = []
                for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7))

                return (
                  <div key={claveMes} className="calendario-mes-card">
                    <h2>Malla de {nombreMesCapitalizado} {anio}</h2>
                    <div className="calendario-hoja">
                      <div className="calendario-dias-header">
                        {nombresDias.map((d) => (
                          <div key={d} className="calendario-dia-nombre">{d}</div>
                        ))}
                      </div>
                      <div className="calendario-semanas">
                        {semanas.map((semana, semIdx) => (
                          <div key={semIdx} className="calendario-semana-fila">
                            {semana.map((celda, diaIdx) => (
                              <div
                                key={diaIdx}
                                className={`calendario-celda ${!celda ? 'calendario-celda-vacia' : celda.turno ? 'calendario-celda-turno' : 'calendario-celda-descanso'}`}
                              >
                                {celda && (
                                  <>
                                    <div className="calendario-celda-numero">{celda.dia}</div>
                                    {celda.turno ? (
                                      <div className="calendario-celda-info">
                                        <span className="calendario-celda-turno-nombre">{celda.turno.nombre_turno || celda.turno.turno}</span>
                                        <span className="calendario-celda-turno-hora">
                                          {celda.turno.hora_inicio?.slice(0, 5)} - {celda.turno.hora_fin?.slice(0, 5)}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="calendario-celda-descanso-texto">Descanso</div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            })()
          ) : (
            <div className="empty-state">No tienes turnos asignados</div>
          )}
        </div>
      )}
    </div>
  )
}
