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

  const descargarExcelCalendario = async () => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const solido = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
    const borde = (argb) => ({ style: 'thin', color: { argb } })
    const bordes = (argb) => ({ top: borde(argb), left: borde(argb), bottom: borde(argb), right: borde(argb) })

    const turnosPorFecha = {}
    misTurnos.forEach((t) => {
      const m = String(t.fecha || '').match(/^(\d{4}-\d{2}-\d{2})/)
      if (m) turnosPorFecha[m[1]] = t
    })
    const meses = [...new Set(Object.keys(turnosPorFecha).map((f) => f.slice(0, 7)))].sort()
    const nombresDias = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

    meses.forEach((claveMes) => {
      const [anio, mes] = claveMes.split('-').map(Number)
      const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' })
        .format(new Date(Date.UTC(anio, mes - 1, 1)))
      const titulo = `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${anio}`
      const ws = wb.addWorksheet(titulo, { views: [{ showGridLines: false }] })
      ws.columns = Array.from({ length: 7 }, () => ({ width: 22 }))

      ws.mergeCells('A1:E1')
      Object.assign(ws.getCell('A1'), { value: `Malla de ${titulo}` })
      ws.getCell('A1').font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF93C5FD' } }
      ws.getCell('A1').alignment = { vertical: 'middle' }
      ws.mergeCells('F1:G1')
      ws.getCell('F1').value = empleadoInfo
        ? `${empleadoInfo.nombre || ''}${empleadoInfo.especialidad ? ' - ' + empleadoInfo.especialidad : ''}`
        : ''
      ws.getCell('F1').font = { size: 10, color: { argb: 'FFCBD5E1' } }
      ws.getCell('F1').alignment = { horizontal: 'right', vertical: 'middle' }
      ws.getRow(1).height = 30

      const filaHeader = ws.getRow(3)
      nombresDias.forEach((d, i) => {
        const c = filaHeader.getCell(i + 1)
        c.value = d
        c.font = { bold: true, size: 11, color: { argb: 'FF93C5FD' } }
        c.alignment = { horizontal: 'center', vertical: 'middle' }
        c.fill = solido('FF1E293B')
        c.border = bordes('FF334155')
      })
      filaHeader.height = 22

      const inicio = (new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay() + 6) % 7
      const totalDias = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
      const filas = Math.ceil((inicio + totalDias) / 7)

      for (let f = 0; f < filas; f++) ws.getRow(4 + f).height = 62
      for (let pos = 0; pos < filas * 7; pos++) {
        const dia = pos - inicio + 1
        const celda = ws.getRow(4 + Math.floor(pos / 7)).getCell((pos % 7) + 1)
        if (dia < 1 || dia > totalDias) {
          celda.fill = solido('FF0F172A')
          continue
        }
        const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
        const turno = turnosPorFecha[fecha]
        const nombre = turno ? String(turno.nombre_turno || turno.turno || '') : ''
        const horario = turno ? `${turno.hora_inicio?.slice(0, 5) || ''} - ${turno.hora_fin?.slice(0, 5) || ''}` : ''

        celda.value = {
          richText: turno
            ? [
                { text: `${dia}\n`, font: { bold: true, size: 12, color: { argb: 'FF86EFAC' } } },
                { text: `${nombre}\n`, font: { bold: true, size: 10, color: { argb: 'FF86EFAC' } } },
                { text: horario, font: { size: 9, color: { argb: 'FFA7F3D0' } } }
              ]
            : [
                { text: `${dia}\n`, font: { bold: true, size: 12, color: { argb: 'FFCBD5E1' } } },
                { text: 'Descanso', font: { italic: true, size: 9, color: { argb: 'FF64748B' } } }
              ]
        }
        celda.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
        celda.fill = solido(turno ? 'FF16352F' : 'FF182133')
        celda.border = bordes(turno ? 'FF2A6B4A' : 'FF243247')
      }

      // Fondo oscuro como en la plataforma
      for (let r = 1; r <= 4 + filas; r++) {
        for (let c = 1; c <= 7; c++) {
          const cell = ws.getRow(r).getCell(c)
          if (!cell.fill || cell.fill.type !== 'pattern') cell.fill = solido('FF0F172A')
        }
      }
      ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1 }
    })

    const buffer = await wb.xlsx.writeBuffer()
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `mis_turnos_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Estructura de la malla completa igual a la de pantalla: empleados x fechas, agrupada por mes
  const construirRoster = () => {
    const porEmpleado = {}
    const fechas = new Set()
    ;(malla?.turnos || []).forEach((turno) => {
      const m = String(turno.fecha || '').match(/^(\d{4}-\d{2}-\d{2})/)
      if (!m) return
      const nombre = turno.nombre_empleado || 'Sin asignar'
      if (!porEmpleado[nombre]) porEmpleado[nombre] = { nombre, asignaciones: {} }
      porEmpleado[nombre].asignaciones[m[1]] = {
        turno: turno.nombre_turno || turno.turno,
        duracion: turno.duracion_horas
      }
      fechas.add(m[1])
    })
    const empleados = Object.values(porEmpleado).sort((a, b) => a.nombre.localeCompare(b.nombre))
    const meses = {}
    ;[...fechas].sort().forEach((f) => {
      const k = f.slice(0, 7)
      if (!meses[k]) meses[k] = []
      meses[k].push(f)
    })
    const abreviatura = (asig) => asig
      ? `${asig.duracion ?? '8'}${String(asig.turno || '').toLowerCase().includes('noche') ? 'N' : 'D'}`
      : 'DES'
    const tituloMes = (k) => {
      const [a, m] = k.split('-').map(Number)
      const n = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, 1)))
      return `${n.charAt(0).toUpperCase() + n.slice(1)} ${a}`
    }
    return { empleados, meses, abreviatura, tituloMes }
  }

  const descargarExcelMallaCompleta = async () => {
    const ExcelJS = (await import('exceljs')).default
    const { empleados, meses, abreviatura, tituloMes } = construirRoster()
    const wb = new ExcelJS.Workbook()
    const solido = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
    const borde = (argb) => ({ style: 'thin', color: { argb } })
    const bordes = (argb) => ({ top: borde(argb), left: borde(argb), bottom: borde(argb), right: borde(argb) })
    const miNombre = empleadoInfo?.nombre
    const cfg = malla?.configuracion

    Object.keys(meses).forEach((claveMes) => {
      const fechas = meses[claveMes]
      const ws = wb.addWorksheet(tituloMes(claveMes), { views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 5 }] })
      const totalCols = fechas.length + 1
      ws.getColumn(1).width = 34
      for (let c = 2; c <= totalCols; c++) ws.getColumn(c).width = 7

      ws.mergeCells(1, 1, 1, totalCols)
      ws.getCell(1, 1).value = `Malla Completa - ${tituloMes(claveMes)}`
      ws.getCell(1, 1).font = { size: 18, bold: true, color: { argb: 'FF93C5FD' } }
      ws.getRow(1).height = 30
      ws.mergeCells(2, 1, 2, totalCols)
      ws.getCell(2, 1).value = cfg
        ? `${cfg.nombre || ''}${cfg.empresa_nombre ? ' · ' + cfg.empresa_nombre : ''} · ${cfg.cantidad_empleados} empleados · ${cfg.horas_por_semana}h/semana · ${cfg.horas_por_mes}h/mes`
        : ''
      ws.getCell(2, 1).font = { size: 10, color: { argb: 'FFCBD5E1' } }
      ws.mergeCells(3, 1, 3, totalCols)
      ws.getCell(3, 1).value = 'D = turno diurno · N = turno nocturno (el número son las horas) · DES = descanso'
      ws.getCell(3, 1).font = { size: 9, italic: true, color: { argb: 'FF64748B' } }

      const h = ws.getRow(5)
      h.height = 24
      const hEmp = h.getCell(1)
      hEmp.value = 'Empleado'
      fechas.forEach((f, i) => {
        const c = h.getCell(i + 2)
        c.value = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${f}T00:00:00Z`))
      })
      for (let c = 1; c <= totalCols; c++) {
        const cell = h.getCell(c)
        cell.font = { bold: true, size: c === 1 ? 11 : 9, color: { argb: 'FF93C5FD' } }
        cell.fill = solido('FF1E293B')
        cell.alignment = { horizontal: c === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true }
        cell.border = bordes('FF334155')
      }

      empleados.forEach((emp, idx) => {
        const row = ws.getRow(6 + idx)
        row.height = 22
        const esMio = emp.nombre === miNombre
        const nombreCell = row.getCell(1)
        nombreCell.value = emp.nombre
        nombreCell.font = { bold: true, size: 11, color: { argb: esMio ? 'FF93C5FD' : 'FFE2E8F0' } }
        nombreCell.fill = solido('FF0F172A')
        nombreCell.alignment = { vertical: 'middle', indent: 1 }
        nombreCell.border = bordes(esMio ? 'FF60A5FA' : 'FF243247')
        fechas.forEach((f, i) => {
          const asig = emp.asignaciones[f]
          const cell = row.getCell(i + 2)
          cell.value = abreviatura(asig)
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.font = asig
            ? { bold: true, size: 10, color: { argb: 'FF86EFAC' } }
            : { size: 9, color: { argb: 'FF64748B' } }
          cell.fill = solido(asig ? 'FF16352F' : 'FF182133')
          cell.border = bordes(esMio ? 'FF60A5FA' : asig ? 'FF2A6B4A' : 'FF243247')
        })
      })

      // Fondo oscuro en el resto de la hoja visible
      for (let r = 1; r <= 5 + empleados.length; r++) {
        for (let c = 1; c <= totalCols; c++) {
          const cell = ws.getRow(r).getCell(c)
          if (!cell.fill || cell.fill.type !== 'pattern') cell.fill = solido('FF0F172A')
        }
      }
      ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    })

    const buffer = await wb.xlsx.writeBuffer()
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `malla_completa_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const descargarPDFMallaCompleta = async () => {
    const { jsPDF } = await import('jspdf')
    const { empleados, meses, abreviatura, tituloMes } = construirRoster()
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
    const fill = (c) => doc.setFillColor(...hex(c))
    const stroke = (c) => doc.setDrawColor(...hex(c))
    const color = (c) => doc.setTextColor(...hex(c))
    const miNombre = empleadoInfo?.nombre
    const cfg = malla?.configuracion
    const margen = 8
    const colNombre = 52

    let primera = true
    Object.keys(meses).forEach((claveMes) => {
      const fechas = meses[claveMes]
      const anchoCol = Math.min(8, (W - margen * 2 - colNombre) / fechas.length)
      const altoFila = 7
      const filasPorPagina = Math.floor((H - 34 - 12) / altoFila)
      const paginas = Math.ceil(empleados.length / filasPorPagina) || 1

      for (let p = 0; p < paginas; p++) {
        if (!primera) doc.addPage()
        primera = false
        fill('#0f172a'); doc.rect(0, 0, W, H, 'F')

        color('#93c5fd'); doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
        doc.text(`Malla Completa - ${tituloMes(claveMes)}`, margen, 12)
        color('#cbd5e1'); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5)
        if (cfg) {
          doc.text(`${cfg.nombre || ''}${cfg.empresa_nombre ? ' · ' + cfg.empresa_nombre : ''} · ${cfg.cantidad_empleados} empleados · ${cfg.horas_por_semana}h/semana · ${cfg.horas_por_mes}h/mes`, margen, 18)
        }
        color('#64748b'); doc.setFontSize(7.5)
        doc.text('D = diurno · N = nocturno (el número son las horas) · DES = descanso', margen, 23)

        const y0 = 27
        fill('#1e293b'); stroke('#334155'); doc.setLineWidth(0.2)
        doc.rect(margen, y0, colNombre, altoFila + 2, 'FD')
        color('#93c5fd'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
        doc.text('Empleado', margen + 2, y0 + 5.5)
        fechas.forEach((f, i) => {
          const x = margen + colNombre + i * anchoCol
          fill('#1e293b'); doc.rect(x, y0, anchoCol, altoFila + 2, 'FD')
          color('#93c5fd'); doc.setFontSize(6)
          const d = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${f}T00:00:00Z`)).replace('.', '')
          doc.text(d.split(' '), x + anchoCol / 2, y0 + 3.6, { align: 'center', lineHeightFactor: 1 })
        })

        empleados.slice(p * filasPorPagina, (p + 1) * filasPorPagina).forEach((emp, idx) => {
          const y = y0 + altoFila + 2 + idx * altoFila
          const esMio = emp.nombre === miNombre
          fill('#0f172a'); stroke(esMio ? '#60a5fa' : '#243247')
          doc.rect(margen, y, colNombre, altoFila, 'FD')
          color(esMio ? '#93c5fd' : '#e2e8f0'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
          doc.text(doc.splitTextToSize(emp.nombre, colNombre - 4)[0], margen + 2, y + 4.7)
          fechas.forEach((f, i) => {
            const asig = emp.asignaciones[f]
            const x = margen + colNombre + i * anchoCol
            fill(asig ? '#16352f' : '#182133')
            stroke(esMio ? '#60a5fa' : asig ? '#2a6b4a' : '#243247')
            doc.rect(x, y, anchoCol, altoFila, 'FD')
            color(asig ? '#86efac' : '#64748b')
            doc.setFont('helvetica', asig ? 'bold' : 'normal'); doc.setFontSize(asig ? 7 : 6)
            doc.text(abreviatura(asig), x + anchoCol / 2, y + 4.6, { align: 'center' })
          })
        })
      }
    })

    doc.save(`malla_completa_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const descargarExcel = async () => {
    if (activeTab === 'malla-completa') {
      if (!malla?.turnos?.length) {
        alert('No hay datos para descargar')
        return
      }
      return descargarExcelMallaCompleta()
    }
    if (!misTurnos.length) {
      alert('No hay datos para descargar')
      return
    }
    return descargarExcelCalendario()
  }

  // PDF que replica la vista "Mis Turnos": un calendario por mes con los mismos colores
  const descargarPDFCalendario = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
    const fill = (c) => doc.setFillColor(...hex(c))
    const stroke = (c) => doc.setDrawColor(...hex(c))
    const color = (c) => doc.setTextColor(...hex(c))

    const turnosPorFecha = {}
    misTurnos.forEach((t) => {
      const m = String(t.fecha || '').match(/^(\d{4}-\d{2}-\d{2})/)
      if (m) turnosPorFecha[m[1]] = t
    })
    const meses = [...new Set(Object.keys(turnosPorFecha).map((f) => f.slice(0, 7)))].sort()
    const nombresDias = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

    meses.forEach((claveMes, idx) => {
      if (idx > 0) doc.addPage()
      const [anio, mes] = claveMes.split('-').map(Number)
      const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' })
        .format(new Date(Date.UTC(anio, mes - 1, 1)))

      fill('#0f172a'); doc.rect(0, 0, W, H, 'F')

      color('#93c5fd'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
      doc.text(`Malla de ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${anio}`, 10, 14)
      if (empleadoInfo) {
        color('#cbd5e1'); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
        doc.text(`${empleadoInfo.nombre || ''}${empleadoInfo.especialidad ? ' - ' + empleadoInfo.especialidad : ''}`, W - 10, 14, { align: 'right' })
      }

      const margen = 10
      const gap = 1.5
      const anchoCelda = (W - margen * 2 - gap * 6) / 7
      const yHeader = 20
      nombresDias.forEach((d, i) => {
        color('#93c5fd'); doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
        doc.text(d, margen + i * (anchoCelda + gap) + anchoCelda / 2, yHeader + 4, { align: 'center' })
      })

      const primerDia = new Date(Date.UTC(anio, mes - 1, 1))
      const totalDias = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
      const inicio = (primerDia.getUTCDay() + 6) % 7
      const filas = Math.ceil((inicio + totalDias) / 7)
      const yGrid = yHeader + 7
      const altoCelda = Math.min(32, (H - yGrid - 10 - gap * (filas - 1)) / filas)

      for (let dia = 1; dia <= totalDias; dia++) {
        const pos = inicio + dia - 1
        const x = margen + (pos % 7) * (anchoCelda + gap)
        const y = yGrid + Math.floor(pos / 7) * (altoCelda + gap)
        const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
        const turno = turnosPorFecha[fecha]

        fill(turno ? '#16352f' : '#182133')
        stroke(turno ? '#2a6b4a' : '#243247')
        doc.setLineWidth(0.25)
        doc.roundedRect(x, y, anchoCelda, altoCelda, 1.5, 1.5, 'FD')

        color(turno ? '#86efac' : '#cbd5e1'); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
        doc.text(String(dia), x + 2, y + 5)

        if (turno) {
          const nombre = String(turno.nombre_turno || turno.turno || '')
          color('#86efac'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
          doc.text(doc.splitTextToSize(nombre, anchoCelda - 4).slice(0, 2), x + 2, y + 11)
          color('#a7f3d0'); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
          doc.text(`${turno.hora_inicio?.slice(0, 5) || ''} - ${turno.hora_fin?.slice(0, 5) || ''}`, x + 2, y + altoCelda - 3)
        } else {
          color('#64748b'); doc.setFont('helvetica', 'italic'); doc.setFontSize(8)
          doc.text('Descanso', x + 2, y + 11)
        }
      }
    })

    doc.save(`mis_turnos_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const descargarPDF = async () => {
    if (activeTab === 'malla-completa') {
      if (!malla?.turnos?.length) {
        alert('No hay datos para descargar')
        return
      }
      return descargarPDFMallaCompleta()
    }
    if (!misTurnos.length) {
      alert('No hay datos para descargar')
      return
    }
    return descargarPDFCalendario()
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
