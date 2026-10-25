import { useState, useEffect } from 'react';
import './ModalidadesTurnos.css';
// v2024-09-22-fix-cache

const FORM_MALLA_INICIAL = {
  nombre: '', cantidad_empleados: '', horas_por_semana: '42', horas_por_mes: '182',
  dias_laborales_por_semana: '6', turnos_mensuales_empleado: '26', tipo_distribucion: 'equilibrada',
  descripcion: '', turnos: []
};

export default function ModalidadesTurnos() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const empresaId = user.empresa_id || user.Id_usuario;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalidades, setModalidades] = useState([]);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [showFormModalidad, setShowFormModalidad] = useState(false);
  const [editingModalidad, setEditingModalidad] = useState(null);
  const [showFormMalla, setShowFormMalla] = useState(false);
  const [editingMalla, setEditingMalla] = useState(null);

  const [formModalidad, setFormModalidad] = useState({
    nombre: '', descripcion: '', hora_inicio: '08:00', hora_fin: '16:00', activo: true
  });

  const [formMalla, setFormMalla] = useState({ ...FORM_MALLA_INICIAL });

  useEffect(() => {
    fetch(`/api/plantillas-turno?empresa_id=${empresaId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setModalidades(d.plantillas || []));

    fetch(`/api/configuraciones-malla?empresa_id=${empresaId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setConfiguraciones(d.configuraciones || []));
  }, [empresaId, token]);

  const guardarModalidad = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formModalidad.nombre || !formModalidad.hora_inicio || !formModalidad.hora_fin) {
      setError('Nombre y horarios son requeridos');
      return;
    }
    try {
      setLoading(true);
      const method = editingModalidad ? 'PUT' : 'POST';
      const url = editingModalidad ? `/api/plantillas-turno/${editingModalidad.id}` : '/api/plantillas-turno';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          empresa_id: empresaId,
          ...formModalidad,
          hora_inicio: `${formModalidad.hora_inicio}:00`,
          hora_fin: `${formModalidad.hora_fin}:00`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'No se pudo guardar la modalidad');
      const modalidadGuardada = data.plantilla;
      setModalidades(prev => editingModalidad
        ? prev.map(modalidad => modalidad.id === modalidadGuardada.id ? modalidadGuardada : modalidad)
        : [modalidadGuardada, ...prev]);
      setSuccess('Guardado exitosamente');
      setShowFormModalidad(false);
      setFormModalidad({ nombre: '', descripcion: '', hora_inicio: '08:00', hora_fin: '16:00', activo: true });
      setEditingModalidad(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarTurnoMalla = () => {
    setFormMalla(current => ({
      ...current,
      turnos: [...current.turnos, { plantilla_id: '', orden: current.turnos.length + 1, duracion_horas: '' }]
    }));
  };

  const actualizarTurnoMalla = (index, field, value) => {
    setFormMalla(current => ({
      ...current,
      turnos: current.turnos.map((turno, turnoIndex) => {
        if (turnoIndex !== index) return turno;
        if (field === 'plantilla_id') {
          const plantilla = modalidades.find(item => String(item.id) === value);
          const duracion = plantilla?.duracion_base || (Number(plantilla?.duracion_minutos) / 60);
          return { ...turno, plantilla_id: value, duracion_horas: duracion ? String(duracion) : turno.duracion_horas };
        }
        return { ...turno, [field]: value };
      })
    }));
  };

  const quitarTurnoMalla = (index) => {
    setFormMalla(current => ({ ...current, turnos: current.turnos.filter((_, turnoIndex) => turnoIndex !== index) }));
  };

  const eliminarModalidad = async (modalidad) => {
    if (!window.confirm(`¿Desactivar la modalidad "${modalidad.nombre}"? Dejará de estar disponible para nuevas mallas.`)) return;
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const res = await fetch(`/api/plantillas-turno/${modalidad.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar la modalidad');
      setModalidades(prev => prev.filter(m => m.id !== modalidad.id));
      setSuccess('Modalidad eliminada exitosamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarMalla = async (configuracion) => {
    if (!window.confirm(`¿Eliminar la configuración de malla "${configuracion.nombre}"? Esta acción no se puede deshacer desde aquí.`)) return;
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const res = await fetch(`/api/configuraciones-malla/${configuracion.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar la configuración');
      setConfiguraciones(prev => prev.filter(c => c.id !== configuracion.id));
      setSuccess('Configuración eliminada exitosamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editarMalla = async (configuracion) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/configuraciones-malla/${configuracion.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo cargar la configuración');
      setEditingMalla(configuracion);
      setFormMalla({
        ...FORM_MALLA_INICIAL,
        ...data,
        descripcion: data.descripcion || '',
        tipo_distribucion: data.tipo_distribucion || 'equilibrada',
        turnos: (data.turnos || []).map(turno => ({
          plantilla_id: String(turno.plantilla_id),
          orden: turno.orden,
          duracion_horas: String(turno.duracion_horas)
        }))
      });
      setShowFormMalla(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarMalla = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formMalla.nombre || !formMalla.cantidad_empleados || !formMalla.turnos_mensuales_empleado) {
      setError('Faltan campos requeridos');
      return;
    }
    if (formMalla.turnos.length === 0 || formMalla.turnos.some(turno => !turno.plantilla_id || !turno.duracion_horas)) {
      setError('Agrega al menos un turno activo y completa su duración para la configuración');
      return;
    }
    try {
      setLoading(true);
      const method = editingMalla ? 'PUT' : 'POST';
      const url = editingMalla ? `/api/configuraciones-malla/${editingMalla.id}` : '/api/configuraciones-malla';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          empresa_id: empresaId,
          ...formMalla,
          turnos: formMalla.turnos.map(turno => ({
            ...turno,
            plantilla_id: Number(turno.plantilla_id),
            orden: Number(turno.orden),
            duracion_horas: Number(turno.duracion_horas)
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la configuración');
      const configuracionGuardada = { ...data.configuracion, turnos: formMalla.turnos };
      setConfiguraciones(prev => editingMalla
        ? prev.map(configuracion => configuracion.id === configuracionGuardada.id ? configuracionGuardada : configuracion)
        : [configuracionGuardada, ...prev]);
      setSuccess('Guardado exitosamente');
      setShowFormMalla(false);
      setFormMalla({ ...FORM_MALLA_INICIAL });
      setEditingMalla(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalidades-container">
      <div className="mt-header">
        <h2>Modalidades de Turnos y Configuracion de Mallas</h2>
        <p>Administra los tipos de turnos disponibles y las configuraciones</p>
      </div>

      {error && <div className="mt-alert alert-error">{error}</div>}
      {success && <div className="mt-alert alert-success">{success}</div>}

      <div className="mt-section">
        <div className="section-title">
          <h3>Modalidades de Turnos</h3>
          {!showFormModalidad && (
            <button className="btn-add" onClick={() => setShowFormModalidad(true)}>+ Nueva Modalidad</button>
          )}
        </div>

        {showFormModalidad && (
          <form onSubmit={guardarModalidad} className="form-card">
            <h4>{editingModalidad ? 'Editar' : 'Nueva'} Modalidad</h4>
            <div className="form-grid">
              <input type="text" placeholder="Nombre" value={formModalidad.nombre} onChange={(e) => setFormModalidad({...formModalidad, nombre: e.target.value})} required />
              <input type="text" placeholder="Descripcion" value={formModalidad.descripcion} onChange={(e) => setFormModalidad({...formModalidad, descripcion: e.target.value})} />
              <input type="time" value={formModalidad.hora_inicio} onChange={(e) => setFormModalidad({...formModalidad, hora_inicio: e.target.value})} />
              <input type="time" value={formModalidad.hora_fin} onChange={(e) => setFormModalidad({...formModalidad, hora_fin: e.target.value})} />
            </div>
            <label><input type="checkbox" checked={formModalidad.activo} onChange={(e) => setFormModalidad({...formModalidad, activo: e.target.checked})} /> Activo</label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => {setShowFormModalidad(false); setEditingModalidad(null);}}>Cancelar</button>
            </div>
          </form>
        )}

        <div className="mt-list">
          {modalidades.length === 0 ? (
            <p className="empty-state">No hay modalidades</p>
          ) : (
            modalidades.map(m => (
              <div key={m.id} className="mt-card">
                <div className="card-title">{m.nombre}</div>
                <div className={`card-badge ${m.activo ? 'active' : 'inactive'}`}>{m.activo ? 'Activo' : 'Inactivo'}</div>
                {m.descripcion && <div className="card-desc">{m.descripcion}</div>}
                <div className="card-body">
                  <div className="info-row"><span className="label">Horario:</span> <span className="value">{m.hora_inicio?.slice(0, 5)} - {m.hora_fin?.slice(0, 5)}</span></div>
                </div>
                <div className="card-actions">
                    <button className="btn-small edit" onClick={() => {
                      setEditingModalidad(m);
                      setFormModalidad({
                        ...m,
                        hora_inicio: m.hora_inicio?.slice(0, 5) || '',
                        hora_fin: m.hora_fin?.slice(0, 5) || '',
                        activo: Boolean(m.activo)
                      });
                      setShowFormModalidad(true);
                    }}>Editar</button>
                  <button className="btn-small delete" onClick={() => eliminarModalidad(m)} disabled={loading}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-section">
        <div className="section-title">
          <h3>Configuracion de Mallas</h3>
          {!showFormMalla && (
            <button className="btn-add" onClick={() => { setEditingMalla(null); setFormMalla({ ...FORM_MALLA_INICIAL }); setShowFormMalla(true); }}>+ Nueva Malla</button>
          )}
        </div>

        {showFormMalla && (
          <form onSubmit={guardarMalla} className="form-card">
            <h4>{editingMalla ? 'Editar' : 'Nueva'} Malla</h4>
            <div className="form-grid">
              <div className="input-group full">
                <label htmlFor="malla-nombre">Nombre de la Malla *</label>
                <input id="malla-nombre" type="text" placeholder="Ej: Malla sede principal" value={formMalla.nombre} onChange={(e) => setFormMalla({...formMalla, nombre: e.target.value})} required />
              </div>
              <div className="input-group full">
                <label htmlFor="malla-descripcion">Descripción</label>
                <textarea id="malla-descripcion" rows="3" placeholder="Describe esta configuración de malla" value={formMalla.descripcion} onChange={(e) => setFormMalla({...formMalla, descripcion: e.target.value})} />
              </div>
              <div className="input-group">
                <label htmlFor="malla-cantidad-empleados">Cantidad de Empleados *</label>
                <input id="malla-cantidad-empleados" type="number" placeholder="Ej: 150" value={formMalla.cantidad_empleados} onChange={(e) => setFormMalla({...formMalla, cantidad_empleados: e.target.value})} required />
              </div>
              <div className="input-group">
                <label htmlFor="malla-turnos-mensuales">Turnos Mensuales por Empleado *</label>
                <input id="malla-turnos-mensuales" type="number" placeholder="Ej: 20" value={formMalla.turnos_mensuales_empleado} onChange={(e) => setFormMalla({...formMalla, turnos_mensuales_empleado: e.target.value})} required />
              </div>
              <div className="input-group">
                <label htmlFor="malla-tipo-distribucion">Tipo de Distribución</label>
                <select id="malla-tipo-distribucion" value={formMalla.tipo_distribucion} onChange={(e) => setFormMalla({...formMalla, tipo_distribucion: e.target.value})}>
                  <option value="equilibrada">Equilibrada</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>
              <div className="input-group"><label>Horas/Semana</label><input type="number" value={formMalla.horas_por_semana} onChange={(e) => setFormMalla({...formMalla, horas_por_semana: e.target.value})} /></div>
              <div className="input-group"><label>Horas/Mes</label><input type="number" value={formMalla.horas_por_mes} onChange={(e) => setFormMalla({...formMalla, horas_por_mes: e.target.value})} /></div>
              <div className="input-group"><label>Días Laborales</label><input type="number" value={formMalla.dias_laborales_por_semana} onChange={(e) => setFormMalla({...formMalla, dias_laborales_por_semana: e.target.value})} /></div>
              <div className="input-group full malla-turnos-group">
                <label>Turnos incluidos en esta malla *</label>
                {modalidades.filter(modalidad => Number(modalidad.activo) === 1).length === 0 ? (
                  <p className="malla-turnos-empty">Primero crea al menos una modalidad activa para poder generar la malla.</p>
                ) : (
                  <>
                    {formMalla.turnos.map((turno, index) => (
                      <div className="malla-turno-row" key={`${turno.plantilla_id || 'nuevo'}-${index}`}>
                        <div className="malla-turno-fields">
                          <label>
                            Modalidad
                            <select
                              value={turno.plantilla_id}
                              onChange={(e) => actualizarTurnoMalla(index, 'plantilla_id', e.target.value)}
                              required
                            >
                              <option value="">Selecciona un turno</option>
                              {modalidades.filter(modalidad => Number(modalidad.activo) === 1).map(modalidad => (
                                <option key={modalidad.id} value={modalidad.id}>
                                  {modalidad.nombre} ({String(modalidad.hora_inicio).slice(0, 5)}–{String(modalidad.hora_fin).slice(0, 5)})
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Duración (horas)
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={turno.duracion_horas}
                              onChange={(e) => actualizarTurnoMalla(index, 'duracion_horas', e.target.value)}
                              required
                            />
                          </label>
                          <label>
                            Orden
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={turno.orden}
                              onChange={(e) => actualizarTurnoMalla(index, 'orden', e.target.value)}
                              required
                            />
                          </label>
                        </div>
                        <button type="button" className="btn-remove" onClick={() => quitarTurnoMalla(index)} aria-label="Quitar turno">Quitar</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary" onClick={agregarTurnoMalla}>+ Agregar turno</button>
                  </>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => {setShowFormMalla(false); setEditingMalla(null);}}>Cancelar</button>
            </div>
          </form>
        )}

        <div className="mt-list">
          {configuraciones.length === 0 ? (
            <p className="empty-state">No hay mallas</p>
          ) : (
            configuraciones.map(c => (
              <div key={c.id} className="mt-card">
                <div className="card-title">{c.nombre}</div>
                {c.descripcion && <div className="card-desc">{c.descripcion}</div>}
                <div className="card-body">
                  <div className="info-row"><span className="label">Empleados:</span> <span className="value">{c.cantidad_empleados}</span></div>
                  <div className="info-row"><span className="label">Turnos/Mes:</span> <span className="value">{c.turnos_mensuales_empleado}</span></div>
                  <div className="info-row"><span className="label">Hrs/Semana:</span> <span className="value">{c.horas_por_semana}</span></div>
                  <div className="info-row"><span className="label">Hrs/Mes:</span> <span className="value">{c.horas_por_mes}</span></div>
                  <div className="info-row"><span className="label">Días Laborales:</span> <span className="value">{c.dias_laborales_por_semana}</span></div>
                  <div className="info-row"><span className="label">Distribución:</span> <span className="value">{c.tipo_distribucion}</span></div>
                  <div className="info-row"><span className="label">{c.actualizado_por ? 'Actualizado por:' : 'Creado por:'}</span> <span className="value">{c.actualizado_por ? (c.actualizado_por_nombre || 'Usuario no disponible') : (c.creado_por_nombre || 'Usuario no disponible')}</span></div>
                </div>
                <div className="card-actions">
                  <button className="btn-small edit" onClick={() => editarMalla(c)} disabled={loading}>Editar</button>
                  <button className="btn-small delete" onClick={() => eliminarMalla(c)} disabled={loading}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
