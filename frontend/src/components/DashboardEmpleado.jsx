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

      // Obtener malla completa (próximos 30 días)
      const fechaHoy = new Date()
      const fechaFin = new Date(fechaHoy.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      const resMalla = await fetch(
        `/api/empleado/malla-completa?fecha_inicio=${fechaHoy.toISOString().split('T')[0]}&fecha_fin=${fechaFin.toISOString().split('T')[0]}`,
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
          <h2>Malla Completa - Próximos 30 días</h2>
          {malla && malla.turnos && malla.turnos.length > 0 ? (
            <div className="tabla-container">
              <table className="tabla-turnos">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Empleado</th>
                    <th>Especialidad</th>
                  </tr>
                </thead>
                <tbody>
                  {malla.turnos.map((turno, idx) => (
                    <tr key={idx} className={turno.nombre_empleado === empleadoInfo?.nombre ? 'mi-turno' : ''}>
                      <td>{turno.fecha}</td>
                      <td>{turno.nombre_turno || turno.turno}</td>
                      <td>{turno.nombre_empleado || <span className="sin-asignar">Sin asignar</span>}</td>
                      <td>{turno.especialidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No hay turnos disponibles</div>
          )}
        </div>
      )}

      {activeTab === 'mis-turnos' && (
        <div className="mis-turnos-section">
          <h2>Mis Turnos Asignados</h2>
          {misTurnos.length > 0 ? (
            <div className="turnos-grid">
              {misTurnos.map((turno, idx) => (
                <div key={idx} className="turno-card">
                  <div className="turno-fecha">{turno.fecha}</div>
                  <div className="turno-nombre">{turno.nombre_turno || turno.turno}</div>
                  <div className="turno-hora">
                    {turno.hora_inicio} - {turno.hora_fin}
                  </div>
                  <div className="turno-especialidad">{turno.especialidad}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No tienes turnos asignados</div>
          )}
        </div>
      )}
    </div>
  )
}
