import { useState, useEffect } from 'react'

export default function DashboardReportes() {
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasActivas: 0,
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalTurnos: 0,
    turnosHoy: 0
  })

  const [actividadReciente, setActividadReciente] = useState([])

  useEffect(() => {
    // Mock data
    setStats({
      totalEmpresas: 12,
      empresasActivas: 10,
      totalUsuarios: 156,
      usuariosActivos: 142,
      totalTurnos: 1240,
      turnosHoy: 87
    })

    setActividadReciente([
      { id: 1, tipo: 'Empresa Creada', descripcion: 'TechCorp Solutions', usuario: 'Sistema', fecha: '2026-09-15 10:30' },
      { id: 2, tipo: 'Usuario Agregado', descripcion: 'Miguel Camilo Ruiz - Admin Empresa', usuario: 'Super Admin', fecha: '2026-09-15 09:15' },
      { id: 3, tipo: 'Empresa Desactivada', descripcion: 'Empresa Antigua S.A.', usuario: 'Super Admin', fecha: '2026-09-14 16:45' },
      { id: 4, tipo: 'Rol Actualizado', descripcion: 'Supervisor en TechCorp', usuario: 'Admin Empresa', fecha: '2026-09-14 14:20' },
      { id: 5, tipo: 'Usuario Eliminado', descripcion: 'Empleado Temporal', usuario: 'Super Admin', fecha: '2026-09-13 11:30' }
    ])
  }, [])

  return (
    <div className="dashboard-reportes-panel">
      <div className="panel-header">
        <h2>📊 Dashboard de Reportes</h2>
        <p className="subtitle">Estadísticas generales del sistema</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalEmpresas}</p>
            <p className="stat-label">Empresas Registradas</p>
            <p className="stat-detail">{stats.empresasActivas} Activas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalUsuarios}</p>
            <p className="stat-label">Usuarios Totales</p>
            <p className="stat-detail">{stats.usuariosActivos} Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalTurnos}</p>
            <p className="stat-label">Turnos Programados</p>
            <p className="stat-detail">{stats.turnosHoy} Hoy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <p className="stat-value">{Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100)}%</p>
            <p className="stat-label">Tasa de Actividad</p>
            <p className="stat-detail">Usuarios en línea</p>
          </div>
        </div>
      </div>

      <div className="actividad-reciente">
        <div className="seccion-header">
          <h3>⏱️ Actividad Reciente</h3>
        </div>
        <div className="actividad-tabla">
          <div className="tabla-header">
            <div className="col-tipo">Tipo</div>
            <div className="col-descripcion">Descripción</div>
            <div className="col-usuario">Usuario</div>
            <div className="col-fecha">Fecha/Hora</div>
          </div>
          {actividadReciente.map((actividad) => (
            <div key={actividad.id} className="tabla-fila">
              <div className="col-tipo">
                <span className={`tipo-badge ${actividad.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                  {actividad.tipo}
                </span>
              </div>
              <div className="col-descripcion">{actividad.descripcion}</div>
              <div className="col-usuario">{actividad.usuario}</div>
              <div className="col-fecha">{actividad.fecha}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sistema-info">
        <div className="seccion-header">
          <h3>ℹ️ Información del Sistema</h3>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <label>Versión del Sistema</label>
            <p>v1.0.0</p>
          </div>
          <div className="info-item">
            <label>Base de Datos</label>
            <p>PostgreSQL 14.x</p>
          </div>
          <div className="info-item">
            <label>Última Actualización</label>
            <p>2026-09-15</p>
          </div>
          <div className="info-item">
            <label>Servidor</label>
            <p>Online - 99.9% uptime</p>
          </div>
        </div>
      </div>
    </div>
  )
}
