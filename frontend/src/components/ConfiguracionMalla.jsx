import React, { useState, useEffect } from 'react';
import './ConfiguracionMalla.css';

/**
 * COMPONENTE: ConfiguracionMalla
 * ==============================
 * Interfaz para que los Administradores de Empresa configuren mallas de turnos.
 * 
 * Funcionalidades:
 *   - Listar todas las configuraciones existentes
 *   - Crear nueva configuración con turno(s)
 *   - Editar configuración existente
 *   - Eliminar configuración
 * 
 * Una malla de turnos define:
 *   - Cantidad de empleados
 *   - Horas legales por semana/mes
 *   - Qué plantillas de turno forman parte de ella
 *   - Orden y duración de cada turno
 * 
 * Roles autorizados: Admin Empresa (2), Super Admin (1)
 * 
 * Props:
 *   isEmbedded (boolean): Si es true, oculta el header y usa estilos simplificados
 *                        Usado cuando está integrado dentro de otra sección
 */
export default function ConfiguracionMalla({ isEmbedded = false }) {
  // Información del usuario y autenticación
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  // Estado: Lista de configuraciones
  const [configuraciones, setConfiguraciones] = useState([]);
  
  // Estado: Control de UI
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showGenerador, setShowGenerador] = useState(false);
  const [configSeleccionada, setConfigSeleccionada] = useState(null);
  
  // Estado: Mensajes
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado: Catálogos
  const [plantillas, setPlantillas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [pautasSeleccionadas, setPautasSeleccionadas] = useState([]);
  
  // Estado: Formulario
  const [form, setForm] = useState({
    nombre: '',                      // Nombre descriptivo de la malla
    cantidad_empleados: '',          // Empleados a cubrir
    horas_por_semana: '42',          // Horas legales semanales (Colombia)
    horas_por_mes: '182',            // Horas legales mensuales (Colombia)
    dias_laborales_por_semana: '5',  // Días laborales por semana
    turnos_mensuales_empleado: '',   // Turnos que hace cada empleado al mes
    tipo_distribucion: 'equilibrada', // equilibrada|personalizada
    descripcion: '',                 // Descripción de la configuración
    turnos: []                       // Array de turnos asignados
  });

  // Estado: Formulario de generación
  const [formGenerador, setFormGenerador] = useState({
    fechaInicio: '',                 // Fecha de inicio YYYY-MM-DD
    cantidadSemanas: '4',            // Semanas a generar
    tipoDistribucion: 'equilibrada'  // Tipo de distribución
  });

  // Estado: Resultado de generación
  const [resultadoGeneracion, setResultadoGeneracion] = useState(null);

  /**
   * Cargar configuraciones, plantillas y modalidades al montar el componente
   */
  useEffect(() => {
    fetchConfiguraciones();
    fetchPlantillas();
    fetchModalidades();
  }, []);

  /**
   * Obtiene las configuraciones de malla de la empresa actual
   */
  async function fetchConfiguraciones() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/configuraciones-malla?empresa_id=${user.empresa_id || user.Id_usuario}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setConfiguraciones(data.configuraciones || []);
      setError('');
    } catch (err) {
      setError('Error al cargar configuraciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlantillas() {
    try {
      const response = await fetch(
        `/api/plantillas-turno?empresa_id=${user.empresa_id || user.Id_usuario}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setPlantillas(data.plantillas || []);
    } catch (err) {
      console.error('Error al cargar plantillas:', err);
    }
  }

  async function fetchModalidades() {
    try {
      const response = await fetch(
        `/api/plantillas-turno?empresa_id=${user.empresa_id || user.Id_usuario}&tipo=FIJO`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      // Filtrar solo modalidades activas y FIJO
      const pautasBase = (data.plantillas || []).filter(p => p.activo && p.tipo === 'FIJO');
      setModalidades(pautasBase);
      // Por defecto, seleccionar todas
      setPautasSeleccionadas(pautasBase.map(p => p.id_plantilla));
    } catch (err) {
      console.error('Error al cargar modalidades:', err);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function agregarTurno() {
    setForm({
      ...form,
      turnos: [...form.turnos, { plantilla_id: '', orden: form.turnos.length + 1, duracion_horas: '' }]
    });
  }

  function actualizarTurno(index, field, value) {
    const nuevosTurnos = [...form.turnos];
    nuevosTurnos[index] = { ...nuevosTurnos[index], [field]: value };
    setForm({ ...form, turnos: nuevosTurnos });
  }

  function eliminarTurno(index) {
    setForm({
      ...form,
      turnos: form.turnos.filter((_, i) => i !== index)
    });
  }

  function togglePautaSeleccionada(idPlantilla) {
    if (pautasSeleccionadas.includes(idPlantilla)) {
      setPautasSeleccionadas(pautasSeleccionadas.filter(id => id !== idPlantilla));
    } else {
      setPautasSeleccionadas([...pautasSeleccionadas, idPlantilla]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.nombre || !form.cantidad_empleados || !form.turnos_mensuales_empleado) {
      setError('Faltan campos requeridos');
      return;
    }

    if (form.turnos.length === 0) {
      setError('Debe agregar al menos un turno');
      return;
    }

    try {
      const url = editingId
        ? `/api/configuraciones-malla/${editingId}`
        : '/api/configuraciones-malla';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          empresa_id: user.empresa_id || user.Id_usuario,
          ...form
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al guardar configuración');
      }

      setSuccess(editingId ? 'Configuración actualizada' : 'Configuración creada');
      setForm({
        nombre: '',
        cantidad_empleados: '',
        horas_por_semana: '42',
        horas_por_mes: '182',
        dias_laborales_por_semana: '5',
        turnos_mensuales_empleado: '',
        tipo_distribucion: 'equilibrada',
        descripcion: '',
        turnos: []
      });
      setEditingId(null);
      setShowForm(false);
      fetchConfiguraciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar');
      console.error(err);
    }
  }

  async function handleEdit(config) {
    try {
      const response = await fetch(`/api/configuraciones-malla/${config.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setForm({
        nombre: data.nombre,
        cantidad_empleados: data.cantidad_empleados,
        horas_por_semana: data.horas_por_semana,
        horas_por_mes: data.horas_por_mes,
        dias_laborales_por_semana: data.dias_laborales_por_semana,
        turnos_mensuales_empleado: data.turnos_mensuales_empleado,
        tipo_distribucion: data.tipo_distribucion,
        descripcion: data.descripcion,
        turnos: data.turnos.map(t => ({
          plantilla_id: t.plantilla_id,
          orden: t.orden,
          duracion_horas: t.duracion_horas
        }))
      });
      setEditingId(data.id);
      setShowForm(true);
      setError('');
    } catch (err) {
      setError('Error al cargar configuración');
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta configuración?')) return;

    try {
      const response = await fetch(`/api/configuraciones-malla/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setSuccess('Configuración eliminada');
      fetchConfiguraciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  /**
   * Abre el modal de generación automática para una configuración
   */
  function abrirGenerador(config) {
    setConfigSeleccionada(config);
    setFormGenerador({
      fechaInicio: new Date().toISOString().split('T')[0],
      cantidadSemanas: '4',
      tipoDistribucion: 'equilibrada'
    });
    setResultadoGeneracion(null);
    setShowGenerador(true);
  }

  /**
   * Ejecuta la generación automática de malla
   */
  async function ejecutarGeneracion(e) {
    e.preventDefault();

    if (!configSeleccionada) {
      setError('No hay configuración seleccionada');
      return;
    }

    if (pautasSeleccionadas.length === 0) {
      setError('Debes seleccionar al menos una pauta base');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/configuraciones-malla/${configSeleccionada.id}/generar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formGenerador,
            pautasSeleccionadas: pautasSeleccionadas
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error en la generación');
      }

      const resultado = await response.json();
      setResultadoGeneracion(resultado);
      setSuccess(`✅ Se generaron ${resultado.totalInstancias} instancias de turno`);

      // Recargar después de 2 segundos
      setTimeout(() => {
        fetchConfiguraciones();
        setShowGenerador(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleGeneradorChange(e) {
    const { name, value } = e.target;
    setFormGenerador({ ...formGenerador, [name]: value });
  }

  return (
    <div className="configuracion-malla">
      <div className="cm-header">
        <h2>⚙️ Configuración de Mallas</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              nombre: '',
              cantidad_empleados: '',
              horas_por_semana: '42',
              horas_por_mes: '182',
              dias_laborales_por_semana: '5',
              turnos_mensuales_empleado: '',
              tipo_distribucion: 'equilibrada',
              descripcion: '',
              turnos: []
            });
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Configuración'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form className="cm-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>{editingId ? '✏️ Editar Configuración' : '➕ Nueva Configuración'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre de Configuración *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Malla Centro Bogotá"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cantidad de Empleados *</label>
                <input
                  type="number"
                  name="cantidad_empleados"
                  value={form.cantidad_empleados}
                  onChange={handleInputChange}
                  placeholder="Ej: 150"
                  required
                />
              </div>

              <div className="form-group">
                <label>Turnos Mensuales por Empleado *</label>
                <input
                  type="number"
                  name="turnos_mensuales_empleado"
                  value={form.turnos_mensuales_empleado}
                  onChange={handleInputChange}
                  placeholder="Ej: 20"
                  min="1"
                  max="31"
                  required
                />
              </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Horas por Semana</label>
                <input
                  type="number"
                  name="horas_por_semana"
                  value={form.horas_por_semana}
                  onChange={handleInputChange}
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Horas por Mes</label>
                <input
                  type="number"
                  name="horas_por_mes"
                  value={form.horas_por_mes}
                  onChange={handleInputChange}
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Días Laborales por Semana</label>
                <input
                  type="number"
                  name="dias_laborales_por_semana"
                  value={form.dias_laborales_por_semana}
                  onChange={handleInputChange}
                  min="1"
                  max="7"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Distribución</label>
              <select name="tipo_distribucion" value={form.tipo_distribucion} onChange={handleInputChange}>
                <option value="equilibrada">Equilibrada (automática)</option>
                <option value="personalizada">Personalizada (manual)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleInputChange}
                placeholder="Notas sobre esta configuración..."
                rows="3"
              />
            </div>

            <div className="turnos-section">
              <h4>Turnos a usar en esta Malla *</h4>
              
              {form.turnos.length === 0 ? (
                <p className="info-text">No hay turnos agregados. Haz clic en "Agregar Turno".</p>
              ) : (
                <div className="turnos-list">
                  {form.turnos.map((turno, idx) => (
                    <div key={idx} className="turno-item">
                      <div className="turno-fields">
                        <div className="field">
                          <label>Turno:</label>
                          <select 
                            value={turno.plantilla_id} 
                            onChange={(e) => actualizarTurno(idx, 'plantilla_id', e.target.value)}
                            required
                          >
                            <option value="">Seleccionar plantilla</option>
                            {plantillas.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.nombre} ({p.hora_inicio} - {p.hora_fin})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field">
                          <label>Duración (horas):</label>
                          <input
                            type="number"
                            value={turno.duracion_horas}
                            onChange={(e) => actualizarTurno(idx, 'duracion_horas', e.target.value)}
                            step="0.5"
                            required
                          />
                        </div>

                        <div className="field">
                          <label>Orden:</label>
                          <input
                            type="number"
                            value={turno.orden}
                            onChange={(e) => actualizarTurno(idx, 'orden', e.target.value)}
                            min="1"
                          />
                        </div>

                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => eliminarTurno(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="button" className="btn-secondary" onClick={agregarTurno}>
                + Agregar Turno
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '💾 Actualizar' : '💾 Crear'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="cm-list">
        <h3>Configuraciones Existentes</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : configuraciones.length === 0 ? (
          <p className="info-text">No hay configuraciones creadas aún</p>
        ) : (
          <div className="configuraciones-grid">
            {configuraciones.map(config => (
              <div key={config.id} className="config-card">
                <div className="config-header">
                  <h4>{config.nombre}</h4>
                  <div className="config-badge">{config.turnos_mensuales_empleado} turnos/mes</div>
                </div>
                
                <div className="config-info">
                  <p><strong>Empleados:</strong> {config.cantidad_empleados}</p>
                <p><strong>Turnos Mensuales:</strong> {config.turnos_mensuales_empleado}</p>
                  <p><strong>Horas/Semana:</strong> {config.horas_por_semana}h</p>
                  <p><strong>Horas/Mes:</strong> {config.horas_por_mes}h</p>
                  <p><strong>Días laborales:</strong> {config.dias_laborales_por_semana}</p>
                </div>

                <div className="config-actions">
                  <button 
                    className="action-btn generate"
                    onClick={() => abrirGenerador(config)}
                  >
                    🎯 Generar
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(config)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(config.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                <small className="config-date">
                  {new Date(config.creado_en).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Generador Automático de Mallas */}
      {showGenerador && (
        <div className="modal-overlay" onClick={() => setShowGenerador(false)}>
          <div className="modal-content generador-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎯 Generador Automático de Mallas</h3>
              <button 
                className="modal-close"
                onClick={() => setShowGenerador(false)}
              >
                ✕
              </button>
            </div>

            {resultadoGeneracion ? (
              // Mostrar resultado exitoso
              <div className="resultado-generacion">
                <div className="success-box">
                  <h4>✅ Generación Exitosa</h4>
                  <p className="info-text">
                    Se generaron <strong>{resultadoGeneracion.totalInstancias}</strong> instancias de turno
                  </p>
                  
                  <div className="resultado-detalles">
                    <div className="detalle-item">
                      <span>Periodo:</span>
                      <strong>
                        {resultadoGeneracion.periodo.fechaInicio} → {resultadoGeneracion.periodo.fechaFin}
                      </strong>
                    </div>
                    <div className="detalle-item">
                      <span>Semanas:</span>
                      <strong>{resultadoGeneracion.periodo.cantidadSemanas}</strong>
                    </div>
                    <div className="detalle-item">
                      <span>Empleados cubiertos:</span>
                      <strong>{resultadoGeneracion.resumenLegal.totalEmpleados}</strong>
                    </div>
                  </div>

                  <div className="validacion-legal">
                    <h5>✓ Validación Legal (Colombia)</h5>
                    <p>
                      {resultadoGeneracion.resumenLegal.esValido ? (
                        <span className="legal-ok">✓ Cumple con leyes laborales</span>
                      ) : (
                        <span className="legal-error">✗ Incumplimientos detectados</span>
                      )}
                    </p>
                    {resultadoGeneracion.resumenLegal.advertencias.length > 0 && (
                      <ul className="advertencias">
                        {resultadoGeneracion.resumenLegal.advertencias.map((adv, idx) => (
                          <li key={idx}>⚠️ {adv}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button 
                    className="btn-primary"
                    onClick={() => setShowGenerador(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              // Mostrar formulario de generación
              <form onSubmit={ejecutarGeneracion} className="generador-form">
                
                {/* Sección: Pautas Base - Modalidades disponibles */}
                <div className="form-section">
                  <h4>📋 Pautas Base - Modalidades Disponibles</h4>
                  <p className="section-desc">Selecciona qué modalidades de turno usar como base para la generación automática:</p>
                  
                  {modalidades.length > 0 ? (
                    <div className="pautas-grid">
                      {modalidades.map((modalidad) => (
                        <div key={modalidad.id_plantilla} className="pauta-checkbox">
                          <input 
                            type="checkbox"
                            id={`pauta-${modalidad.id_plantilla}`}
                            checked={pautasSeleccionadas.includes(modalidad.id_plantilla)}
                            onChange={() => togglePautaSeleccionada(modalidad.id_plantilla)}
                          />
                          <label htmlFor={`pauta-${modalidad.id_plantilla}`}>
                            <div className="pauta-name">{modalidad.nombre_plantilla}</div>
                            {modalidad.descripcion && (
                              <div className="pauta-desc">{modalidad.descripcion}</div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>⚠️ No hay modalidades configuradas. Contacta al Administrador.</p>
                    </div>
                  )}

                  {pautasSeleccionadas.length > 0 && (
                    <div className="pautas-selected">
                      <strong>Seleccionadas:</strong> {pautasSeleccionadas.length} de {modalidades.length}
                    </div>
                  )}
                </div>

                <hr className="form-divider" />

                {/* Sección: Parámetros de Generación */}
                <div className="form-section">
                  <h4>⚙️ Parámetros de Generación</h4>
                </div>

                <div className="form-group">
                  <label>Configuración Seleccionada</label>
                  <input 
                    type="text" 
                    value={configSeleccionada?.nombre || ''}
                    disabled 
                    className="input-disabled"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Inicio *</label>
                    <input 
                      type="date" 
                      name="fechaInicio"
                      value={formGenerador.fechaInicio}
                      onChange={handleGeneradorChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Semanas a Generar *</label>
                    <input 
                      type="number" 
                      name="cantidadSemanas"
                      value={formGenerador.cantidadSemanas}
                      onChange={handleGeneradorChange}
                      min="1"
                      max="52"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tipo de Distribución</label>
                  <select 
                    name="tipoDistribucion"
                    value={formGenerador.tipoDistribucion}
                    onChange={handleGeneradorChange}
                  >
                    <option value="equilibrada">Equilibrada (automática)</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>

                <div className="form-info">
                  <p>ℹ️ Se generará un calendario automático respetando:</p>
                  <ul>
                    <li>✓ 42 horas de trabajo por semana (Colombia)</li>
                    <li>✓ 182 horas mensuales (Colombia)</li>
                    <li>✓ Rotación equitativa entre empleados</li>
                    <li>✓ Descansos regulares según ley</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Generando...' : '🎯 Generar Malla'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowGenerador(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
