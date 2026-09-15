import { useState, useEffect } from 'react'

export default function ConfiguracionGlobal() {
  const [configuracion, setConfiguracion] = useState({
    nombreSistema: 'SGTurnos Empresariales',
    version: '1.0.0',
    maxEmpresas: 999,
    maxUsuariosPorEmpresa: 500,
    diasRetencionLogs: 90,
    emailNotificaciones: 'admin@sgturnos.com',
    mantenimientoModo: false
  })

  const [roles, setRoles] = useState([
    {
      id: 1,
      nombre: 'Super Administrador',
      descripcion: 'Acceso total al sistema',
      permisos: 'Todo',
      color: '#f472b6'
    },
    {
      id: 2,
      nombre: 'Admin Empresa',
      descripcion: 'Administración de su empresa',
      permisos: 'Gestión de la empresa',
      color: '#93c5fd'
    },
    {
      id: 3,
      nombre: 'Planificador',
      descripcion: 'Planificar y gestionar turnos',
      permisos: 'Crear y modificar turnos',
      color: '#d8b4fe'
    },
    {
      id: 4,
      nombre: 'Supervisor',
      descripcion: 'Supervisar operaciones',
      permisos: 'Monitorear y reportar',
      color: '#86efac'
    },
    {
      id: 5,
      nombre: 'Empleado',
      descripcion: 'Visualizar sus turnos',
      permisos: 'Lectura de turnos',
      color: '#7ee8f7'
    }
  ])

  const [editandoConfig, setEditandoConfig] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfiguracion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name.includes('max') || name.includes('dias') ? parseInt(value) : value)
    }))
  }

  const handleGuardarConfig = () => {
    setEditandoConfig(false)
    setMensaje('✅ Configuración actualizada correctamente')
    setTimeout(() => setMensaje(''), 3000)
  }

  return (
    <div className="configuracion-global-panel">
      <div className="panel-header">
        <h2>⚙️ Configuración Global</h2>
        <p className="subtitle">Parámetros y configuración del sistema</p>
      </div>

      {mensaje && (
        <div className="success-message">{mensaje}</div>
      )}

      <div className="configuracion-section">
        <div className="seccion-header">
          <h3>🔧 Configuración del Sistema</h3>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setEditandoConfig(!editandoConfig)}
          >
            {editandoConfig ? '✕ Cancelar' : '✏️ Editar'}
          </button>
        </div>

        {editandoConfig ? (
          <div className="config-form">
            <div className="form-group">
              <label>
                Nombre del Sistema
                <input
                  type="text"
                  name="nombreSistema"
                  value={configuracion.nombreSistema}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Versión
                <input
                  type="text"
                  name="version"
                  value={configuracion.version}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Máximo de Empresas
                <input
                  type="number"
                  name="maxEmpresas"
                  value={configuracion.maxEmpresas}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Máximo de Usuarios por Empresa
                <input
                  type="number"
                  name="maxUsuariosPorEmpresa"
                  value={configuracion.maxUsuariosPorEmpresa}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Días de Retención de Logs
                <input
                  type="number"
                  name="diasRetencionLogs"
                  value={configuracion.diasRetencionLogs}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Email de Notificaciones
                <input
                  type="email"
                  name="emailNotificaciones"
                  value={configuracion.emailNotificaciones}
                  onChange={handleConfigChange}
                />
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="mantenimientoModo"
                  checked={configuracion.mantenimientoModo}
                  onChange={handleConfigChange}
                />
                Modo Mantenimiento (Sistema en construcción)
              </label>
            </div>
            <button className="btn btn-success" onClick={handleGuardarConfig}>
              💾 Guardar Cambios
            </button>
          </div>
        ) : (
          <div className="config-display">
            <div className="config-item">
              <span className="config-label">Nombre:</span>
              <span className="config-value">{configuracion.nombreSistema}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Versión:</span>
              <span className="config-value">{configuracion.version}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Máx. Empresas:</span>
              <span className="config-value">{configuracion.maxEmpresas}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Máx. Usuarios/Empresa:</span>
              <span className="config-value">{configuracion.maxUsuariosPorEmpresa}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Retención de Logs:</span>
              <span className="config-value">{configuracion.diasRetencionLogs} días</span>
            </div>
            <div className="config-item">
              <span className="config-label">Email Notificaciones:</span>
              <span className="config-value">{configuracion.emailNotificaciones}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Modo Mantenimiento:</span>
              <span className={`config-value ${configuracion.mantenimientoModo ? 'activo' : 'inactivo'}`}>
                {configuracion.mantenimientoModo ? 'ACTIVADO' : 'Desactivado'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="roles-section">
        <div className="seccion-header">
          <h3>👥 Roles y Permisos</h3>
        </div>
        <div className="roles-grid">
          {roles.map(rol => (
            <div key={rol.id} className="rol-card">
              <div className="rol-header" style={{ borderTopColor: rol.color }}>
                <h4>{rol.nombre}</h4>
              </div>
              <div className="rol-body">
                <p className="rol-descripcion">{rol.descripcion}</p>
                <div className="rol-permisos">
                  <span className="label">Permisos:</span>
                  <p>{rol.permisos}</p>
                </div>
                <div className="rol-color">
                  <span className="label">Color:</span>
                  <div className="color-box" style={{ backgroundColor: rol.color }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sistema-info">
        <div className="seccion-header">
          <h3>📊 Estadísticas de Límites</h3>
        </div>
        <div className="limites-grid">
          <div className="limite-item">
            <span className="limite-label">Empresas Registradas / Límite</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="limite-valor">12 / 999</span>
          </div>
          <div className="limite-item">
            <span className="limite-label">Usuarios Activos / Límite</span>
            <div className="progress-bar">
              <span className="limite-valor">156 / 5,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
