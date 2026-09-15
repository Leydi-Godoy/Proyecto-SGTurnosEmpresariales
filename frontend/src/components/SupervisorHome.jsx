import { useEffect, useState } from 'react'

export default function SupervisorHome({ onLogout }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    novedadesPendientes: 0,
    empleadosActivos: 0,
    coberturaHoy: 0,
    ausenciasHoy: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // TODO: Cargar estadísticas reales cuando API esté disponible
    setStats({
      novedadesPendientes: 5,
      empleadosActivos: 12,
      coberturaHoy: 95,
      ausenciasHoy: 2,
    })
    setLoading(false)
  }, [])

  if (loading) return <section className="panel"><p className="loading-message">Cargando...</p></section>

  return (
    <section className="panel supervisor-home">
      <div className="home-header">
        <div className="welcome-section">
          <h1>Hola, {user?.primer_nombre || 'Supervisor'}</h1>
          <p className="subtitle">Panel de Supervisión de Equipo</p>
        </div>
        <button className="button-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="company-section">
        {user?.empresa_logo && (
          <img src={user.empresa_logo} alt="Logo" className="company-logo" />
        )}
        <div>
          <p className="company-name">{user?.empresa_nombre || 'Empresa'}</p>
          <p className="company-area">Área: {user?.area_nombre || 'Sin asignar'}</p>
        </div>
      </div>

      <div className="stats-grid supervisor-stats">
        <div className="stat-card urgent">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Novedades Pendientes</span>
            <strong className="stat-value">{stats.novedadesPendientes}</strong>
            <p className="stat-action">Requieren aprobación</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Empleados Activos</span>
            <strong className="stat-value">{stats.empleadosActivos}</strong>
            <p className="stat-action">En tu área hoy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Cobertura Hoy</span>
            <strong className="stat-value">{stats.coberturaHoy}%</strong>
            <p className="stat-action">{stats.coberturaHoy >= 90 ? '✓ Óptima' : '⚠️ Baja'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <span className="stat-label">Ausencias Hoy</span>
            <strong className="stat-value">{stats.ausenciasHoy}</strong>
            <p className="stat-action">Permiso/Incapacidad</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="action-buttons">
          <button className="quick-action-btn urgent">
            <span className="action-icon">✅</span>
            Aprobar Novedades
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">👥</span>
            Ver Mi Equipo
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📊</span>
            Ver Reportes
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📅</span>
            Cobertura Semana
          </button>
        </div>
      </div>

      <div className="info-box">
        <h3>ℹ️ Tu Rol</h3>
        <p>
          Como Supervisor, eres responsable de aprobar solicitudes de tu equipo (cambios de turno, 
          permisos, incapacidades, licencias), monitorear la cobertura y generar reportes 
          de disponibilidad y ausencias.
        </p>
      </div>
    </section>
  )
}
