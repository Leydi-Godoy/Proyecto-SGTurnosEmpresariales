import { useEffect, useState } from 'react'
import './MallasTurnos.css'

async function parseJsonSafe(response) {
  const texto = await response.text()
  try {
    return texto ? JSON.parse(texto) : {}
  } catch {
    throw new Error(
      `El servidor no respondió con datos válidos (HTTP ${response.status}). ` +
      'Verifica que el backend esté corriendo y actualizado.'
    )
  }
}

export default function MallasTurnos() {
  const [mallas, setMallas] = useState([])
  const [configuraciones, setConfiguraciones] = useState([])
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null)
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showGenerador, setShowGenerador] = useState(false)
  const [showAsignacion, setShowAsignacion] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generando, setGenerando] = useState(false)
  const [asignando, setAsignando] = useState(false)
  
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
  })

  const [generadorForm, setGeneradorForm] = useState({
    configuracion_id: '',
    mes: '',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_semanas: 4,
    tipo_distribucion: 'equilibrada',
    pautas_seleccionadas: [],
  })

  const [asignacionForm, setAsignacionForm] = useState({
    configuracion_id: '',
    considerarEspecialidades: true,
    respetarDisponibilidades: true,
    equilibrarCarga: true,
    empleadosExcluir: '',
  })

  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    loadMallas()
    loadConfiguraciones()
  }, [])

  async function loadMallas() {
    try {
      setLoading(true)
      const response = await fetch('/api/planificador/mallas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Error al cargar mallas')
      
      const data = await response.json()
      setMallas(data.mallas || [])
    } catch (err) {
      console.error('Error cargando mallas:', err)
      setError('Error al cargar mallas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadConfiguraciones() {
    try {
      const response = await fetch('/api/configuraciones-malla', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las configuraciones')
      setConfiguraciones((data.configuraciones || []).filter(config => Number(config.activo) === 1))
    } catch (err) {
      console.error('Error cargando configuraciones:', err)
      setError(err.message)
    }
  }

  async function abrirDetalles(mallaId) {
    try {
      setModalLoading(true)
      const response = await fetch(`/api/planificador/mallas/${mallaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar detalles')
      }
      
      const data = await response.json()
      setModalData(data)
      setShowModal(true)
    } catch (err) {
      console.error('Error cargando detalles:', err)
      setError('Error: ' + err.message)
    } finally {
      setModalLoading(false)
    }
  }

  function handleSeleccionarMes(valorMes) {
    if (!valorMes) {
      setGeneradorForm(current => ({ ...current, mes: '', fecha_inicio: '', fecha_fin: '' }))
      return
    }
    const [anioStr, mesStr] = valorMes.split('-')
    const anio = Number(anioStr)
    const mesIndice = Number(mesStr) - 1 // 0-based
    const primerDia = new Date(Date.UTC(anio, mesIndice, 1))
    const ultimoDia = new Date(Date.UTC(anio, mesIndice + 1, 0)) // día 0 del mes siguiente = último día del mes actual
    const formatear = (fecha) => fecha.toISOString().slice(0, 10)
    setGeneradorForm(current => ({
      ...current,
      mes: valorMes,
      fecha_inicio: formatear(primerDia),
      fecha_fin: formatear(ultimoDia),
    }))
  }

  async function seleccionarConfiguracion(id) {
    const configuracionBase = configuraciones.find(config => String(config.id) === id)
    setGeneradorForm(current => ({
      ...current,
      configuracion_id: id,
      tipo_distribucion: configuracionBase?.tipo_distribucion || current.tipo_distribucion
    }))
    setConfiguracionSeleccionada(configuracionBase || null)
    setError('')

    if (!id) return

    try {
      setCargandoConfiguracion(true)
      const response = await fetch(`/api/configuraciones-malla/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo consultar la configuración')
      setConfiguracionSeleccionada(data)
    } catch (err) {
      console.error('Error consultando configuración:', err)
      setError(err.message)
    } finally {
      setCargandoConfiguracion(false)
    }
  }

  async function handleGenerarMalla(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!generadorForm.configuracion_id || !generadorForm.fecha_inicio || !generadorForm.fecha_fin) {
      setError('Configuración y mes a generar son obligatorios')
      return
    }

    const inicio = new Date(`${generadorForm.fecha_inicio}T00:00:00Z`)
    const fin = new Date(`${generadorForm.fecha_fin}T00:00:00Z`)
    if (fin < inicio) {
      setError('La fecha de fin debe ser posterior o igual a la fecha de inicio')
      return
    }

    // Calcular cuántas semanas completas cubre el rango (el backend corta exactamente en fecha_fin)
    const diasRango = Math.round((fin - inicio) / 86400000) + 1
    const semanasCalculadas = Math.max(1, Math.ceil(diasRango / 7))

    try {
      setGenerando(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch('/api/planificador/generar-malla', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa_id: user.empresa_id || user.Id_usuario,
          configuracion_id: Number(generadorForm.configuracion_id),
          fecha_inicio: generadorForm.fecha_inicio,
          fecha_fin: generadorForm.fecha_fin,
          cantidad_semanas: semanasCalculadas,
          tipoDistribucion: generadorForm.tipo_distribucion || 'equilibrada',
          pautasSeleccionadas: generadorForm.pautas_seleccionadas?.length > 0 
            ? generadorForm.pautas_seleccionadas.map(Number)
            : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const detalle = typeof errorData.detalle === 'string'
          ? errorData.detalle
          : errorData.detalle ? JSON.stringify(errorData.detalle) : ''
        throw new Error([errorData.error, detalle].filter(Boolean).join(': ') || 'Error al generar malla')
      }

      const data = await response.json()
      const advertencias = data.datos?.resumenLegal?.advertencias || []
      setSuccess(`✓ Malla generada exitosamente con ${data.datos.totalInstancias} instancias de turnos${advertencias.length ? `. Atención: ${advertencias.join(' ')}` : ''}`)
      setShowGenerador(false)
      setGeneradorForm({
        configuracion_id: '',
        mes: '',
        fecha_inicio: '',
        fecha_fin: '',
        cantidad_semanas: 4,
        tipo_distribucion: 'equilibrada',
        pautas_seleccionadas: [],
      })
      setConfiguracionSeleccionada(null)
      
      // Recargar mallas
      await loadMallas()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Error generando malla:', err)
      setError('Error: ' + err.message)
    } finally {
      setGenerando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      setError('Nombre y fechas son obligatorios')
      return
    }

    if (new Date(form.fecha_inicio) >= new Date(form.fecha_fin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setSuccess('Malla creada exitosamente')
    setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
    setShowForm(false)

    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar el calendario generado de esta malla? La configuración base (empleados, turnos, horas) seguirá disponible para volver a generarla cuando quieras.')) return
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/planificador/mallas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await parseJsonSafe(response)
      if (!response.ok) throw new Error(data.error || 'Error al eliminar la malla')

      setSuccess('Malla eliminada')
      await loadMallas()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error eliminando malla:', err)
      setError('Error: ' + err.message)
    }
  }

  async function handlePublish(id, publicarActual) {
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/planificador/mallas/${id}/publicar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicar: !publicarActual })
      })
      const data = await parseJsonSafe(response)
      if (!response.ok) throw new Error(data.error || 'Error al publicar la malla')

      setSuccess(data.mensaje || 'Estado de publicación actualizado')
      await loadMallas()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error('Error publicando malla:', err)
      setError('Error: ' + err.message)
    }
  }

  async function handleAsignarAutomaticamente(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!asignacionForm.configuracion_id) {
      setError('Selecciona una configuración de malla para asignar empleados')
      return
    }

    try {
      setAsignando(true)
      const response = await fetch('/api/planificador/asignar-automaticamente', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          malla_id: Number(asignacionForm.configuracion_id),
          criterios: {
            considerarEspecialidades: asignacionForm.considerarEspecialidades,
            respetarDisponibilidades: asignacionForm.respetarDisponibilidades,
            equilibrarCarga: asignacionForm.equilibrarCarga,
            empleadosExcluir: asignacionForm.empleadosExcluir
              ? asignacionForm.empleadosExcluir.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
              : [],
            empleadosIncluir: null
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al asignar empleados')
      }

      const data = await response.json()
      setSuccess(`Asignacion completada: ${data.asignacionesRealizadas} empleados asignados (${data.porcentajeCobertura} cobertura)`)
      setShowAsignacion(false)
      setAsignacionForm({
        configuracion_id: '',
        considerarEspecialidades: true,
        respetarDisponibilidades: true,
        equilibrarCarga: true,
        empleadosExcluir: '',
      })
      
      await loadMallas()
      setTimeout(() => setSuccess(''), 8000)
    } catch (err) {
      console.error('Error asignando empleados:', err)
      setError('Error: ' + err.message)
    } finally {
      setAsignando(false)
    }
  }

  return (
    <section className="panel mallas-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2>Mallas de Turnos</h2>
        </div>
        <div className="button-group">
          <button
            className={`button-primary ${showGenerador ? 'active' : ''}`}
            onClick={() => {
              setShowGenerador(!showGenerador)
              setShowForm(false)
              setShowAsignacion(false)
            }}
            title="Generar malla automáticamente usando configuraciones"
          >
            {showGenerador ? 'Cancelar' : '⚙️ Generar Automático'}
          </button>
          <button
            className={`button-primary ${showAsignacion ? 'active' : ''}`}
            onClick={() => {
              setShowAsignacion(!showAsignacion)
              setShowForm(false)
              setShowGenerador(false)
            }}
            title="Asignar empleados automáticamente"
          >
            {showAsignacion ? 'Cancelar' : '👥 Asignar Empleados'}
          </button>
          <button
            className={`button-secondary ${showForm ? 'active' : ''}`}
            onClick={() => {
              setShowForm(!showForm)
              setShowGenerador(false)
              setShowAsignacion(false)
              setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
            }}
          >
            {showForm ? 'Cancelar' : '➕ Manual'}
          </button>
        </div>
      </div>

      {error && <div className="feedback error">❌ {error}</div>}
      {success && <div className="feedback success">✓ {success}</div>}

      {/* FORMULARIO DE GENERACIÓN AUTOMÁTICA */}
      {showGenerador && (
        <div className="generador-form-container">
          <form className="generador-form" onSubmit={handleGenerarMalla}>
            <h3>Generar Malla Automáticamente</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="config">Configuración de Malla *</label>
                <select
                  id="config"
                  required
                  value={generadorForm.configuracion_id}
                  onChange={(e) => seleccionarConfiguracion(e.target.value)}
                >
                  <option value="">-- Selecciona una configuración --</option>
                  {configuraciones.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.nombre} ({config.cantidad_empleados} empleados)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mes_gen">Mes a generar *</label>
                <input
                  id="mes_gen"
                  type="month"
                  required
                  value={generadorForm.mes}
                  onChange={(e) => handleSeleccionarMes(e.target.value)}
                />
                <small className="field-hint">
                  {generadorForm.fecha_inicio && generadorForm.fecha_fin
                    ? `Se generará del ${new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${generadorForm.fecha_inicio}T00:00:00Z`))} al ${new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${generadorForm.fecha_fin}T00:00:00Z`))} (todo el mes, sin importar si tiene 4 o 5 semanas).`
                    : 'Selecciona el mes completo que quieres cubrir con esta malla.'}
                </small>
              </div>
            </div>

            {configuracionSeleccionada && (
              <section className="config-preview" aria-live="polite">
                <div className="config-preview-heading">
                  <h4>Verificación de configuración</h4>
                  {cargandoConfiguracion && <span>Actualizando detalle...</span>}
                </div>
                {configuracionSeleccionada.descripcion && <p className="config-preview-description">{configuracionSeleccionada.descripcion}</p>}
                <div className="config-preview-grid">
                  <div><span>Empleados requeridos</span><strong>{configuracionSeleccionada.cantidad_empleados}</strong></div>
                  <div><span>Turnos por empleado/mes</span><strong>{configuracionSeleccionada.turnos_mensuales_empleado}</strong></div>
                  <div><span>Horas por semana</span><strong>{configuracionSeleccionada.horas_por_semana}</strong></div>
                  <div><span>Horas por mes</span><strong>{configuracionSeleccionada.horas_por_mes}</strong></div>
                  <div><span>Días laborales/semana</span><strong>{configuracionSeleccionada.dias_laborales_por_semana}</strong></div>
                  <div><span>Distribución configurada</span><strong>{configuracionSeleccionada.tipo_distribucion || 'equilibrada'}</strong></div>
                </div>
                {configuracionSeleccionada.turnos?.length > 0 && (
                  <div className="config-preview-shifts">
                    <span>Turnos incluidos</span>
                    <ul>
                      {configuracionSeleccionada.turnos.map(turno => (
                        <li key={turno.id || turno.plantilla_id}>{turno.nombre} · {turno.duracion_horas} h</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="distribucion">Tipo de Distribución</label>
                <select
                  id="distribucion"
                  value={generadorForm.tipo_distribucion}
                  onChange={(e) => setGeneradorForm({ ...generadorForm, tipo_distribucion: e.target.value })}
                >
                  <option value="equilibrada">Equilibrada (Recomendada)</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="button-primary" 
                type="submit"
                disabled={generando || cargandoConfiguracion}
              >
                {generando ? '⏳ Generando...' : '🚀 Generar Malla'}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setShowGenerador(false)
                  setConfiguracionSeleccionada(null)
                  setGeneradorForm({
                    configuracion_id: '',
                    mes: '',
                    fecha_inicio: '',
                    fecha_fin: '',
                    cantidad_semanas: 4,
                    tipo_distribucion: 'equilibrada',
                    pautas_seleccionadas: [],
                  })
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORMULARIO DE ASIGNACION AUTOMATICA */}
      {showAsignacion && (
        <div className="asignacion-form-container">
          <form className="asignacion-form" onSubmit={handleAsignarAutomaticamente}>
            <h3>Asignar Empleados Automáticamente</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="configuracion">Configuración de Malla *</label>
                <select
                  id="configuracion"
                  required
                  value={asignacionForm.configuracion_id}
                  onChange={(e) => setAsignacionForm({ ...asignacionForm, configuracion_id: e.target.value })}
                >
                  <option value="">-- Selecciona una configuración --</option>
                  {configuraciones.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.nombre} ({config.cantidad_empleados} empleados, {config.turnos_mensuales_empleado} turnos/mes)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4>Criterios de Asignacion</h4>
              
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={asignacionForm.considerarEspecialidades}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, considerarEspecialidades: e.target.checked })}
                    />
                    Considerar especialidades requeridas
                  </label>
                  <p className="help-text">Solo asignar empleados con la especialidad correcta</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={asignacionForm.respetarDisponibilidades}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, respetarDisponibilidades: e.target.checked })}
                    />
                    Respetar disponibilidades de empleados
                  </label>
                  <p className="help-text">Solo asignar turnos en horarios disponibles</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={asignacionForm.equilibrarCarga}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, equilibrarCarga: e.target.checked })}
                    />
                    Equilibrar carga de trabajo
                  </label>
                  <p className="help-text">Distribuir turnos equitativamente entre empleados</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="excluir">Empleados a Excluir (opcional)</label>
                  <input
                    id="excluir"
                    type="text"
                    placeholder="IDs separados por comas: 1, 2, 3"
                    value={asignacionForm.empleadosExcluir}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, empleadosExcluir: e.target.value })}
                  />
                  <p className="help-text">Ingresa los IDs de empleados que no deseas asignar</p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="button-primary" 
                type="submit"
                disabled={asignando}
              >
                {asignando ? '⏳ Asignando...' : '👥 Asignar Empleados'}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setShowAsignacion(false)
                  setAsignacionForm({
                    malla_id: '',
                    considerarEspecialidades: true,
                    respetarDisponibilidades: true,
                    equilibrarCarga: true,
                    empleadosExcluir: '',
                  })
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORMULARIO MANUAL */}
      {showForm && (
        <form className="malla-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la malla</label>
            <input
              id="nombre"
              type="text"
              required
              placeholder="Ej: Malla Septiembre 2026"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_inicio">Fecha de inicio</label>
              <input
                id="fecha_inicio"
                type="date"
                required
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin">Fecha de fin</label>
              <input
                id="fecha_fin"
                type="date"
                required
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              placeholder="Detalles sobre esta malla..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button className="button-primary" type="submit">
              Crear malla manualmente
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={() => {
                setShowForm(false)
                setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mallas-list">
        {loading ? (
          <p className="loading-message">Cargando mallas…</p>
        ) : mallas.length === 0 ? (
          <div className="empty-state">
            <p>📋 No hay mallas generadas. Crea una para comenzar.</p>
            <p className="hint">Usa la opción "Generar Automático" para crear mallas basadas en plantillas.</p>
          </div>
        ) : (
          <div className="mallas-grid">
            {mallas.map((malla) => (
              <div key={malla.id} className="malla-item">
                <div className="malla-header">
                  <h3>{malla.nombre}</h3>
                  <span className="status-badge">
                    {malla.activo ? '✓ Activa' : '○ Inactiva'}
                  </span>
                </div>
                <div className="malla-info">
                  <p>
                    <span className="info-label">Publicación:</span>
                    {malla.publicada ? '📢 Publicada' : '🔒 Borrador (no visible para empleados)'}
                  </p>
                  <p>
                    <span className="info-label">Empleados:</span>
                    {malla.cantidad_empleados}
                  </p>
                  <p>
                    <span className="info-label">Período:</span>
                    {malla.fecha_inicio ? new Intl.DateTimeFormat('es-CO').format(new Date(malla.fecha_inicio)) : 'N/A'} 
                    {' - '}
                    {malla.fecha_fin ? new Intl.DateTimeFormat('es-CO').format(new Date(malla.fecha_fin)) : 'N/A'}
                  </p>
                  <p>
                    <span className="info-label">Instancias:</span>
                    {malla.total_instancias || 0} turnos
                  </p>
                  <p>
                    <span className="info-label">Distribución:</span>
                    {malla.tipo_distribucion === 'equilibrada' ? '⚖️ Equilibrada' : '⚙️ Personalizada'}
                  </p>
                </div>

                <div className="malla-actions">
                  <button
                    className="action-btn view"
                    onClick={() => abrirDetalles(malla.id)}
                    title="Ver detalles"
                  >
                    👁️ Detalles
                  </button>
                  <button
                    className="action-btn publish"
                    onClick={() => handlePublish(malla.id, malla.publicada)}
                    title={malla.publicada ? 'Despublicar malla' : 'Publicar malla para empleados'}
                  >
                    {malla.publicada ? '📢 Despublicar' : '📤 Publicar'}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(malla.id)}
                    title="Eliminar calendario generado (la configuración base no se borra)"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES */}
      {showModal && (
        <div className="detail-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>Detalles de Malla</h2>
              <button className="detail-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {modalLoading ? (
              <div className="detail-modal-body">
                <p>Cargando detalles...</p>
              </div>
            ) : modalData ? (
              <div className="detail-modal-body">
                <div className="detail-modal-section">
                  <h3>Configuración</h3>
                  <div className="detail-modal-grid">
                    <div className="detail-modal-item">
                      <label>Nombre:</label>
                      <p>{modalData.configuracion?.nombre}</p>
                    </div>
                    <div className="detail-modal-item">
                      <label>Empresa:</label>
                      <p>{modalData.configuracion?.empresa_nombre}</p>
                    </div>
                    <div className="detail-modal-item">
                      <label>Empleados:</label>
                      <p>{modalData.configuracion?.cantidad_empleados}</p>
                    </div>
                    <div className="detail-modal-item">
                      <label>Horas/Semana:</label>
                      <p>{modalData.configuracion?.horas_por_semana}h</p>
                    </div>
                    <div className="detail-modal-item">
                      <label>Horas/Mes:</label>
                      <p>{modalData.configuracion?.horas_por_mes}h</p>
                    </div>
                    <div className="detail-modal-item">
                      <label>Distribución:</label>
                      <p>{modalData.configuracion?.tipo_distribucion === 'equilibrada' ? '⚖️ Equilibrada' : '⚙️ Personalizada'}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-modal-section">
                  <h3>Turnos Vinculados ({modalData.turnos?.length || 0})</h3>
                  {modalData.turnos?.length > 0 ? (
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
                        {modalData.turnos.map((turno) => (
                          <tr key={turno.id}>
                            <td>{turno.nombre}</td>
                            <td>{turno.hora_inicio}</td>
                            <td>{turno.hora_fin}</td>
                            <td>{turno.duracion_horas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="detail-empty-text">No hay turnos vinculados</p>
                  )}
                </div>

                <div className="detail-modal-section">
                  <h3>Malla de Turnos por Empleado ({modalData.asignaciones?.total || 0})</h3>
                  {modalData.asignaciones?.datos?.length > 0 ? (
                    <div className="detail-calendar-container">
                      {(() => {
                        // Normaliza una fecha (puede venir como Date, string ISO o 'YYYY-MM-DD HH:mm:ss') a 'YYYY-MM-DD'
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

                        // Agrupar asignaciones por empleado
                        const porEmpleado = {};
                        const todasLasFechas = new Set();
                        
                        modalData.asignaciones.datos.forEach((asig) => {
                          const fechaNormalizada = normalizarFecha(asig.fecha)
                          if (!fechaNormalizada) return
                          if (!porEmpleado[asig.empleado_id]) {
                            porEmpleado[asig.empleado_id] = {
                              nombre: asig.empleado_nombre,
                              asignaciones: {}
                            };
                          }
                          porEmpleado[asig.empleado_id].asignaciones[fechaNormalizada] = {
                            turno: asig.turno_nombre,
                            duracion: asig.duracion_horas
                          };
                          todasLasFechas.add(fechaNormalizada);
                        });

                        const fechasOrdenadas = Array.from(todasLasFechas).sort();
                        const empleadosOrdenados = Object.values(porEmpleado);

                        return (
                          <table className="detail-roster-table">
                            <thead>
                              <tr>
                                <th className="detail-employee-col">Empleado</th>
                                {fechasOrdenadas.slice(0, 31).map((fecha) => (
                                  <th key={fecha} className="detail-date-col" title={fecha}>
                                    {new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${fecha}T00:00:00Z`))}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {empleadosOrdenados.map((emp, idx) => (
                                <tr key={idx}>
                                  <td className="detail-employee-name">{emp.nombre}</td>
                                  {fechasOrdenadas.slice(0, 31).map((fecha) => {
                                    const asig = emp.asignaciones[fecha];
                                    const abreviatura = asig
                                      ? `${asig.duracion}${asig.turno.includes('Noche') || asig.turno.includes('noche') ? 'N' : 'D'}`
                                      : 'DES';
                                    const clase = asig ? 'detail-assigned' : 'detail-rest';
                                    
                                    return (
                                      <td 
                                        key={`${idx}-${fecha}`} 
                                        className={`detail-roster-cell ${clase}`}
                                        title={asig ? asig.turno : 'Descanso'}
                                      >
                                        {abreviatura}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="detail-empty-text">No hay asignaciones generadas</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="detail-modal-body">
                <p>Error al cargar detalles</p>
              </div>
            )}

            <div className="detail-modal-footer">
              <button className="detail-btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
