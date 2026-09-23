import { useState, useEffect } from 'react';
import './ModalidadesTurnos.css';
// v2024-09-22-fix-cache

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

  const [formMalla, setFormMalla] = useState({
    nombre: '', cantidad_empleados: '', horas_por_semana: '42', horas_por_mes: '182',
    dias_laborales_por_semana: '5', turnos_mensuales_empleado: '', tipo_distribucion: 'equilibrada',
    descripcion: '', turnos: []
  });

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
        body: JSON.stringify({ empresa_id: empresaId, ...formModalidad })
      });
      if (!res.ok) throw new Error('Error');
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

  const guardarMalla = async (e) => {
    e.preventDefault();
    if (!formMalla.nombre || !formMalla.cantidad_empleados || !formMalla.turnos_mensuales_empleado) {
      setError('Faltan campos requeridos');
      return;
    }
    try {
      setLoading(true);
      const method = editingMalla ? 'PUT' : 'POST';
      const url = editingMalla ? `/api/configuraciones-malla/${editingMalla.id}` : '/api/configuraciones-malla';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ empresa_id: empresaId, ...formMalla })
      });
      if (!res.ok) throw new Error('Error');
      setSuccess('Guardado exitosamente');
      setShowFormMalla(false);
      setFormMalla({ nombre: '', cantidad_empleados: '', horas_por_semana: '42', horas_por_mes: '182', dias_laborales_por_semana: '5', turnos_mensuales_empleado: '', tipo_distribucion: 'equilibrada', descripcion: '', turnos: [] });
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
                  <div className="info-row"><span className="label">Horario:</span> <span className="value">{m.hora_inicio} - {m.hora_fin}</span></div>
                </div>
                <div className="card-actions">
                  <button className="btn-small edit" onClick={() => {setEditingModalidad(m); setFormModalidad(m); setShowFormModalidad(true);}}>Editar</button>
                  <button className="btn-small delete">Eliminar</button>
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
            <button className="btn-add" onClick={() => setShowFormMalla(true)}>+ Nueva Malla</button>
          )}
        </div>

        {showFormMalla && (
          <form onSubmit={guardarMalla} className="form-card">
            <h4>{editingMalla ? 'Editar' : 'Nueva'} Malla</h4>
            <div className="form-grid">
              <input type="text" placeholder="Nombre" value={formMalla.nombre} onChange={(e) => setFormMalla({...formMalla, nombre: e.target.value})} required className="full" />
              <input type="number" placeholder="Cantidad de Empleados" value={formMalla.cantidad_empleados} onChange={(e) => setFormMalla({...formMalla, cantidad_empleados: e.target.value})} required />
              <input type="number" placeholder="Turnos Mensuales por Empleado" value={formMalla.turnos_mensuales_empleado} onChange={(e) => setFormMalla({...formMalla, turnos_mensuales_empleado: e.target.value})} required />
              <div className="input-group"><label>Horas/Semana</label><input type="number" value={formMalla.horas_por_semana} onChange={(e) => setFormMalla({...formMalla, horas_por_semana: e.target.value})} /></div>
              <div className="input-group"><label>Horas/Mes</label><input type="number" value={formMalla.horas_por_mes} onChange={(e) => setFormMalla({...formMalla, horas_por_mes: e.target.value})} /></div>
              <div className="input-group"><label>Días Laborales</label><input type="number" value={formMalla.dias_laborales_por_semana} onChange={(e) => setFormMalla({...formMalla, dias_laborales_por_semana: e.target.value})} /></div>
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
                </div>
                <div className="card-actions">
                  <button className="btn-small edit" onClick={() => {setEditingMalla(c); setFormMalla(c); setShowFormMalla(true);}}>Editar</button>
                  <button className="btn-small delete">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
