import { useEffect, useState } from 'react'
import './MallasTurnos.css'

export default function MallasTurnos() {
  const [mallas, setMallas] = useState([])
  const [configuraciones, setConfiguraciones] = useState([])
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
    fecha_inicio: '',
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

  const token = localStorage.getItem('token')
  const empresaId = localStorage.getItem('empresaId')

  useEffect(() => {
    loadMallas()
    loadConfiguraciones()
  }, [])

  async function loadMallas() {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/planificador/mallas?empresa_id=${empresaId}`, {
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
      const response = await fetch(`http://localhost:3001/api/configuraciones-malla?empresa_id=${empresaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfiguraciones(data.configuraciones || [])
      }
    } catch (err) {
      console.error('Error cargando configuraciones:', err)
    }
  }

  async function handleGenerarMalla(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!generadorForm.configuracion_id || !generadorForm.fecha_inicio || !generadorForm.cantidad_semanas) {
      setError('Configuración, fecha de inicio y cantidad de semanas son obligatorios')
      return
    }

    try {
      setGenerando(true)
      const response = await fetch('http://localhost:3001/api/planificador/generar-malla', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa_id: Number(empresaId),
          configuracion_id: Number(generadorForm.configuracion_id),
          fecha_inicio: generadorForm.fecha_inicio,
          cantidad_semanas: Number(generadorForm.cantidad_semanas),
          tipo_distribucion: generadorForm.tipo_distribucion,
          pautas_seleccionadas: generadorForm.pautas_seleccionadas.length > 0 
            ? generadorForm.pautas_seleccionadas.map(Number)
            : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar malla')
      }

      const data = await response.json()
      setSuccess(`✓ Malla generada exitosamente con ${data.datos.totalInstancias} instancias de turnos`)
      setShowGenerador(false)
      setGeneradorForm({
        configuracion_id: '',
        fecha_inicio: '',
        cantidad_semanas: 4,
        tipo_distribucion: 'equilibrada',
        pautas_seleccionadas: [],
      })
      
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

  function handleDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta malla?')) {
      setMallas(mallas.filter((m) => m.id !== id))
      setSuccess('Malla eliminada')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  function handlePublish(id) {
    setMallas(
      mallas.map((m) =>
        m.id === id ? { ...m, estado: m.estado === 'publicada' ? 'borrador' : 'publicada' } : m
      )
    )
    setSuccess('Estado de malla actualizado')
    setTimeout(() => setSuccess(''), 3000)
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
      const response = await fetch('http://localhost:3001/api/planificador/asignar-automaticamente', {
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
                  onChange={(e) => setGeneradorForm({ ...generadorForm, configuracion_id: e.target.value })}
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
                <label htmlFor="fecha_gen">Fecha de Inicio *</label>
                <input
                  id="fecha_gen"
                  type="date"
                  required
                  value={generadorForm.fecha_inicio}
                  onChange={(e) => setGeneradorForm({ ...generadorForm, fecha_inicio: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="semanas">Cantidad de Semanas *</label>
                <input
                  id="semanas"
                  type="number"
                  min="1"
                  max="52"
                  required
                  value={generadorForm.cantidad_semanas}
                  onChange={(e) => setGeneradorForm({ ...generadorForm, cantidad_semanas: Number(e.target.value) })}
                />
              </div>

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
                disabled={generando}
              >
                {generando ? '⏳ Generando...' : '🚀 Generar Malla'}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setShowGenerador(false)
                  setGeneradorForm({
                    configuracion_id: '',
                    fecha_inicio: '',
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
                    title="Ver detalles"
                  >
                    👁️ Detalles
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(malla.id)}
                    title="Eliminar malla"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
