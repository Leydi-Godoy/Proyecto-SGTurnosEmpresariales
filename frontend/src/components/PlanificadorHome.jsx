import { useEffect, useState } from 'react'

export default function PlanificadorHome({ onLogout }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    mallasActivas: 0,
    turnosPorAsignar: 0,
    coberturaPromedio: 0,
    empleadosActivos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Obtener usuario del localStorage
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (!userData || !token) {
          setError('No hay sesión activa')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Traer plantillas de turno (mallas activas)
        const plantillasRes = await fetch(
          `http://localhost:3001/api/plantillas-turno?empresa_id=${parsedUser.empresa_id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        
        // Traer instancias de turnos
        const turnosRes = await fetch(
          `http://localhost:3001/api/turnos?empresa_id=${parsedUser.empresa_id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )

        const plantillasData = await plantillasRes.json()
        const turnosData = await turnosRes.json()

        // Calcular estadísticas
        const mallasActivas = Array.isArray(plantillasData?.plantillas) ? plantillasData.plantillas.length : 0
        const turnosPorAsignar = Array.isArray(turnosData) ? turnosData.length : 0
        
        setStats({
          mallasActivas,
          turnosPorAsignar,
          coberturaPromedio: turnosPorAsignar > 0 ? 85 : 0, // Mantener por ahora
          empleadosActivos: 18, // TODO: Traer de API empleados
        })

      } catch (err) {
        console.error('Error loading data:', err)
        setError('Error cargando datos')
        // Fallback a datos por defecto si hay error
        setStats({
          mallasActivas: 0,
          turnosPorAsignar: 0,
          coberturaPromedio: 0,
          empleadosActivos: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <section className="panel"><p className="loading-message">Cargando...</p></section>

  if (error && !user) return (
    <section className="panel">
      <p className="error-message">{error}</p>
      <button onClick={onLogout}>Volver al login</button>
    </section>
  )

  return (
    <section className="panel planificador-home">
      <div className="home-header">
        <div className="welcome-section">
          <h1>Hola, {user?.nombre || 'Planificador'}</h1>
          <p className="subtitle">Panel de Planificación de Turnos</p>
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
          <p className="company-sigla">{user?.empresa_sigla}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-label">Mallas Activas</span>
            <strong className="stat-value">{stats.mallasActivas}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Turnos por Asignar</span>
            <strong className="stat-value">{stats.turnosPorAsignar}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Cobertura Promedio</span>
            <strong className="stat-value">{stats.coberturaPromedio}%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Empleados Activos</span>
            <strong className="stat-value">{stats.empleadosActivos}</strong>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="action-buttons">
          <button className="quick-action-btn">
            <span className="action-icon">➕</span>
            Nueva Malla
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">⚡</span>
            Asignar Turnos
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📊</span>
            Ver Reportes
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🔄</span>
            Auto-Asignación
          </button>
        </div>
      </div>

      <div className="info-box">
        <h3>ℹ️ Recordatorio</h3>
        <p>
          Como Planificador, tienes acceso a crear y editar mallas de turnos, 
          asignar turnos a empleados, y generar reportes de cobertura.
        </p>
      </div>
    </section>
  )
}
